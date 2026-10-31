import { getDashboardMetrics, getRevenueForecast, getSmartCollectionPriorities } from "./analytics-service";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { addDays, startOfDay } from "date-fns";

export interface AssistantAnswer {
  question: string;
  answer: string;
  mode: "DETERMINISTIC_VERIFIED" | "GEMINI_AI";
  dataPoints?: Record<string, unknown>;
  quickLinks?: Array<{ label: string; href: string }>;
}

export async function askFinanceAssistant(
  prompt: string,
  userRole: string = "STAFF"
): Promise<AssistantAnswer> {
  const query = prompt.toLowerCase().trim();

  // 1. Fetch ground-truth application metrics
  const metrics = await getDashboardMetrics(30);

  // Intent 1: Revenue collected
  if (query.includes("revenue") && (query.includes("collect") || query.includes("this month") || query.includes("period"))) {
    return {
      question: prompt,
      answer: `In the last 30 days, Brightloop has collected **${formatCurrency(metrics.revenueCollected)}** in verified payments. Current Monthly Recurring Revenue (MRR) is **${formatCurrency(metrics.mrr)}**, representing an Annual Recurring Revenue (ARR) run-rate of **${formatCurrency(metrics.arr)}**.`,
      mode: "DETERMINISTIC_VERIFIED",
      dataPoints: {
        revenueCollected: metrics.revenueCollected,
        mrr: metrics.mrr,
        arr: metrics.arr,
      },
      quickLinks: [
        { label: "View Payments", href: "/dashboard/payments" },
        { label: "Revenue Analytics", href: "/dashboard/analytics" },
      ],
    };
  }

  // Intent 2: Overdue invoices
  if (query.includes("overdue") || query.includes("unpaid") || query.includes("receivable")) {
    const overdueList = await prisma.invoice.findMany({
      where: {
        status: { in: ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"] },
        dueDate: { lt: startOfDay(new Date()) },
        outstandingAmount: { gt: 0 },
      },
      include: { customer: true },
      orderBy: { outstandingAmount: "desc" },
      take: 5,
    });

    const itemsSummary = overdueList
      .map(
        (inv) =>
          `• **${inv.invoiceNumber}** (${inv.customer.companyName}): ${formatCurrency(inv.outstandingAmount)} (Due: ${formatDate(inv.dueDate)})`
      )
      .join("\n");

    return {
      question: prompt,
      answer: `There are currently **${metrics.overdueInvoicesCount} overdue invoices** totaling **${formatCurrency(metrics.outstandingReceivables)}** in outstanding receivables.\n\nTop outstanding accounts:\n${itemsSummary || "No critical overdue accounts found."}`,
      mode: "DETERMINISTIC_VERIFIED",
      dataPoints: {
        overdueCount: metrics.overdueInvoicesCount,
        totalReceivables: metrics.outstandingReceivables,
      },
      quickLinks: [
        { label: "Smart Collection Priority", href: "/dashboard/collections" },
        { label: "View Invoices", href: "/dashboard/invoices" },
      ],
    };
  }

  // Intent 3: Renewals next week / due soon
  if (query.includes("renew") || query.includes("next week") || query.includes("expiring")) {
    const nextWeek = addDays(new Date(), 7);
    const renewals = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextBillingDate: { gte: new Date(), lte: nextWeek },
      },
      include: { customer: true, plan: true },
      take: 5,
    });

    const summary = renewals
      .map(
        (s) =>
          `• **${s.subscriptionNumber}** — ${s.customer.companyName} (${s.plan.name}): ${formatCurrency(s.totalRecurringAmount)} on ${formatDate(s.nextBillingDate)}`
      )
      .join("\n");

    return {
      question: prompt,
      answer: `**${metrics.renewalsDueSoonCount} subscriptions** are scheduled for renewal within the next 7 days.\n\nUpcoming renewals:\n${summary || "No subscriptions due in the next 7 days."}`,
      mode: "DETERMINISTIC_VERIFIED",
      dataPoints: {
        renewalsDueSoon: metrics.renewalsDueSoonCount,
      },
      quickLinks: [{ label: "Health Center", href: "/dashboard/health" }],
    };
  }

  // Intent 4: Plan popularity / most active
  if (query.includes("plan") && (query.includes("most") || query.includes("popular") || query.includes("customers"))) {
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        subscriptions: { where: { status: "ACTIVE" } },
      },
    });

    plans.sort((a, b) => b.subscriptions.length - a.subscriptions.length);
    const topPlan = plans[0];

    const planBreakdown = plans
      .map((p) => `• **${p.name}**: ${p.subscriptions.length} active customer(s)`)
      .join("\n");

    return {
      question: prompt,
      answer: topPlan
        ? `The most popular plan is **${topPlan.name}** with **${topPlan.subscriptions.length} active subscriptions**.\n\nFull plan distribution:\n${planBreakdown}`
        : "No active plans found.",
      mode: "DETERMINISTIC_VERIFIED",
      quickLinks: [{ label: "Manage Plans", href: "/dashboard/plans" }],
    };
  }

  // Intent 5: Overall financial performance summary
  return {
    question: prompt,
    answer: `### Brightloop Financial Summary (Last 30 Days)\n\n` +
      `• **Monthly Recurring Revenue (MRR)**: ${formatCurrency(metrics.mrr)}\n` +
      `• **Annual Run-Rate (ARR)**: ${formatCurrency(metrics.arr)}\n` +
      `• **Cash Collected**: ${formatCurrency(metrics.revenueCollected)}\n` +
      `• **Outstanding Receivables**: ${formatCurrency(metrics.outstandingReceivables)} across ${metrics.overdueInvoicesCount} overdue accounts\n` +
      `• **Active Subscriptions**: ${metrics.activeSubscriptionsCount} (with ${metrics.newSubscriptionsCount} new this period)\n` +
      `• **Subscription Churn Rate**: ${metrics.churnRate}\n` +
      `• **Health Status**: ${metrics.failedBillingCount} failed automated charges require attention.`,
    mode: "DETERMINISTIC_VERIFIED",
    dataPoints: { ...metrics },
    quickLinks: [
      { label: "Executive Dashboard", href: "/dashboard" },
      { label: "Revenue Forecast", href: "/dashboard/forecast" },
      { label: "Health Center", href: "/dashboard/health" },
    ],
  };
}
