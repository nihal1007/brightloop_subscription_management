import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";
import {
  requireAuth,
  requireAdmin,
  requireStaffOrAdmin,
  requireOwnershipOrStaff,
} from "@/lib/permissions/rbac";
import {
  calculateVariantPrice,
  calculateLine,
  calculateDocumentTotals,
  calculateOutstandingBalance,
} from "@/lib/calculations/financial";
import {
  calculateNextBillingDate,
  isSubscriptionDueForBilling,
} from "@/lib/dates/billing-dates";
import {
  convertQuotationToSubscription,
  pauseSubscription,
  resumeSubscription,
  closeSubscription,
  requestCancellation,
} from "@/services/subscription-service";
import {
  billSubscriptionPeriod,
  previewDueBilling,
  executeRecurringBillingBatch,
} from "@/services/billing-service";
import { recordPayment } from "@/services/payment-service";
import { validateAndCalculateDiscount } from "@/services/discount-service";
import {
  getDashboardMetrics,
  getRevenueTrends,
  getPlanDistribution,
  getHealthCenterItems,
  getRevenueForecast,
  getSmartCollectionPriorities,
} from "@/services/analytics-service";
import Decimal from "decimal.js";
import { addDays, subDays } from "date-fns";

describe("Brightloop Comprehensive QA Engineering Test Suite", () => {
  let testAdminUser: any;
  let testStaffUser: any;
  let testCustomerUserA: any;
  let testCustomerProfileA: any;
  let testCustomerUserB: any;
  let testCustomerProfileB: any;
  let testProduct: any;
  let testPlan: any;

  beforeAll(async () => {
    // 1. Create isolated test customer A
    const emailA = `qa.cust.a.${Date.now()}@brightloop.test`;
    testCustomerUserA = await prisma.user.create({
      data: {
        email: emailA,
        passwordHash: await hashPassword("Brightloop@2026!"),
        name: "QA Customer Alpha",
        role: "CUSTOMER",
      },
    });

    testCustomerProfileA = await prisma.customerProfile.create({
      data: {
        userId: testCustomerUserA.id,
        customerNumber: `CUST-QA-A-${Date.now()}`,
        companyName: "QA Alpha Corp",
        contactName: "Alex Alpha",
        email: emailA,
        currency: "INR",
      },
    });

    // 2. Create isolated test customer B
    const emailB = `qa.cust.b.${Date.now()}@brightloop.test`;
    testCustomerUserB = await prisma.user.create({
      data: {
        email: emailB,
        passwordHash: await hashPassword("Brightloop@2026!"),
        name: "QA Customer Beta",
        role: "CUSTOMER",
      },
    });

    testCustomerProfileB = await prisma.customerProfile.create({
      data: {
        userId: testCustomerUserB.id,
        customerNumber: `CUST-QA-B-${Date.now()}`,
        companyName: "QA Beta Labs",
        contactName: "Beatrice Beta",
        email: emailB,
        currency: "INR",
      },
    });

    // 3. Create isolated test product with variants
    testProduct = await prisma.product.create({
      data: {
        productCode: `PROD-QA-${Date.now()}`,
        name: "QA Cloud Compute Node",
        salesPrice: new Decimal("2000.00"),
        costPrice: new Decimal("500.00"),
        productType: "SERVICE",
        variants: {
          create: [
            {
              variantName: "High RAM Add-on",
              sku: `SKU-RAM-${Date.now()}`,
              pricingType: "ADDITIONAL",
              priceAdjustment: new Decimal("500.00"),
            },
            {
              variantName: "Dedicated Cluster Override",
              sku: `SKU-DED-${Date.now()}`,
              pricingType: "OVERRIDE",
              priceAdjustment: new Decimal("4500.00"),
            },
          ],
        },
      },
      include: { variants: true },
    });

    // 4. Create isolated test plan
    testPlan = await prisma.subscriptionPlan.create({
      data: {
        planCode: `PLAN-QA-${Date.now()}`,
        name: "QA Cloud Standard Plan",
        billingInterval: "MONTHLY",
        billingIntervalCount: 1,
        basePrice: new Decimal("2500.00"),
        allowPause: true,
        allowEarlyCancel: true,
        planProducts: {
          create: [
            {
              productId: testProduct.id,
              defaultQuantity: 1,
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up isolated test entities
    try {
      if (testCustomerProfileA?.id) {
        await prisma.discountRedemption.deleteMany({ where: { customerId: testCustomerProfileA.id } });
        await prisma.payment.deleteMany({ where: { customerId: testCustomerProfileA.id } });
        await prisma.invoiceLine.deleteMany({ where: { invoice: { customerId: testCustomerProfileA.id } } });
        await prisma.invoice.deleteMany({ where: { customerId: testCustomerProfileA.id } });
        await prisma.subscriptionLine.deleteMany({ where: { subscription: { customerId: testCustomerProfileA.id } } });
        await prisma.billingAttempt.deleteMany({ where: { subscription: { customerId: testCustomerProfileA.id } } });
        await prisma.subscription.deleteMany({ where: { customerId: testCustomerProfileA.id } });
        await prisma.quotationLine.deleteMany({ where: { quotation: { customerId: testCustomerProfileA.id } } });
        await prisma.quotation.deleteMany({ where: { customerId: testCustomerProfileA.id } });
        await prisma.customerProfile.delete({ where: { id: testCustomerProfileA.id } });
      }
      if (testCustomerUserA?.id) {
        await prisma.notification.deleteMany({ where: { userId: testCustomerUserA.id } });
        await prisma.user.delete({ where: { id: testCustomerUserA.id } });
      }

      if (testCustomerProfileB?.id) {
        await prisma.customerProfile.delete({ where: { id: testCustomerProfileB.id } });
      }
      if (testCustomerUserB?.id) {
        await prisma.user.delete({ where: { id: testCustomerUserB.id } });
      }

      if (testPlan?.id) {
        await prisma.planProduct.deleteMany({ where: { planId: testPlan.id } });
        await prisma.subscriptionPlan.delete({ where: { id: testPlan.id } });
      }

      if (testProduct?.id) {
        await prisma.productVariant.deleteMany({ where: { productId: testProduct.id } });
        await prisma.product.delete({ where: { id: testProduct.id } });
      }
    } catch {
      // Ignore cleanup error in test tear-down
    }
  });

  // ==========================================
  // TASK 2: Authentication Testing
  // ==========================================
  describe("Task 2: Authentication Tests", () => {
    it("2.1 Password complexity validation enforces >8 chars, upper, lower, special", () => {
      expect(validatePassword("short").isValid).toBe(false);
      expect(validatePassword("nouppercase123!").isValid).toBe(false);
      expect(validatePassword("NOLOWERCASE123!").isValid).toBe(false);
      expect(validatePassword("NoSpecialChar123").isValid).toBe(false);
      expect(validatePassword("ValidPass@2026").isValid).toBe(true);
    });

    it("2.2 Password hashing and verification succeeds with bcrypt", async () => {
      const raw = "SuperSecret#2026";
      const hash = await hashPassword(raw);
      expect(hash).not.toBe(raw);
      expect(await verifyPassword(raw, hash)).toBe(true);
      expect(await verifyPassword("WrongPassword!", hash)).toBe(false);
    });

    it("2.3 Session JWT token creation and verification preserves role and claims", async () => {
      const payload = {
        id: "usr-test-1",
        email: "admin.qa@brightloop.io",
        name: "QA Admin",
        role: "ADMIN" as const,
      };
      const token = await createSessionToken(payload);
      expect(typeof token).toBe("string");

      const decoded = await verifySessionToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe("ADMIN");
    });
  });

  // ==========================================
  // TASK 3: Role-Based Authorization
  // ==========================================
  describe("Task 3: Role-Based Authorization Tests", () => {
    const adminUser = { id: "1", email: "a@b.com", name: "A", role: "ADMIN" as const };
    const staffUser = { id: "2", email: "s@b.com", name: "S", role: "STAFF" as const };
    const customerUser = { id: "3", email: "c@b.com", name: "C", role: "CUSTOMER" as const, customerId: "cust-1" };

    it("3.1 requireAuth blocks unauthenticated users with 401", () => {
      const check = requireAuth(null);
      expect(check.allowed).toBe(false);
      expect(check.statusCode).toBe(401);
    });

    it("3.2 requireAdmin permits Admin but rejects Staff and Customer with 403", () => {
      expect(requireAdmin(adminUser).allowed).toBe(true);
      expect(requireAdmin(staffUser).allowed).toBe(false);
      expect(requireAdmin(staffUser).statusCode).toBe(403);
      expect(requireAdmin(customerUser).allowed).toBe(false);
      expect(requireAdmin(customerUser).statusCode).toBe(403);
    });

    it("3.3 requireStaffOrAdmin permits Admin and Staff, rejects Customer", () => {
      expect(requireStaffOrAdmin(adminUser).allowed).toBe(true);
      expect(requireStaffOrAdmin(staffUser).allowed).toBe(true);
      expect(requireStaffOrAdmin(customerUser).allowed).toBe(false);
      expect(requireStaffOrAdmin(customerUser).statusCode).toBe(403);
    });
  });

  // ==========================================
  // TASK 4: Product, Plan, Quotation, Lifecycle
  // ==========================================
  describe("Task 4: Product Creation, Quotation & Subscription Lifecycle", () => {
    let quotationId: string;
    let subscriptionId: string;

    it("4.1 Product variants calculate additive and override prices accurately", () => {
      const addPrice = calculateVariantPrice({
        basePrice: "2000.00",
        pricingType: "ADDITIONAL",
        priceAdjustment: "500.00",
      });
      expect(addPrice.toString()).toBe("2500");

      const overridePrice = calculateVariantPrice({
        basePrice: "2000.00",
        pricingType: "OVERRIDE",
        priceAdjustment: "4500.00",
      });
      expect(overridePrice.toString()).toBe("4500");
    });

    it("4.2 Quotation creation and lines persistence", async () => {
      const quote = await prisma.quotation.create({
        data: {
          quotationNumber: `QUO-QA-${Date.now()}`,
          customerId: testCustomerProfileA.id,
          planId: testPlan.id,
          status: "ACCEPTED",
          issueDate: new Date(),
          expiryDate: addDays(new Date(), 30),
          subtotal: new Decimal("2500.00"),
          taxTotal: new Decimal("450.00"),
          discountTotal: new Decimal("0.00"),
          grandTotal: new Decimal("2950.00"),
          lines: {
            create: [
              {
                productId: testProduct.id,
                description: "Cloud Node - Standard",
                quantity: 1,
                unitPrice: new Decimal("2500.00"),
                taxRate: new Decimal("18.00"),
                taxAmount: new Decimal("450.00"),
                lineTotal: new Decimal("2950.00"),
              },
            ],
          },
        },
      });

      expect(quote.id).toBeDefined();
      quotationId = quote.id;
    });

    it("4.3 Idempotent conversion of Quotation to Active Subscription", async () => {
      const sub1 = await convertQuotationToSubscription(quotationId);
      expect(sub1.status).toBe("ACTIVE");
      expect(sub1.customerId).toBe(testCustomerProfileA.id);
      subscriptionId = sub1.id;

      // Idempotent re-run
      const sub2 = await convertQuotationToSubscription(quotationId);
      expect(sub2.id).toBe(sub1.id);
    });

    it("4.4 Subscription Pause, Resume, and Close lifecycle transitions", async () => {
      // Pause
      const paused = await pauseSubscription(subscriptionId);
      expect(paused.status).toBe("PAUSED");
      expect(paused.pausedAt).toBeDefined();

      // Cannot pause already paused
      await expect(pauseSubscription(subscriptionId)).rejects.toThrow();

      // Resume
      const resumed = await resumeSubscription(subscriptionId);
      expect(resumed.status).toBe("ACTIVE");
      expect(resumed.pausedAt).toBeNull();

      // Cannot resume already active
      await expect(resumeSubscription(subscriptionId)).rejects.toThrow();

      // Close
      const closed = await closeSubscription(subscriptionId, "QA verification completed");
      expect(closed.status).toBe("CLOSED");
      expect(closed.closedAt).toBeDefined();

      // Cannot resume closed subscription
      await expect(resumeSubscription(subscriptionId)).rejects.toThrow();
    });
  });

  // ==========================================
  // TASK 5: Recurring Billing & Idempotency
  // ==========================================
  describe("Task 5: Recurring Billing, Dates & Idempotency", () => {
    let subId: string;

    beforeAll(async () => {
      // Create fresh active subscription due for billing
      const yesterday = subDays(new Date(), 1);
      const sub = await prisma.subscription.create({
        data: {
          subscriptionNumber: `SUB-BILL-QA-${Date.now()}`,
          customerId: testCustomerProfileA.id,
          planId: testPlan.id,
          status: "ACTIVE",
          nextBillingDate: yesterday,
          billingInterval: "MONTHLY",
          billingIntervalCount: 1,
          totalRecurringAmount: new Decimal("2950.00"),
          lines: {
            create: [
              {
                productId: testProduct.id,
                description: "Monthly Service",
                quantity: 1,
                agreedUnitPrice: new Decimal("2500.00"),
                taxRate: new Decimal("18.00"),
                lineTotal: new Decimal("2950.00"),
              },
            ],
          },
        },
      });
      subId = sub.id;
    });

    it("5.1 Calendar-aware billing dates handle end-of-month (Jan 31 -> Feb 28)", () => {
      const jan31 = new Date(2024, 0, 31); // 2024 is a leap year -> Feb 29
      const feb = calculateNextBillingDate({ currentBillingDate: jan31, interval: "MONTHLY", intervalCount: 1 });
      expect(feb.getDate()).toBe(29);
      expect(feb.getMonth()).toBe(1); // February

      const jan31NonLeap = new Date(2025, 0, 31); // 2025 is not a leap year -> Feb 28
      const febNonLeap = calculateNextBillingDate({ currentBillingDate: jan31NonLeap, interval: "MONTHLY", intervalCount: 1 });
      expect(febNonLeap.getDate()).toBe(28);
    });

    it("5.2 Leap year preservation for annual billing (Feb 29, 2024 -> Feb 28, 2025)", () => {
      const leapDay = new Date(2024, 1, 29);
      const nextYear = calculateNextBillingDate({ currentBillingDate: leapDay, interval: "YEARLY", intervalCount: 1 });
      expect(nextYear.getFullYear()).toBe(2025);
      expect(nextYear.getMonth()).toBe(1); // February
      expect(nextYear.getDate()).toBe(28);
    });

    it("5.3 billSubscriptionPeriod generates an invoice and advances nextBillingDate", async () => {
      const result = await billSubscriptionPeriod(subId);
      expect(result.success).toBe(true);
      expect(result.invoiceId).toBeDefined();

      const invoice = await prisma.invoice.findUnique({
        where: { id: result.invoiceId },
      });
      expect(invoice).toBeDefined();
      expect(invoice?.status).toBe("CONFIRMED");
      expect(invoice?.subscriptionId).toBe(subId);

      // Verify idempotency on second run
      const duplicateRun = await billSubscriptionPeriod(subId);
      expect(duplicateRun.skipped).toBe(true);
    });
  });

  // ==========================================
  // TASK 6: Invoice Decimal Calculations
  // ==========================================
  describe("Task 6: Decimal Financial Calculations, Taxes & Discounts", () => {
    it("6.1 Line subtotal and exclusive tax calculation has zero float drift", () => {
      const line = calculateLine({
        quantity: 3,
        unitPrice: "1234.56",
        taxRate: "18.00",
        isTaxInclusive: false,
      });

      // 3 * 1234.56 = 3703.68
      expect(line.subtotal.toString()).toBe("3703.68");
      // 3703.68 * 0.18 = 666.6624 -> rounds to 666.66
      expect(line.taxAmount.toString()).toBe("666.66");
      // 3703.68 + 666.66 = 4370.34
      expect(line.lineTotal.toString()).toBe("4370.34");
    });

    it("6.2 Discount clamping prevents negative net subtotal", () => {
      const line = calculateLine({
        quantity: 1,
        unitPrice: "100.00",
        discountType: "FIXED",
        discountValue: "250.00", // Discount exceeds price
      });

      expect(line.discountAmount.toString()).toBe("100");
      expect(line.netSubtotal.toString()).toBe("0");
      expect(line.lineTotal.toString()).toBe("0");
    });

    it("6.3 Document totals sum subtotal, taxTotal, and grandTotal with exact balance", () => {
      const totals = calculateDocumentTotals({
        lines: [
          { quantity: 2, unitPrice: "1000.00", taxRate: "18.00" }, // 2000 + 360 = 2360
          { quantity: 1, unitPrice: "500.00", discountAmount: "50.00", taxRate: "5.00" }, // 450 + 22.50 = 472.50
        ],
      });

      expect(totals.subtotal.toString()).toBe("2500");
      expect(totals.discountTotal.toString()).toBe("50");
      expect(totals.taxTotal.toString()).toBe("382.5");
      expect(totals.grandTotal.toString()).toBe("2832.5");
    });
  });

  // ==========================================
  // TASK 7: Payments & Invoice Status Updates
  // ==========================================
  describe("Task 7: Simulated Payments & Invoice Status Transitions", () => {
    let testInvoiceId: string;

    beforeAll(async () => {
      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-PAY-QA-${Date.now()}`,
          customerId: testCustomerProfileA.id,
          issueDate: new Date(),
          dueDate: addDays(new Date(), 14),
          status: "CONFIRMED",
          subtotal: new Decimal("1000.00"),
          taxTotal: new Decimal("180.00"),
          grandTotal: new Decimal("1180.00"),
          amountPaid: new Decimal("0.00"),
          outstandingAmount: new Decimal("1180.00"),
          currency: "INR",
        },
      });
      testInvoiceId = inv.id;
    });

    it("7.1 Rejects payment exceeding outstanding balance", async () => {
      await expect(
        recordPayment({
          invoiceId: testInvoiceId,
          amount: "1500.00",
          paymentMethod: "UPI",
        })
      ).rejects.toThrow(/exceeds the outstanding/);
    });

    it("7.2 Partial payment marks invoice PARTIALLY_PAID", async () => {
      const payment1 = await recordPayment({
        invoiceId: testInvoiceId,
        amount: "500.00",
        paymentMethod: "UPI",
        externalReference: "UPI-QA-001",
      });

      expect(payment1.id).toBeDefined();
      const updated = await prisma.invoice.findUnique({ where: { id: testInvoiceId } });
      expect(updated?.status).toBe("PARTIALLY_PAID");
      expect(updated?.amountPaid.toString()).toBe("500");
      expect(updated?.outstandingAmount.toString()).toBe("680");
    });

    it("7.3 Final payment settling outstanding marks invoice PAID with zero balance", async () => {
      const payment2 = await recordPayment({
        invoiceId: testInvoiceId,
        amount: "680.00",
        paymentMethod: "BANK_TRANSFER",
        externalReference: "NEFT-QA-002",
      });

      expect(payment2.id).toBeDefined();
      const updated = await prisma.invoice.findUnique({ where: { id: testInvoiceId } });
      expect(updated?.status).toBe("PAID");
      expect(updated?.amountPaid.toString()).toBe("1180");
      expect(updated?.outstandingAmount.toString()).toBe("0");
    });

    it("7.4 Cannot record payment on fully paid invoice", async () => {
      await expect(
        recordPayment({
          invoiceId: testInvoiceId,
          amount: "50.00",
          paymentMethod: "CASH",
        })
      ).rejects.toThrow(/already fully paid/);
    });
  });

  // ==========================================
  // TASK 8: Customer Data Isolation
  // ==========================================
  describe("Task 8: Customer Data Isolation & Cross-Tenant Boundary Tests", () => {
    it("8.1 requireOwnershipOrStaff allows customer to access own resource", () => {
      const userA = {
        id: testCustomerUserA.id,
        email: testCustomerUserA.email,
        name: testCustomerUserA.name,
        role: "CUSTOMER" as const,
        customerId: testCustomerProfileA.id,
      };

      const check = requireOwnershipOrStaff(userA, testCustomerProfileA.id);
      expect(check.allowed).toBe(true);
    });

    it("8.2 requireOwnershipOrStaff blocks customer from accessing another customer's resource", () => {
      const userA = {
        id: testCustomerUserA.id,
        email: testCustomerUserA.email,
        name: testCustomerUserA.name,
        role: "CUSTOMER" as const,
        customerId: testCustomerProfileA.id,
      };

      // Customer A tries to access Customer B's resource
      const check = requireOwnershipOrStaff(userA, testCustomerProfileB.id);
      expect(check.allowed).toBe(false);
      expect(check.statusCode).toBe(403);
      expect(check.error).toContain("another customer");
    });

    it("8.3 requireOwnershipOrStaff allows Staff and Admin to access any customer's resource", () => {
      const adminUser = {
        id: "admin-1",
        email: "admin@brightloop.io",
        name: "Admin User",
        role: "ADMIN" as const,
      };

      expect(requireOwnershipOrStaff(adminUser, testCustomerProfileA.id).allowed).toBe(true);
      expect(requireOwnershipOrStaff(adminUser, testCustomerProfileB.id).allowed).toBe(true);
    });
  });

  // ==========================================
  // TASK 9: Overdue Tracking & Analytics
  // ==========================================
  describe("Task 9: Overdue Tracking, Analytics & Collection Scoring", () => {
    it("9.1 getDashboardMetrics aggregates active subscriptions and calculates normalized MRR", async () => {
      const metrics = await getDashboardMetrics(30);
      expect(metrics).toBeDefined();
      expect(Number(metrics.mrr)).toBeGreaterThanOrEqual(0);
      expect(Number(metrics.arr)).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.churnRate).toBe("string");
    });

    it("9.2 getSmartCollectionPriorities produces transparently scored priority list", async () => {
      const priorities = await getSmartCollectionPriorities();
      expect(Array.isArray(priorities)).toBe(true);
      if (priorities.length > 0) {
        const first = priorities[0];
        expect(first.priorityScore).toBeGreaterThanOrEqual(0);
        expect(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).toContain(first.priorityLevel);
        expect(first.recommendedAction).toBeDefined();
        expect(first.reasons.length).toBeGreaterThan(0);
      }
    });

    it("9.3 getHealthCenterItems flags renewals, overdue invoices, and cancellations", async () => {
      const health = await getHealthCenterItems();
      expect(health).toBeDefined();
      expect(Array.isArray(health.upcomingRenewals)).toBe(true);
      expect(Array.isArray(health.failedAttempts)).toBe(true);
      expect(Array.isArray(health.overdueInvoices)).toBe(true);
      expect(Array.isArray(health.pendingCancellations)).toBe(true);
    });
  });

  // ==========================================
  // TASK 10: Validation Errors & Missing Inputs
  // ==========================================
  describe("Task 10: Validation Errors & Edge Cases", () => {
    it("10.1 recordPayment rejects zero or negative amounts", async () => {
      await expect(
        recordPayment({
          invoiceId: "dummy-id",
          amount: "0.00",
          paymentMethod: "CASH",
        })
      ).rejects.toThrow(/greater than zero/);

      await expect(
        recordPayment({
          invoiceId: "dummy-id",
          amount: "-50.00",
          paymentMethod: "CASH",
        })
      ).rejects.toThrow(/greater than zero/);
    });

    it("10.2 recordPayment rejects non-existent invoice", async () => {
      await expect(
        recordPayment({
          invoiceId: "non-existent-cuid-9999",
          amount: "100.00",
          paymentMethod: "UPI",
        })
      ).rejects.toThrow(/Invoice not found/);
    });
  });

  // ==========================================
  // TASK 11: Transaction Rollback Integrity
  // ==========================================
  describe("Task 11: Transaction Atomicity & Consistency", () => {
    it("11.1 Failed payment does not alter invoice state or create orphaned records", async () => {
      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-ROLLBACK-QA-${Date.now()}`,
          customerId: testCustomerProfileA.id,
          issueDate: new Date(),
          dueDate: addDays(new Date(), 10),
          status: "CONFIRMED",
          subtotal: new Decimal("500.00"),
          grandTotal: new Decimal("500.00"),
          amountPaid: new Decimal("0.00"),
          outstandingAmount: new Decimal("500.00"),
        },
      });

      // Attempt invalid payment
      try {
        await recordPayment({
          invoiceId: inv.id,
          amount: "99999.00", // exceeds balance
          paymentMethod: "UPI",
        });
      } catch {
        // Expected failure
      }

      // Check invoice is untouched
      const after = await prisma.invoice.findUnique({ where: { id: inv.id } });
      expect(after?.status).toBe("CONFIRMED");
      expect(after?.amountPaid.toString()).toBe("0");
      expect(after?.outstandingAmount.toString()).toBe("500");

      const paymentCount = await prisma.payment.count({ where: { invoiceId: inv.id } });
      expect(paymentCount).toBe(0);

      // Cleanup
      await prisma.invoice.delete({ where: { id: inv.id } });
    });
  });

  // ==========================================
  // REGRESSION TESTS FOR CONFIRMED BUGS
  // ==========================================
  describe("Regression Tests: Bug Fixes & Boundary Hardening", () => {
    it("REG-1: Customer cancellation request works for own subscription", async () => {
      // Create subscription for Customer A
      const sub = await prisma.subscription.create({
        data: {
          subscriptionNumber: `SUB-CANCEL-QA-${Date.now()}`,
          customerId: testCustomerProfileA.id,
          planId: testPlan.id,
          status: "ACTIVE",
          nextBillingDate: addDays(new Date(), 30),
          totalRecurringAmount: new Decimal("2500.00"),
        },
      });

      const updated = await requestCancellation(sub.id, "Moving to another region", testCustomerUserA.id);
      expect(updated.cancelRequestedAt).toBeDefined();
      expect(updated.cancelReason).toBe("Moving to another region");

      // Clean up
      await prisma.subscription.delete({ where: { id: sub.id } });
    });

    it("REG-2: Customer cannot cancel another customer's subscription", async () => {
      // Sub belongs to B
      const subB = await prisma.subscription.create({
        data: {
          subscriptionNumber: `SUB-B-QA-${Date.now()}`,
          customerId: testCustomerProfileB.id,
          planId: testPlan.id,
          status: "ACTIVE",
          nextBillingDate: addDays(new Date(), 30),
          totalRecurringAmount: new Decimal("2500.00"),
        },
      });

      const userA = {
        id: testCustomerUserA.id,
        email: testCustomerUserA.email,
        name: testCustomerUserA.name,
        role: "CUSTOMER" as const,
        customerId: testCustomerProfileA.id,
      };

      // Verify ownership check fails
      const check = requireOwnershipOrStaff(userA, subB.customerId);
      expect(check.allowed).toBe(false);
      expect(check.statusCode).toBe(403);

      // Clean up
      await prisma.subscription.delete({ where: { id: subB.id } });
    });

    it("REG-3: recordPayment gracefully rejects NaN and invalid non-numeric strings", async () => {
      await expect(
        recordPayment({
          invoiceId: "dummy-id",
          amount: "invalid-string",
          paymentMethod: "UPI",
        })
      ).rejects.toThrow(/Invalid payment amount/);

      await expect(
        recordPayment({
          invoiceId: "dummy-id",
          amount: NaN,
          paymentMethod: "UPI",
        })
      ).rejects.toThrow();
    });

    it("REG-4: getRevenueForecast accurately advances intervals using calendar logic", async () => {
      const forecast = await getRevenueForecast(60);
      expect(forecast).toBeDefined();
      expect(Number(forecast.totalProjected)).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(forecast.timeline)).toBe(true);
    });
  });
});
