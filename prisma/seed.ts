import { PrismaClient, Role, ProductType, PricingType, BillingInterval, QuotationStatus, SubscriptionStatus, InvoiceStatus, TaxType, DiscountType, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import Decimal from "decimal.js";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Brightloop deterministic demo seed...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.billingAttempt.deleteMany();
  await prisma.discountRedemption.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionLine.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.quotationLine.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.planProduct.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Password Hashes (Meets requirement: >8 chars, 1 uppercase, 1 lowercase, 1 special char)
  // Demo password: "BrightLoop@2026!"
  const passwordHash = await bcrypt.hash("BrightLoop@2026!", 10);

  // 2. Create Administrator and Staff Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@brightloop.io",
      passwordHash,
      name: "Rohan Patel (Admin)",
      role: Role.ADMIN,
    },
  });

  const staffUser1 = await prisma.user.create({
    data: {
      email: "sarah.staff@brightloop.io",
      passwordHash,
      name: "Sarah Jenkins",
      role: Role.STAFF,
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      email: "alex.sales@brightloop.io",
      passwordHash,
      name: "Alex Rivera",
      role: Role.STAFF,
    },
  });

  console.log("✓ Admin and Staff accounts seeded.");

  // 3. Create Products and Variants
  const p1 = await prisma.product.create({
    data: {
      productCode: "PROD-CORE-SUB",
      name: "Brightloop Cloud Workspace",
      description: "Core cloud platform workspace with multi-user seats and workflow automation.",
      productType: ProductType.LICENSE,
      salesPrice: new Decimal("2499.00"),
      costPrice: new Decimal("500.00"),
      variants: {
        create: [
          {
            variantName: "Standard",
            sku: "PROD-CORE-STD",
            pricingType: PricingType.ADDITIONAL,
            priceAdjustment: new Decimal("0.00"),
          },
          {
            variantName: "Odoo Enterprise Connector",
            sku: "PROD-CORE-ODOO",
            pricingType: PricingType.ADDITIONAL,
            priceAdjustment: new Decimal("750.00"),
          },
          {
            variantName: "Dedicated High-Throughput Node",
            sku: "PROD-CORE-DEDICATED",
            pricingType: PricingType.OVERRIDE,
            priceAdjustment: new Decimal("4999.00"),
          },
        ],
      },
    },
  });

  const p2 = await prisma.product.create({
    data: {
      productCode: "PROD-API-PACK",
      name: "High-Volume API Gateway",
      description: "1,000,000 monthly API calls with sub-50ms low latency guarantee.",
      productType: ProductType.USAGE,
      salesPrice: new Decimal("1200.00"),
      costPrice: new Decimal("200.00"),
      variants: {
        create: [
          {
            variantName: "Default Rate Limit",
            sku: "PROD-API-DEF",
            pricingType: PricingType.ADDITIONAL,
            priceAdjustment: new Decimal("0.00"),
          },
          {
            variantName: "Burst Capacity Boost",
            sku: "PROD-API-BURST",
            pricingType: PricingType.ADDITIONAL,
            priceAdjustment: new Decimal("400.00"),
          },
        ],
      },
    },
  });

  const p3 = await prisma.product.create({
    data: {
      productCode: "PROD-SUPP-PREM",
      name: "Priority 24/7 SLA Support",
      description: "Direct Slack channel and 15-minute response SLA from senior engineers.",
      productType: ProductType.SERVICE,
      salesPrice: new Decimal("1500.00"),
      costPrice: new Decimal("400.00"),
    },
  });

  const p4 = await prisma.product.create({
    data: {
      productCode: "PROD-SSO-ENT",
      name: "SAML 2.0 / Okta SSO Add-on",
      description: "Enterprise Single Sign-On and directory sync integration.",
      productType: ProductType.SERVICE,
      salesPrice: new Decimal("800.00"),
      costPrice: new Decimal("100.00"),
    },
  });

  console.log("✓ Products and variants seeded.");

  // 4. Create Tax Rules
  const taxGst18 = await prisma.taxRule.create({
    data: {
      taxCode: "GST-18",
      name: "GST 18% (Standard SaaS)",
      taxType: TaxType.PERCENTAGE,
      rate: new Decimal("18.00"),
      isInclusive: false,
    },
  });

  const taxZero = await prisma.taxRule.create({
    data: {
      taxCode: "ZERO-TAX",
      name: "Export / SEZ Zero Tax",
      taxType: TaxType.PERCENTAGE,
      rate: new Decimal("0.00"),
      isInclusive: false,
    },
  });

  console.log("✓ Tax rules seeded.");

  // 5. Create Subscription Plans
  const planStarterMonthly = await prisma.subscriptionPlan.create({
    data: {
      planCode: "PLAN-STARTER-M",
      name: "Starter Monthly",
      description: "For emerging startups building and scaling modern subscriptions.",
      billingInterval: BillingInterval.MONTHLY,
      billingIntervalCount: 1,
      basePrice: new Decimal("2499.00"),
      autoRenew: true,
      allowPause: true,
      allowEarlyCancel: true,
      trialDays: 14,
      planProducts: {
        create: [{ productId: p1.id, defaultQuantity: 1 }],
      },
    },
  });

  const planGrowthMonthly = await prisma.subscriptionPlan.create({
    data: {
      planCode: "PLAN-GROWTH-M",
      name: "Growth Monthly",
      description: "For fast-scaling teams requiring high API throughput and premium SLA.",
      billingInterval: BillingInterval.MONTHLY,
      billingIntervalCount: 1,
      basePrice: new Decimal("4999.00"),
      autoRenew: true,
      allowPause: true,
      allowEarlyCancel: true,
      trialDays: 0,
      planProducts: {
        create: [
          { productId: p1.id, defaultQuantity: 1 },
          { productId: p2.id, defaultQuantity: 1 },
          { productId: p3.id, defaultQuantity: 1 },
        ],
      },
    },
  });

  const planGrowthYearly = await prisma.subscriptionPlan.create({
    data: {
      planCode: "PLAN-GROWTH-Y",
      name: "Growth Annual (20% Off)",
      description: "Annual commitment with two months free and prioritized onboarding.",
      billingInterval: BillingInterval.YEARLY,
      billingIntervalCount: 1,
      basePrice: new Decimal("49990.00"),
      autoRenew: true,
      allowPause: false,
      allowEarlyCancel: false,
      trialDays: 0,
      planProducts: {
        create: [
          { productId: p1.id, defaultQuantity: 1 },
          { productId: p2.id, defaultQuantity: 1 },
        ],
      },
    },
  });

  const planEnterpriseYearly = await prisma.subscriptionPlan.create({
    data: {
      planCode: "PLAN-ENT-Y",
      name: "Enterprise Global",
      description: "Complete infrastructure access, dedicated cluster, custom SLA, and SSO.",
      billingInterval: BillingInterval.YEARLY,
      billingIntervalCount: 1,
      basePrice: new Decimal("120000.00"),
      autoRenew: true,
      allowPause: false,
      allowEarlyCancel: false,
      trialDays: 0,
      planProducts: {
        create: [
          { productId: p1.id, defaultQuantity: 1 },
          { productId: p2.id, defaultQuantity: 1 },
          { productId: p3.id, defaultQuantity: 1 },
          { productId: p4.id, defaultQuantity: 1 },
        ],
      },
    },
  });

  const planWeeklyRapid = await prisma.subscriptionPlan.create({
    data: {
      planCode: "PLAN-RAPID-W",
      name: "Rapid API Developer Weekly",
      description: "Agile developer access with weekly recurring billing.",
      billingInterval: BillingInterval.WEEKLY,
      billingIntervalCount: 1,
      basePrice: new Decimal("499.00"),
      autoRenew: true,
      allowPause: true,
      allowEarlyCancel: true,
      trialDays: 0,
    },
  });

  console.log("✓ Subscription plans seeded.");

  // 6. Create Discount Rules
  await prisma.discountRule.create({
    data: {
      discountCode: "LAUNCH20",
      name: "Launch Special 20% Off",
      discountType: DiscountType.PERCENTAGE,
      value: new Decimal("20.00"),
      maxUsageCount: 100,
      currentUsageCount: 8,
      perCustomerLimit: 1,
      validFrom: subDays(new Date(), 30),
      validTo: addDays(new Date(), 60),
    },
  });

  await prisma.discountRule.create({
    data: {
      discountCode: "FLAT500",
      name: "Startup Credit ₹500",
      discountType: DiscountType.FIXED,
      value: new Decimal("500.00"),
      minPurchaseValue: new Decimal("2000.00"),
      maxUsageCount: 50,
      currentUsageCount: 4,
      perCustomerLimit: 1,
      validFrom: subDays(new Date(), 15),
      validTo: addDays(new Date(), 90),
    },
  });

  console.log("✓ Discount rules seeded.");

  // 7. Seed 20+ Customers and Customer Accounts
  const customerData = [
    { company: "Acme Innovations Ltd", contact: "Vikram Malhotra", email: "vikram@acmeinnovations.com", city: "Bengaluru", state: "KA", tax: "29AAAAA0000A1Z5" },
    { company: "Zenith Cloud Systems", contact: "Pooja Sharma", email: "pooja@zenithcloud.io", city: "Mumbai", state: "MH", tax: "27BBBBB1111B1Z2" },
    { company: "DevStudio Labs", contact: "Arjun Nair", email: "arjun@devstudiolabs.com", city: "Hyderabad", state: "TS", tax: "36CCCCC2222C1Z9" },
    { company: "Nexus Fintech Solutions", contact: "Sneha Reddy", email: "sneha@nexusfintech.in", city: "Pune", state: "MH", tax: "27DDDDD3333D1Z4" },
    { company: "HyperScale Media", contact: "David Miller", email: "david@hyperscalemedia.com", city: "Delhi", state: "DL", tax: "07EEEEE4444E1Z1" },
    { company: "Quantum Logic AI", contact: "Meera Kulkarni", email: "meera@quantumlogic.ai", city: "Chennai", state: "TN", tax: "33FFFFF5555F1Z8" },
    { company: "Alpha Logistics Tech", contact: "Karthik Raja", email: "karthik@alphalogistics.com", city: "Bengaluru", state: "KA", tax: "29GGGGG6666G1Z3" },
    { company: "Beacon Health Informatics", contact: "Dr. Ananya Sen", email: "ananya@beaconhealth.org", city: "Kolkata", state: "WB", tax: "19HHHHH7777H1Z7" },
    { company: "Vortex Data Engineering", contact: "Siddharth Jain", email: "sid@vortexdata.net", city: "Gurugram", state: "HR", tax: "06IIIII8888I1Z0" },
    { company: "Pulse Metrics Analytics", contact: "Divya Chopra", email: "divya@pulsemetrics.co", city: "Noida", state: "UP", tax: "09JJJJJ9999J1Z6" },
    { company: "Titan Retail Tech", contact: "Gaurav Mehta", email: "gaurav@titanretail.in", city: "Ahmedabad", state: "GJ", tax: "24KKKKK0000K1Z5" },
    { company: "Aura Creative Studio", contact: "Nisha Singhania", email: "nisha@auracreative.design", city: "Jaipur", state: "RJ", tax: "08LLLLL1111L1Z2" },
    { company: "Optima Security Ops", contact: "Farhan Ali", email: "farhan@optimasec.io", city: "Bengaluru", state: "KA", tax: "29MMMMM2222M1Z9" },
    { company: "Starlight SaaS Engine", contact: "Kavita Rao", email: "kavita@starlightengine.com", city: "Kochi", state: "KL", tax: "32NNNNN3333N1Z4" },
    { company: "Cobalt Payments Infrastructure", contact: "Ramesh Verma", email: "ramesh@cobaltpay.com", city: "Mumbai", state: "MH", tax: "27OOOOO4444O1Z1" },
    { company: "Orbit ERP Automations", contact: "Preeti Desai", email: "preeti@orbiterp.com", city: "Vadodara", state: "GJ", tax: "24PPPPP5555P1Z8" },
    { company: "Solace Mobility Labs", contact: "Tarun Kapoor", email: "tarun@solacemobility.com", city: "Indore", state: "MP", tax: "23QQQQQ6666Q1Z3" },
    { company: "Krypton Microservices", contact: "Rahul Bhatia", email: "rahul@kryptonmicro.com", city: "Chandigarh", state: "CH", tax: "04RRRRR7777R1Z7" },
    { company: "Terraform Builders IT", contact: "Sunil Pillai", email: "sunil@terrafit.in", city: "Thiruvananthapuram", state: "KL", tax: "32SSSSS8888S1Z0" },
    { company: "OmniChannel Hub", contact: "Aarti Saxena", email: "aarti@omnichannelhub.com", city: "Lucknow", state: "UP", tax: "09TTTTT9999T1Z6" },
    { company: "Peak Performance Software", contact: "Amitabh Sen", email: "amitabh@peaksoftware.in", city: "Bhopal", state: "MP", tax: "23UUUUU0000U1Z5" },
  ];

  const createdCustomers = [];

  for (let i = 0; i < customerData.length; i++) {
    const c = customerData[i];
    const customerNumber = `CUST-${String(i + 1).padStart(4, "0")}`;

    // Create User record for Customer portal access
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash,
        name: c.contact,
        role: Role.CUSTOMER,
      },
    });

    const profile = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        customerNumber,
        companyName: c.company,
        contactName: c.contact,
        email: c.email,
        phone: `+91 98${String(10000000 + i * 34567).slice(0, 8)}`,
        billingAddress: `${100 + i}, Tech Boulevard, ${c.city}, ${c.state}, India`,
        taxNumber: c.tax,
        currency: "INR",
        notes: `Enterprise SaaS customer onboarded in 2026. Tier: ${i < 5 ? "Strategic" : "Standard"}`,
      },
    });

    createdCustomers.push(profile);
  }

  console.log(`✓ Seeded ${createdCustomers.length} customer profiles and portal users.`);

  // 8. Seed Subscriptions, Invoices, Payments, and Lifecycle states
  // We'll create:
  // - 12 Active Subscriptions (with varied billing dates, some due next week)
  // - 3 Paused Subscriptions
  // - 2 Closed Subscriptions
  // - 3 Quotations (Draft & Sent)
  // - Invoices: Paid, Partially Paid, Overdue, Confirmed

  const now = new Date();

  for (let i = 0; i < createdCustomers.length; i++) {
    const cust = createdCustomers[i];
    const subNum = `SUB-2026-${String(i + 1).padStart(4, "0")}`;
    const plan = i % 4 === 0 ? planEnterpriseYearly : i % 3 === 0 ? planGrowthYearly : i % 2 === 0 ? planGrowthMonthly : planStarterMonthly;

    if (i < 15) {
      // ACTIVE Subscriptions
      // Stagger next billing dates
      let nextBilling = addDays(now, 10 + (i % 20));
      if (i === 1 || i === 2) {
        // Due next week for health center demo!
        nextBilling = addDays(now, 3);
      } else if (i === 0) {
        // Due today!
        nextBilling = now;
      }

      const sub = await prisma.subscription.create({
        data: {
          subscriptionNumber: subNum,
          customerId: cust.id,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: subDays(now, 60 + i * 10),
          nextBillingDate: nextBilling,
          lastBillingDate: subDays(nextBilling, 30),
          billingInterval: plan.billingInterval,
          billingIntervalCount: plan.billingIntervalCount,
          paymentTerms: "Net 15",
          autoRenew: plan.autoRenew,
          totalRecurringAmount: plan.basePrice,
          cancelRequestedAt: i === 4 ? subDays(now, 2) : null,
          cancelReason: i === 4 ? "Evaluating budget consolidation" : null,
          lines: {
            create: [
              {
                productId: p1.id,
                description: `${plan.name} License`,
                quantity: 1,
                agreedUnitPrice: plan.basePrice,
                taxRate: new Decimal("18.00"),
                lineTotal: plan.basePrice,
              },
            ],
          },
        },
      });

      // Generate invoice for previous billing period
      const invNum = `INV-2026-${String(i + 1).padStart(5, "0")}`;
      const subtotal = plan.basePrice;
      const taxAmt = subtotal.times(0.18).toDecimalPlaces(2);
      const grandTotal = subtotal.plus(taxAmt).toDecimalPlaces(2);

      let invStatus: InvoiceStatus = InvoiceStatus.PAID;
      let amountPaid = grandTotal;
      let outstanding = new Decimal("0.00");
      let dueDate = subDays(now, 10);

      if (i === 3 || i === 6) {
        // OVERDUE Invoices (due 25 days ago, outstanding balance)
        invStatus = InvoiceStatus.OVERDUE;
        amountPaid = new Decimal("0.00");
        outstanding = grandTotal;
        dueDate = subDays(now, 25);
      } else if (i === 5) {
        // PARTIALLY PAID
        invStatus = InvoiceStatus.PARTIALLY_PAID;
        amountPaid = grandTotal.dividedBy(2).toDecimalPlaces(2);
        outstanding = grandTotal.minus(amountPaid).toDecimalPlaces(2);
        dueDate = subDays(now, 5);
      }

      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber: invNum,
          customerId: cust.id,
          subscriptionId: sub.id,
          billingPeriodStart: subDays(sub.nextBillingDate, 30),
          billingPeriodEnd: sub.nextBillingDate,
          issueDate: subDays(sub.nextBillingDate, 30),
          dueDate,
          status: invStatus,
          subtotal,
          taxTotal: taxAmt,
          grandTotal,
          amountPaid,
          outstandingAmount: outstanding,
          currency: "INR",
          paymentTerms: "Net 15",
          notes: `Billing cycle for ${plan.name}`,
          lines: {
            create: [
              {
                productId: p1.id,
                description: `${plan.name} License`,
                quantity: 1,
                unitPrice: plan.basePrice,
                taxRate: new Decimal("18.00"),
                taxAmount: taxAmt,
                lineTotal: grandTotal,
              },
            ],
          },
        },
      });

      // Record payments for paid/partially paid
      if (amountPaid.greaterThan(0)) {
        await prisma.payment.create({
          data: {
            paymentReference: `PAY-2026-${String(i + 1).padStart(5, "0")}`,
            customerId: cust.id,
            invoiceId: inv.id,
            amount: amountPaid,
            paymentMethod: i % 2 === 0 ? PaymentMethod.BANK_TRANSFER : PaymentMethod.UPI,
            paymentDate: subDays(now, 8),
            recordedByUserId: adminUser.id,
            status: "COMPLETED",
          },
        });
      }

      // Add a failed billing attempt on customer 3 for health center demo
      if (i === 3) {
        await prisma.billingAttempt.create({
          data: {
            subscriptionId: sub.id,
            billingDate: subDays(now, 3),
            status: "FAILED",
            failureReason: "Payment gateway timeout on automated mandate charge.",
          },
        });
      }
    } else if (i < 18) {
      // PAUSED Subscriptions
      await prisma.subscription.create({
        data: {
          subscriptionNumber: subNum,
          customerId: cust.id,
          planId: plan.id,
          status: SubscriptionStatus.PAUSED,
          startDate: subDays(now, 90),
          nextBillingDate: addDays(now, 45),
          billingInterval: plan.billingInterval,
          paymentTerms: "Immediate",
          totalRecurringAmount: plan.basePrice,
          pausedAt: subDays(now, 14),
          lines: {
            create: [
              {
                productId: p1.id,
                description: `${plan.name} License`,
                quantity: 1,
                agreedUnitPrice: plan.basePrice,
                taxRate: new Decimal("18.00"),
                lineTotal: plan.basePrice,
              },
            ],
          },
        },
      });
    } else {
      // CLOSED Subscriptions
      await prisma.subscription.create({
        data: {
          subscriptionNumber: subNum,
          customerId: cust.id,
          planId: plan.id,
          status: SubscriptionStatus.CLOSED,
          startDate: subDays(now, 180),
          nextBillingDate: subDays(now, 30),
          billingInterval: plan.billingInterval,
          paymentTerms: "Immediate",
          totalRecurringAmount: plan.basePrice,
          closedAt: subDays(now, 20),
          cancelReason: "Completed client project contract",
          lines: {
            create: [
              {
                productId: p1.id,
                description: `${plan.name} License`,
                quantity: 1,
                agreedUnitPrice: plan.basePrice,
                taxRate: new Decimal("18.00"),
                lineTotal: plan.basePrice,
              },
            ],
          },
        },
      });
    }
  }

  // 9. Seed Quotations
  await prisma.quotation.create({
    data: {
      quotationNumber: "QUOTE-2026-0001",
      customerId: createdCustomers[0].id,
      planId: planEnterpriseYearly.id,
      status: QuotationStatus.SENT,
      issueDate: subDays(now, 3),
      expiryDate: addDays(now, 11),
      paymentTerms: "Net 30",
      subtotal: new Decimal("120000.00"),
      taxTotal: new Decimal("21600.00"),
      grandTotal: new Decimal("141600.00"),
      notes: "Custom Enterprise quote with dedicated SLA and Okta SSO add-on included.",
      lines: {
        create: [
          {
            productId: p1.id,
            description: "Enterprise Global Plan (Yearly)",
            quantity: 1,
            unitPrice: new Decimal("120000.00"),
            taxRate: new Decimal("18.00"),
            taxAmount: new Decimal("21600.00"),
            lineTotal: new Decimal("141600.00"),
          },
        ],
      },
    },
  });

  await prisma.quotation.create({
    data: {
      quotationNumber: "QUOTE-2026-0002",
      customerId: createdCustomers[1].id,
      planId: planGrowthMonthly.id,
      status: QuotationStatus.DRAFT,
      issueDate: now,
      expiryDate: addDays(now, 14),
      paymentTerms: "Immediate",
      subtotal: new Decimal("4999.00"),
      taxTotal: new Decimal("899.82"),
      grandTotal: new Decimal("5898.82"),
      lines: {
        create: [
          {
            productId: p1.id,
            description: "Growth Monthly Plan",
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

  // 10. Seed In-App Notifications
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "Subscription Renewal Due",
      message: "Acme Innovations Ltd has an upcoming renewal scheduled in 3 days.",
      notificationType: "RENEWAL_DUE",
      linkUrl: "/dashboard/health",
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "Invoice Overdue Alert",
      message: "Nexus Fintech Solutions has an outstanding invoice past 25 days.",
      notificationType: "INVOICE_OVERDUE",
      linkUrl: "/dashboard/collections",
    },
  });

  console.log("✓ Quotations and Notifications seeded.");
  console.log("🎉 Brightloop database successfully seeded with realistic demonstration data!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
