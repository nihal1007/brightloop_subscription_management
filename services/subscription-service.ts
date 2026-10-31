import { prisma } from "@/lib/db/prisma";
import { calculateNextBillingDate, isPlanAvailableOnDate } from "@/lib/dates/billing-dates";
import { SubscriptionStatus } from "@prisma/client";
import { addDays } from "date-fns";

export async function convertQuotationToSubscription(
  quotationId: string,
  performedByUserId?: string
) {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.quotation.findUnique({
      where: { id: quotationId },
      include: {
        lines: true,
        customer: true,
        plan: {
          include: {
            planProducts: true,
          },
        },
      },
    });

    if (!quote) {
      throw new Error("Quotation not found.");
    }

    // Idempotency: if already converted, return the existing subscription
    if (quote.convertedToSubscriptionId) {
      const existing = await tx.subscription.findUnique({
        where: { id: quote.convertedToSubscriptionId },
        include: { lines: true, plan: true, customer: true },
      });
      if (existing) return existing;
    }

    if (!quote.planId || !quote.plan) {
      throw new Error("Cannot convert quotation to subscription without an associated subscription plan.");
    }

    // Validate plan availability
    const planAvail = isPlanAvailableOnDate(quote.plan, new Date());
    if (!planAvail.isAvailable) {
      throw new Error(planAvail.reason || "The plan is not currently available for subscription.");
    }

    // Generate unique subscription number
    const subCount = await tx.subscription.count();
    const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(subCount + 1).padStart(4, "0")}`;

    const startDate = new Date();
    // If trial days, next billing date is after trial
    const trialDays = quote.plan.trialDays || 0;
    const firstBillingDate = trialDays > 0 ? addDays(startDate, trialDays) : startDate;

    // Create subscription
    const subscription = await tx.subscription.create({
      data: {
        subscriptionNumber,
        customerId: quote.customerId,
        planId: quote.planId,
        quotationId: quote.id,
        status: "ACTIVE",
        startDate,
        nextBillingDate: firstBillingDate,
        billingInterval: quote.plan.billingInterval,
        billingIntervalCount: quote.plan.billingIntervalCount,
        paymentTerms: quote.paymentTerms || "Immediate",
        autoRenew: quote.plan.autoRenew,
        totalRecurringAmount: quote.grandTotal,
        lines: {
          create: quote.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            description: l.description,
            quantity: l.quantity,
            agreedUnitPrice: l.unitPrice,
            discountAmount: l.discountAmount,
            taxRate: l.taxRate,
            lineTotal: l.lineTotal,
          })),
        },
      },
      include: {
        lines: true,
        plan: true,
        customer: true,
      },
    });

    // Update quotation status and mark converted
    await tx.quotation.update({
      where: { id: quote.id },
      data: {
        status: "ACCEPTED",
        convertedToSubscriptionId: subscription.id,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        entityType: "SUBSCRIPTION",
        entityId: subscription.id,
        action: "CREATED_FROM_QUOTATION",
        performedByUserId,
        details: JSON.stringify({
          quotationNumber: quote.quotationNumber,
          subscriptionNumber: subscription.subscriptionNumber,
          grandTotal: quote.grandTotal.toString(),
        }),
      },
    });

    // Notification for customer
    await tx.notification.create({
      data: {
        customerId: quote.customerId,
        title: "Subscription Activated",
        message: `Your subscription ${subscription.subscriptionNumber} (${quote.plan.name}) is now active.`,
        notificationType: "SUBSCRIPTION_ACTIVATED",
        linkUrl: `/portal/subscriptions/${subscription.id}`,
      },
    });

    return subscription;
  });
}

export async function pauseSubscription(subscriptionId: string, performedByUserId?: string) {
  return prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!sub) throw new Error("Subscription not found.");
    if (sub.status !== "ACTIVE") {
      throw new Error(`Only active subscriptions can be paused. Current status: ${sub.status}`);
    }
    if (!sub.plan.allowPause) {
      throw new Error("This plan does not permit pausing subscriptions.");
    }

    const updated = await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "PAUSED",
        pausedAt: new Date(),
      },
      include: { plan: true, customer: true, lines: true },
    });

    await tx.auditLog.create({
      data: {
        entityType: "SUBSCRIPTION",
        entityId: subscriptionId,
        action: "PAUSED",
        performedByUserId,
        details: JSON.stringify({ pausedAt: new Date().toISOString() }),
      },
    });

    return updated;
  });
}

export async function resumeSubscription(subscriptionId: string, performedByUserId?: string) {
  return prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!sub) throw new Error("Subscription not found.");
    if (sub.status !== "PAUSED") {
      throw new Error(`Only paused subscriptions can be resumed. Current status: ${sub.status}`);
    }

    // Advance next billing date if needed
    let nextDate = sub.nextBillingDate;
    if (new Date(nextDate) < new Date()) {
      nextDate = calculateNextBillingDate({
        currentBillingDate: new Date(),
        interval: sub.billingInterval,
        intervalCount: sub.billingIntervalCount,
      });
    }

    const updated = await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        pausedAt: null,
        nextBillingDate: nextDate,
      },
      include: { plan: true, customer: true, lines: true },
    });

    await tx.auditLog.create({
      data: {
        entityType: "SUBSCRIPTION",
        entityId: subscriptionId,
        action: "RESUMED",
        performedByUserId,
      },
    });

    return updated;
  });
}

export async function requestCancellation(
  subscriptionId: string,
  reason: string,
  performedByUserId?: string
) {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!sub) throw new Error("Subscription not found.");
  if (sub.status === "CLOSED") {
    throw new Error("Subscription is already closed.");
  }

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      cancelRequestedAt: new Date(),
      cancelReason: reason,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "SUBSCRIPTION",
      entityId: subscriptionId,
      action: "CANCELLATION_REQUESTED",
      performedByUserId,
      details: JSON.stringify({ reason }),
    },
  });

  return updated;
}

export async function closeSubscription(
  subscriptionId: string,
  reason: string = "Cancelled by user or administrator",
  performedByUserId?: string
) {
  return prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) throw new Error("Subscription not found.");
    if (sub.status === "CLOSED") {
      return sub;
    }

    const updated = await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        cancelReason: reason,
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "SUBSCRIPTION",
        entityId: subscriptionId,
        action: "CLOSED",
        performedByUserId,
        details: JSON.stringify({ reason }),
      },
    });

    await tx.notification.create({
      data: {
        customerId: sub.customerId,
        title: "Subscription Closed",
        message: `Subscription ${sub.subscriptionNumber} has been closed.`,
        notificationType: "SUBSCRIPTION_CLOSED",
        linkUrl: `/portal/subscriptions/${sub.id}`,
      },
    });

    return updated;
  });
}
