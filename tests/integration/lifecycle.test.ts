import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { convertQuotationToSubscription } from "@/services/subscription-service";
import { billSubscriptionPeriod } from "@/services/billing-service";
import { recordPayment } from "@/services/payment-service";
import { validateAndCalculateDiscount } from "@/services/discount-service";
import Decimal from "decimal.js";

describe("Brightloop End-to-End Subscription & Invoicing Lifecycle", () => {
  let customerId: string;
  let planId: string;
  let productId: string;
  let quotationId: string;
  let createdSubscriptionId: string;
  let generatedInvoiceId: string;

  beforeAll(async () => {
    // 1. Fetch or create a test customer
    let cust = await prisma.customerProfile.findFirst({
      where: { email: "test.lifecycle@brightloop.io" },
    });
    if (!cust) {
      cust = await prisma.customerProfile.create({
        data: {
          customerNumber: `CUST-TEST-${Date.now()}`,
          companyName: "Lifecycle Test Labs",
          contactName: "Dr. Lifecycle",
          email: "test.lifecycle@brightloop.io",
          currency: "INR",
        },
      });
    }
    customerId = cust.id;

    // 2. Fetch a seeded plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { active: true },
    });
    if (!plan) throw new Error("No active plan found");
    planId = plan.id;

    // 3. Fetch a seeded product
    const product = await prisma.product.findFirst({
      where: { active: true },
    });
    if (!product) throw new Error("No active product found");
    productId = product.id;
  });

  it("1. Should create a valid quotation with calculated totals", async () => {
    const qNum = `QUO-TEST-${Date.now()}`;
    const expiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: qNum,
        customerId,
        planId,
        status: "ACCEPTED",
        issueDate: new Date(),
        expiryDate: expiry,
        subtotal: new Decimal("4999.00"),
        taxTotal: new Decimal("899.82"),
        discountTotal: new Decimal("0.00"),
        grandTotal: new Decimal("5898.82"),
        lines: {
          create: [
            {
              productId,
              description: "Test Suite License",
              quantity: 1,
              unitPrice: new Decimal("4999.00"),
              taxRate: new Decimal("18.00"),
              taxAmount: new Decimal("899.82"),
              lineTotal: new Decimal("5898.82"),
            },
          ],
        },
      },
    });

    expect(quotation).toBeDefined();
    expect(quotation.status).toBe("ACCEPTED");
    quotationId = quotation.id;
  });

  it("2. Should convert quotation into subscription idempotently", async () => {
    expect(quotationId).toBeDefined();
    const sub1 = await convertQuotationToSubscription(quotationId);
    expect(sub1).toBeDefined();
    expect(sub1.status).toBe("ACTIVE");
    expect(sub1.quotationId).toBe(quotationId);
    createdSubscriptionId = sub1.id;

    // Converting again should return the exact same subscription without creating duplicates
    const sub2 = await convertQuotationToSubscription(quotationId);
    expect(sub2.id).toBe(sub1.id);
  });

  it("3. Should generate a first billing invoice and enforce idempotency", async () => {
    expect(createdSubscriptionId).toBeDefined();
    // Set nextBillingDate to yesterday to simulate due billing
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.subscription.update({
      where: { id: createdSubscriptionId },
      data: { nextBillingDate: yesterday },
    });

    const runResult = await billSubscriptionPeriod(createdSubscriptionId);

    expect(runResult.success).toBe(true);
    expect(runResult.invoiceId).toBeDefined();
    generatedInvoiceId = runResult.invoiceId!;

    const invoice = await prisma.invoice.findUnique({
      where: { id: generatedInvoiceId },
    });
    expect(invoice).toBeDefined();
    expect(invoice?.subscriptionId).toBe(createdSubscriptionId);
    expect(Number(invoice?.grandTotal)).toBeGreaterThan(0);
    expect(invoice?.status).toBe("CONFIRMED");

    // Re-running immediately must be idempotent (skipped: true, zero duplicates)
    const idempotentRun = await billSubscriptionPeriod(createdSubscriptionId);
    expect(idempotentRun.skipped).toBe(true);
  });

  it("4. Should record partial payment and settle invoice on second payment", async () => {
    expect(generatedInvoiceId).toBeDefined();
    const invoice = await prisma.invoice.findUnique({
      where: { id: generatedInvoiceId },
    });
    if (!invoice) throw new Error("Invoice not found");

    const halfAmount = new Decimal(invoice.grandTotal).dividedBy(2).toDecimalPlaces(2);

    // 1st Partial Payment
    const payment1 = await recordPayment({
      invoiceId: invoice.id,
      amount: halfAmount,
      paymentMethod: "UPI",
      externalReference: "UPI-TEST-001",
    });

    expect(payment1).toBeDefined();
    const invAfterP1 = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(invAfterP1?.status).toBe("PARTIALLY_PAID");
    expect(Number(invAfterP1?.outstandingAmount)).toBeGreaterThan(0);

    // 2nd Payment for Remaining Balance
    const remainingAmount = new Decimal(invAfterP1!.outstandingAmount);
    const payment2 = await recordPayment({
      invoiceId: invoice.id,
      amount: remainingAmount,
      paymentMethod: "BANK_TRANSFER",
      externalReference: "NEFT-TEST-002",
    });

    expect(payment2).toBeDefined();
    const invAfterP2 = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(invAfterP2?.status).toBe("PAID");
    expect(Number(invAfterP2?.outstandingAmount)).toBe(0);
  });

  it("5. Should validate discount coupon rules and enforce caps", async () => {
    // Validate seeded LAUNCH20 discount code
    const res = await validateAndCalculateDiscount({
      discountCode: "LAUNCH20",
      customerId,
      subtotal: "5000",
      planId,
    });

    expect(res.isValid).toBe(true);
    expect(res.discountRule?.discountCode).toBe("LAUNCH20");
    expect(res.discountRule?.calculatedDiscount.toString()).toBe("1000"); // 20% of 5000
  });
});
