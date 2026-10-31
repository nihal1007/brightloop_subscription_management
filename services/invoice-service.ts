import { prisma } from "@/lib/db/prisma";
import { calculateDocumentTotals } from "@/lib/calculations/financial";
import { addDays, isBefore, startOfDay } from "date-fns";
import Decimal from "decimal.js";

export interface CreateManualInvoiceInput {
  customerId: string;
  subscriptionId?: string;
  dueDate?: Date;
  paymentTerms?: string;
  notes?: string;
  lines: Array<{
    productId?: string;
    variantId?: string;
    description: string;
    quantity: number;
    unitPrice: number | string | Decimal;
    discountAmount?: number | string | Decimal;
    taxRate?: number | string | Decimal;
  }>;
  performedByUserId?: string;
}

export async function createManualInvoice(input: CreateManualInvoiceInput) {
  if (!input.lines || input.lines.length === 0) {
    throw new Error("An invoice must contain at least one line item.");
  }

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customerProfile.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) throw new Error("Customer not found.");

    const linesInput = input.lines.map((l) => ({
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      discountAmount: l.discountAmount || 0,
      taxRate: l.taxRate || 0,
    }));

    const totals = calculateDocumentTotals({ lines: linesInput });

    const invCount = await tx.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(5, "0")}`;
    const dueDate = input.dueDate || addDays(new Date(), 15);

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        subscriptionId: input.subscriptionId,
        issueDate: new Date(),
        dueDate,
        status: "CONFIRMED",
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        grandTotal: totals.grandTotal,
        amountPaid: new Decimal(0),
        outstandingAmount: totals.grandTotal,
        currency: customer.currency || "INR",
        paymentTerms: input.paymentTerms || "Net 15",
        notes: input.notes,
        lines: {
          create: input.lines.map((l) => {
            const sub = new Decimal(l.unitPrice).times(l.quantity);
            const disc = new Decimal(l.discountAmount || 0);
            const netSub = Decimal.max(0, sub.minus(disc));
            const taxAmt = l.taxRate
              ? netSub.times(new Decimal(l.taxRate)).dividedBy(100).toDecimalPlaces(2)
              : new Decimal(0);
            const lineTotal = netSub.plus(taxAmt).toDecimalPlaces(2);

            return {
              productId: l.productId,
              variantId: l.variantId,
              description: l.description,
              quantity: l.quantity,
              unitPrice: new Decimal(l.unitPrice).toDecimalPlaces(2),
              discountAmount: disc.toDecimalPlaces(2),
              taxRate: new Decimal(l.taxRate || 0).toDecimalPlaces(2),
              taxAmount: taxAmt,
              lineTotal,
            };
          }),
        },
      },
      include: {
        lines: true,
        customer: true,
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "INVOICE",
        entityId: invoice.id,
        action: "CREATED_MANUAL",
        performedByUserId: input.performedByUserId,
        details: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          grandTotal: totals.grandTotal.toString(),
        }),
      },
    });

    return invoice;
  });
}

export async function cancelInvoice(invoiceId: string, reason: string, performedByUserId?: string) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) throw new Error("Invoice not found.");
    if (invoice.status === "CANCELLED") return invoice;

    if (new Decimal(invoice.amountPaid).greaterThan(0)) {
      throw new Error(
        "Cannot cancel an invoice with recorded payments. Please refund or reverse the payments first."
      );
    }

    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "CANCELLED",
        notes: invoice.notes ? `${invoice.notes} | Cancelled: ${reason}` : `Cancelled: ${reason}`,
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "INVOICE",
        entityId: invoiceId,
        action: "CANCELLED",
        performedByUserId,
        details: JSON.stringify({ reason }),
      },
    });

    return updated;
  });
}

/**
 * Determines effective status including OVERDUE check
 */
export function getEffectiveInvoiceStatus(
  status: string,
  dueDate: Date,
  outstandingAmount: Decimal | number | string
): string {
  if (status === "PAID" || status === "CANCELLED" || status === "DRAFT") {
    return status;
  }
  const outstanding = new Decimal(outstandingAmount || 0);
  if (outstanding.isZero()) {
    return "PAID";
  }

  const now = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  if (isBefore(due, now)) {
    return "OVERDUE";
  }

  return status;
}
