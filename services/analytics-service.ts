import { prisma } from "@/lib/db/prisma";
import { startOfDay, endOfDay, subDays, addDays, isBefore, differenceInDays } from "date-fns";
import { calculateNextBillingDate } from "@/lib/dates/billing-dates";
import Decimal from "decimal.js";

export interface DashboardMetrics {
  mrr: string;
  arr: string;
  revenueCollected: string;
  outstandingReceivables: string;
  activeSubscriptionsCount: number;
  newSubscriptionsCount: number;
  cancelledSubscriptionsCount: number;
  renewalsDueSoonCount: number;
  overdueInvoicesCount: number;
  failedBillingCount: number;
  churnRate: string;
}

export function calculateNormalizedMrr(
  amount: Decimal | number | string,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
  intervalCount: number = 1
): Decimal {
  const base = new Decimal(amount || 0);
  const count = Math.max(1, intervalCount);

  switch (interval) {
    case "DAILY":
      return base.times(30).dividedBy(count);
    case "WEEKLY":
      return base.times(52).dividedBy(12).dividedBy(count);
    case "MONTHLY":
      return base.dividedBy(count);
    case "YEARLY":
      return base.dividedBy(12).dividedBy(count);
    default:
      return base;
  }
}

export async function getDashboardMetrics(days: number = 30): Promise<DashboardMetrics> {
  const now = new Date();
  const periodStart = subDays(now, days);
  const imminentRenewalThreshold = addDays(now, 7);

  // 1. Active Subscriptions
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: {
      totalRecurringAmount: true,
      billingInterval: true,
      billingIntervalCount: true,
    },
  });

  let totalMrr = new Decimal(0);
  for (const s of activeSubs) {
    const norm = calculateNormalizedMrr(s.totalRecurringAmount, s.billingInterval, s.billingIntervalCount);
    totalMrr = totalMrr.plus(norm);
  }
  totalMrr = totalMrr.toDecimalPlaces(2);
  const totalArr = totalMrr.times(12).toDecimalPlaces(2);

  // 2. Revenue collected during period
  const paymentsInPeriod = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      paymentDate: {
        gte: periodStart,
        lte: now,
      },
    },
    select: { amount: true },
  });
  let collected = new Decimal(0);
  for (const p of paymentsInPeriod) {
    collected = collected.plus(new Decimal(p.amount));
  }
  collected = collected.toDecimalPlaces(2);

  // 3. Outstanding receivables
  const validInvoices = await prisma.invoice.findMany({
    where: {
      status: {
        in: ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"],
      },
    },
    select: {
      outstandingAmount: true,
      dueDate: true,
      status: true,
    },
  });

  let totalReceivables = new Decimal(0);
  let overdueCount = 0;
  for (const inv of validInvoices) {
    totalReceivables = totalReceivables.plus(new Decimal(inv.outstandingAmount));
    if (isBefore(new Date(inv.dueDate), startOfDay(now)) && new Decimal(inv.outstandingAmount).greaterThan(0)) {
      overdueCount++;
    }
  }
  totalReceivables = totalReceivables.toDecimalPlaces(2);

  // 4. New & Cancelled subscriptions in period
  const newSubsCount = await prisma.subscription.count({
    where: {
      createdAt: { gte: periodStart },
    },
  });

  const cancelledCount = await prisma.subscription.count({
    where: {
      status: "CLOSED",
      updatedAt: { gte: periodStart },
    },
  });

  // 5. Renewals due soon (< 7 days)
  const renewalsDueSoon = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
      nextBillingDate: {
        gte: now,
        lte: imminentRenewalThreshold,
      },
    },
  });

  // 6. Failed billing attempts in period
  const failedBillingCount = await prisma.billingAttempt.count({
    where: {
      status: "FAILED",
      createdAt: { gte: periodStart },
    },
  });

  // 7. Churn rate: (cancelled / (active + cancelled)) * 100
  const totalCustomerBase = activeSubs.length + cancelledCount;
  const churnRate =
    totalCustomerBase > 0
      ? new Decimal(cancelledCount).dividedBy(totalCustomerBase).times(100).toFixed(1) + "%"
      : "0.0%";

  return {
    mrr: totalMrr.toString(),
    arr: totalArr.toString(),
    revenueCollected: collected.toString(),
    outstandingReceivables: totalReceivables.toString(),
    activeSubscriptionsCount: activeSubs.length,
    newSubscriptionsCount: newSubsCount,
    cancelledSubscriptionsCount: cancelledCount,
    renewalsDueSoonCount: renewalsDueSoon,
    overdueInvoicesCount: overdueCount,
    failedBillingCount,
    churnRate,
  };
}

export async function getRevenueTrends(monthsCount: number = 6) {
  // Aggregate revenue and invoice volume per month
  const now = new Date();
  const points = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = startOfDay(monthDate);
    const mEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() - i + 1, 0));

    const payments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        paymentDate: { gte: mStart, lte: mEnd },
      },
      select: { amount: true },
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        status: { not: "CANCELLED" },
        issueDate: { gte: mStart, lte: mEnd },
      },
      select: { grandTotal: true },
    });

    let paidAmount = new Decimal(0);
    for (const p of payments) paidAmount = paidAmount.plus(new Decimal(p.amount));

    let invoicedAmount = new Decimal(0);
    for (const inv of invoices) invoicedAmount = invoicedAmount.plus(new Decimal(inv.grandTotal));

    const monthLabel = mStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    points.push({
      month: monthLabel,
      collected: Number(paidAmount.toFixed(2)),
      invoiced: Number(invoicedAmount.toFixed(2)),
    });
  }

  return points;
}

export async function getPlanDistribution() {
  const plans = await prisma.subscriptionPlan.findMany({
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        select: { id: true, totalRecurringAmount: true },
      },
    },
  });

  return plans.map((p) => {
    let revenue = new Decimal(0);
    for (const s of p.subscriptions) revenue = revenue.plus(new Decimal(s.totalRecurringAmount));
    return {
      planName: p.name,
      count: p.subscriptions.length,
      recurringRevenue: Number(revenue.toFixed(2)),
    };
  });
}

export async function getHealthCenterItems() {
  const now = new Date();
  const nextWeek = addDays(now, 7);

  // 1. Approaching renewals
  const upcomingRenewals = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      nextBillingDate: { gte: now, lte: nextWeek },
    },
    include: { customer: true, plan: true },
    take: 10,
  });

  // 2. Failed billing attempts needing retry
  const failedAttempts = await prisma.billingAttempt.findMany({
    where: { status: "FAILED" },
    include: {
      subscription: {
        include: { customer: true, plan: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // 3. Repeatedly overdue invoices
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"] },
      dueDate: { lt: startOfDay(now) },
      outstandingAmount: { gt: 0 },
    },
    include: { customer: true },
    orderBy: { dueDate: "asc" },
    take: 10,
  });

  // 4. Pending cancellation requests
  const pendingCancellations = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      cancelRequestedAt: { not: null },
    },
    include: { customer: true, plan: true },
    take: 10,
  });

  return {
    upcomingRenewals,
    failedAttempts,
    overdueInvoices,
    pendingCancellations,
  };
}

export async function getRevenueForecast(days: number = 90) {
  const now = new Date();
  const forecastEnd = addDays(now, days);

  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { customer: true, plan: true },
  });

  const timelineMap: Record<string, { date: string; projected: number; count: number }> = {};

  for (const sub of activeSubs) {
    let nextDate = new Date(sub.nextBillingDate);
    const amount = Number(new Decimal(sub.totalRecurringAmount).toFixed(2));

    while (nextDate <= forecastEnd) {
      const dateKey = nextDate.toISOString().slice(0, 10);
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey, projected: 0, count: 0 };
      }
      timelineMap[dateKey].projected += amount;
      timelineMap[dateKey].count += 1;

      // advance for next event using calendar-aware interval logic
      nextDate = calculateNextBillingDate({
        currentBillingDate: nextDate,
        interval: sub.billingInterval,
        intervalCount: sub.billingIntervalCount,
      });
    }
  }

  const sortedPoints = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));
  const totalProjected = sortedPoints.reduce((acc, p) => acc + p.projected, 0);

  return {
    horizonDays: days,
    totalProjected: totalProjected.toFixed(2),
    activeSubscriptionsConsidered: activeSubs.length,
    timeline: sortedPoints,
  };
}

export interface CollectionPriorityItem {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  email: string;
  daysOverdue: number;
  outstandingAmount: string;
  failedAttemptsCount: number;
  priorityScore: number;
  priorityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  recommendedAction: string;
  reasons: string[];
}

export async function getSmartCollectionPriorities(): Promise<CollectionPriorityItem[]> {
  const now = startOfDay(new Date());

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"] },
      dueDate: { lt: now },
      outstandingAmount: { gt: 0 },
    },
    include: {
      customer: true,
      subscription: {
        include: {
          billingAttempts: {
            where: { status: "FAILED" },
          },
        },
      },
    },
  });

  const results: CollectionPriorityItem[] = overdueInvoices.map((inv) => {
    const daysOverdue = Math.max(1, differenceInDays(now, new Date(inv.dueDate)));
    const amount = Number(new Decimal(inv.outstandingAmount).toFixed(2));
    const failedAttempts = inv.subscription?.billingAttempts.length || 0;

    const reasons: string[] = [];

    // Transparent rule-based score calculation
    let score = 0;

    // 1. Days overdue weight (up to 40 pts)
    if (daysOverdue > 60) {
      score += 40;
      reasons.push(`${daysOverdue} days past due (>60 days aging bucket)`);
    } else if (daysOverdue > 30) {
      score += 30;
      reasons.push(`${daysOverdue} days past due (>30 days aging bucket)`);
    } else if (daysOverdue > 14) {
      score += 20;
      reasons.push(`${daysOverdue} days past due`);
    } else {
      score += 10;
      reasons.push(`${daysOverdue} days past due (recent)`);
    }

    // 2. Amount weight (up to 40 pts)
    if (amount >= 50000) {
      score += 40;
      reasons.push(`High monetary exposure (₹${amount.toLocaleString()})`);
    } else if (amount >= 15000) {
      score += 30;
      reasons.push(`Moderate monetary exposure (₹${amount.toLocaleString()})`);
    } else if (amount >= 5000) {
      score += 20;
      reasons.push(`Exposure balance of ₹${amount.toLocaleString()}`);
    } else {
      score += 10;
      reasons.push(`Small exposure balance of ₹${amount.toLocaleString()}`);
    }

    // 3. Failed attempts weight (up to 20 pts)
    if (failedAttempts >= 3) {
      score += 20;
      reasons.push(`${failedAttempts} previous failed automated charge attempts`);
    } else if (failedAttempts > 0) {
      score += 10;
      reasons.push(`${failedAttempts} failed charge attempt`);
    }

    let priorityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let recommendedAction = "Send automated reminder email";

    if (score >= 80) {
      priorityLevel = "CRITICAL";
      recommendedAction = "Immediate executive phone call & freeze services";
    } else if (score >= 60) {
      priorityLevel = "HIGH";
      recommendedAction = "Assign dedicated account manager follow-up";
    } else if (score >= 40) {
      priorityLevel = "MEDIUM";
      recommendedAction = "Send urgent payment demand notice with updated invoice link";
    }

    return {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.companyName,
      email: inv.customer.email,
      daysOverdue,
      outstandingAmount: amount.toFixed(2),
      failedAttemptsCount: failedAttempts,
      priorityScore: score,
      priorityLevel,
      recommendedAction,
      reasons,
    };
  });

  return results.sort((a, b) => b.priorityScore - a.priorityScore);
}
