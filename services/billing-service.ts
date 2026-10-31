import { prisma } from "@/lib/db/prisma";
import { calculateNextBillingDate, isSubscriptionDueForBilling } from "@/lib/dates/billing-dates";
import { calculateDocumentTotals } from "@/lib/calculations/financial";
import { addDays } from "date-fns";
import Decimal from "decimal.js";

export interface BillingPreviewItem {
  subscriptionId: string;
  subscriptionNumber: string;
  customerName: string;
  customerId: string;
  planName: string;
  billingInterval: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
  prospectiveNextBillingDate: Date;
}

/**
 * Preview which subscriptions are due for billing and what the invoices will look like without modifying the DB.
 */
export async function previewDueBilling(asOfDate: Date = new Date()): Promise<BillingPreviewItem[]> {
  const eligibleSubs = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      nextBillingDate: {
        lte: asOfDate,
      },
    },
    include: {
      customer: true,
      plan: true,
      lines: true,
    },
    orderBy: {
      nextBillingDate: "asc",
    },
  });

  const previews: BillingPreviewItem[] = [];

  for (const sub of eligibleSubs) {
    const periodStart = new Date(sub.nextBillingDate);
    const periodEnd = calculateNextBillingDate({
      currentBillingDate: periodStart,
      interval: sub.billingInterval,
      intervalCount: sub.billingIntervalCount,
    });

    const linesInput = sub.lines.map((l) => ({
      quantity: l.quantity,
      unitPrice: l.agreedUnitPrice,
      discountAmount: l.discountAmount,
      taxRate: l.taxRate,
    }));

    const totals = calculateDocumentTotals({ lines: linesInput });

    previews.push({
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      customerName: sub.customer.companyName,
      customerId: sub.customerId,
      planName: sub.plan.name,
      billingInterval: sub.billingInterval,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      subtotal: totals.subtotal.toString(),
      discountTotal: totals.discountTotal.toString(),
      taxTotal: totals.taxTotal.toString(),
      grandTotal: totals.grandTotal.toString(),
      prospectiveNextBillingDate: periodEnd,
    });
  }

  return previews;
}

export interface BillingResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  subscriptionId: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Generates an invoice for a specific subscription and period in an atomic, idempotent transaction.
 */
export async function billSubscriptionPeriod(
  subscriptionId: string,
  asOfDate: Date = new Date()
): Promise<BillingResult> {
  return prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    if (!sub) {
      return {
        success: false,
        subscriptionId,
        error: "Subscription not found.",
      };
    }

    if (sub.status !== "ACTIVE") {
      return {
        success: false,
        subscriptionId,
        error: `Subscription is not active (Status: ${sub.status}).`,
      };
    }

    if (new Date(sub.nextBillingDate) > asOfDate) {
      return {
        success: true,
        skipped: true,
        subscriptionId: sub.id,
        error: "Subscription is not yet due for billing.",
      };
    }

    const periodStart = new Date(sub.nextBillingDate);
    const periodEnd = calculateNextBillingDate({
      currentBillingDate: periodStart,
      interval: sub.billingInterval,
      intervalCount: sub.billingIntervalCount,
    });

    // Idempotency: verify if invoice already exists for this subscription and period
    const existingInvoice = await tx.invoice.findFirst({
      where: {
        subscriptionId: sub.id,
        billingPeriodStart: periodStart,
      },
    });

    if (existingInvoice) {
      await tx.billingAttempt.create({
        data: {
          subscriptionId: sub.id,
          billingDate: periodStart,
          status: "SKIPPED",
          invoiceId: existingInvoice.id,
          failureReason: "Invoice already generated for this billing period.",
        },
      });

      return {
        success: true,
        skipped: true,
        subscriptionId: sub.id,
        invoiceId: existingInvoice.id,
        invoiceNumber: existingInvoice.invoiceNumber,
      };
    }

    // Calculate totals
    const linesInput = sub.lines.map((l) => ({
      quantity: l.quantity,
      unitPrice: l.agreedUnitPrice,
      discountAmount: l.discountAmount,
      taxRate: l.taxRate,
    }));
    const totals = calculateDocumentTotals({ lines: linesInput });

    // Calculate due date based on payment terms
    let dueDays = 0;
    if (sub.paymentTerms.toLowerCase().includes("15")) dueDays = 15;
    else if (sub.paymentTerms.toLowerCase().includes("30")) dueDays = 30;
    else if (sub.paymentTerms.toLowerCase().includes("7")) dueDays = 7;
    const dueDate = addDays(new Date(), dueDays);

    // Generate unique invoice number
    const count = await tx.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}-${Date.now().toString().slice(-4)}`;

    // Create invoice and lines
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        issueDate: new Date(),
        dueDate,
        status: "CONFIRMED",
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        grandTotal: totals.grandTotal,
        amountPaid: new Decimal(0),
        outstandingAmount: totals.grandTotal,
        currency: sub.customer.currency || "INR",
        paymentTerms: sub.paymentTerms,
        notes: `Recurring billing for ${sub.plan.name} (${sub.billingInterval.toLowerCase()})`,
        lines: {
          create: sub.lines.map((line) => {
            const lineSubtotal = new Decimal(line.agreedUnitPrice).times(line.quantity);
            const lineDiscount = new Decimal(line.discountAmount || 0);
            const netSub = Decimal.max(0, lineSubtotal.minus(lineDiscount));
            const taxAmount = line.taxRate
              ? netSub.times(new Decimal(line.taxRate)).dividedBy(100).toDecimalPlaces(2)
              : new Decimal(0);
            const lineTotal = netSub.plus(taxAmount).toDecimalPlaces(2);

            return {
              productId: line.productId,
              variantId: line.variantId,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.agreedUnitPrice,
              discountAmount: lineDiscount,
              taxRate: line.taxRate,
              taxAmount,
              lineTotal,
            };
          }),
        },
      },
    });

    // Advance next billing date and update last billing date
    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        lastBillingDate: periodStart,
        nextBillingDate: periodEnd,
      },
    });

    // Record billing attempt
    await tx.billingAttempt.create({
      data: {
        subscriptionId: sub.id,
        billingDate: periodStart,
        status: "SUCCESS",
        invoiceId: invoice.id,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        entityType: "INVOICE",
        entityId: invoice.id,
        action: "GENERATED_RECURRING_BILLING",
        details: JSON.stringify({
          subscriptionNumber: sub.subscriptionNumber,
          invoiceNumber: invoice.invoiceNumber,
          grandTotal: totals.grandTotal.toString(),
          billingPeriod: `${periodStart.toISOString()} to ${periodEnd.toISOString()}`,
        }),
      },
    });

    // Notification for customer
    await tx.notification.create({
      data: {
        customerId: sub.customerId,
        title: "New Invoice Issued",
        message: `Invoice ${invoice.invoiceNumber} for ${totals.grandTotal.toString()} ${sub.customer.currency} is ready.`,
        notificationType: "INVOICE_GENERATED",
        linkUrl: `/portal/invoices/${invoice.id}`,
      },
    });

    return {
      success: true,
      subscriptionId: sub.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    };
  });
}

/**
 * Executes recurring billing for all due active subscriptions with batch error handling.
 */
export async function executeRecurringBillingBatch(asOfDate: Date = new Date()): Promise<{
  totalEligible: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: BillingResult[];
}> {
  const dueSubs = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      nextBillingDate: {
        lte: asOfDate,
      },
    },
    select: { id: true },
  });

  const results: BillingResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of dueSubs) {
    try {
      const res = await billSubscriptionPeriod(item.id, asOfDate);
      results.push(res);
      if (res.skipped) {
        skipped++;
      } else if (res.success) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (err: unknown) {
      failed++;
      const errorMessage = err instanceof Error ? err.message : "Unknown billing error";
      results.push({
        success: false,
        subscriptionId: item.id,
        error: errorMessage,
      });

      // Record failed billing attempt
      await prisma.billingAttempt.create({
        data: {
          subscriptionId: item.id,
          billingDate: new Date(),
          status: "FAILED",
          failureReason: errorMessage,
        },
      });
    }
  }

  return {
    totalEligible: dueSubs.length,
    succeeded,
    failed,
    skipped,
    results,
  };
}
