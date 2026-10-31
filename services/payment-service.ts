import { prisma } from "@/lib/db/prisma";
import { calculateOutstandingBalance } from "@/lib/calculations/financial";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import Decimal from "decimal.js";

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number | string | Decimal;
  paymentMethod: PaymentMethod;
  paymentDate?: Date;
  externalReference?: string;
  notes?: string;
  recordedByUserId?: string;
}

export async function recordPayment(input: RecordPaymentInput) {
  let payAmount: Decimal;
  try {
    payAmount = new Decimal(input.amount);
  } catch {
    throw new Error("Invalid payment amount.");
  }
  if (payAmount.isNaN() || payAmount.lessThanOrEqualTo(0)) {
    throw new Error("Payment amount must be greater than zero.");
  }

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    if (invoice.status === "CANCELLED") {
      throw new Error("Cannot record payments against a cancelled invoice.");
    }

    if (invoice.status === "DRAFT") {
      throw new Error("Cannot record payments against a draft invoice. Please confirm the invoice first.");
    }

    const currentPaid = new Decimal(invoice.amountPaid);
    const grandTotal = new Decimal(invoice.grandTotal);
    const outstanding = new Decimal(invoice.outstandingAmount);

    if (outstanding.isZero()) {
      throw new Error("This invoice is already fully paid.");
    }

    if (payAmount.greaterThan(outstanding)) {
      throw new Error(
        `Payment amount (${payAmount.toString()}) exceeds the outstanding invoice balance (${outstanding.toString()}).`
      );
    }

    const newAmountPaid = currentPaid.plus(payAmount).toDecimalPlaces(2);
    const balanceResult = calculateOutstandingBalance(grandTotal, newAmountPaid);

    const newStatus = balanceResult.isFullyPaid ? "PAID" : "PARTIALLY_PAID";

    // Generate unique payment reference
    const payCount = await tx.payment.count();
    const paymentReference = `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(4, "0")}-${Date.now().toString().slice(-4)}`;

    // Create payment record
    const payment = await tx.payment.create({
      data: {
        paymentReference,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        amount: payAmount.toDecimalPlaces(2),
        paymentMethod: input.paymentMethod,
        paymentDate: input.paymentDate || new Date(),
        externalReference: input.externalReference,
        notes: input.notes,
        recordedByUserId: input.recordedByUserId,
        status: "COMPLETED",
      },
      include: {
        customer: true,
        invoice: true,
      },
    });

    // Update invoice balance and status
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid,
        outstandingAmount: balanceResult.outstandingAmount,
        status: newStatus,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        entityType: "PAYMENT",
        entityId: payment.id,
        action: "RECORDED",
        performedByUserId: input.recordedByUserId,
        details: JSON.stringify({
          paymentReference: payment.paymentReference,
          invoiceNumber: invoice.invoiceNumber,
          amount: payAmount.toString(),
          method: input.paymentMethod,
          remainingBalance: balanceResult.outstandingAmount.toString(),
          invoiceStatus: newStatus,
        }),
      },
    });

    // Customer Notification
    await tx.notification.create({
      data: {
        customerId: invoice.customerId,
        title: "Payment Received",
        message: `Payment of ${payAmount.toString()} ${invoice.currency} received for invoice ${invoice.invoiceNumber}. Remaining balance: ${balanceResult.outstandingAmount.toString()} ${invoice.currency}.`,
        notificationType: "PAYMENT_RECEIVED",
        linkUrl: `/portal/invoices/${invoice.id}`,
      },
    });

    return payment;
  });
}
