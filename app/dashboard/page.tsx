import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  Repeat,
  AlertCircle,
  FileCheck,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Bot,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardMetrics, getRevenueTrends, getPlanDistribution } from "@/services/analytics-service";
import { formatCurrency } from "@/lib/utils";
import { RevenueTrendChart, PlanDistributionChart } from "@/components/dashboard/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const metrics = await getDashboardMetrics(30);
  const revenueTrends = await getRevenueTrends(6);
  const planDistribution = await getPlanDistribution();

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial performance, subscription metrics, and automated recurring billing health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/billing-preview">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              <span>Trigger Recurring Billing</span>
            </Button>
          </Link>
          <Link href="/dashboard/quotations">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-slate-500" />
              <span>New Quotation</span>
            </Button>
          </Link>
          <Link href="/dashboard/assistant">
            <Button variant="secondary" size="sm" className="gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-200">
              <Bot className="h-3.5 w-3.5 text-indigo-600" />
              <span>Ask AI Assistant</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Health Alert Callout */}
      {(metrics.failedBillingCount > 0 || metrics.overdueInvoicesCount > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Action Required: {metrics.overdueInvoicesCount} Overdue Invoices & {metrics.failedBillingCount} Failed Billing Charges
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Outstanding exposure of {formatCurrency(metrics.outstandingReceivables)}. Review collections priority and retry automated attempts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard/collections">
              <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100">
                Collections Priority
              </Button>
            </Link>
            <Link href="/dashboard/health">
              <Button size="sm" className="text-xs bg-amber-700 hover:bg-amber-800 text-white">
                Open Health Center
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(metrics.mrr)}
          subtitle="Normalized recurring value"
          icon={TrendingUp}
          accentColor="indigo"
          trend={{ value: "+8.4%", isPositive: true }}
        />
        <StatCard
          title="Cash Collected (30D)"
          value={formatCurrency(metrics.revenueCollected)}
          subtitle="Verified successful payments"
          icon={CreditCard}
          accentColor="emerald"
          trend={{ value: "On Target", isPositive: true }}
        />
        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(metrics.outstandingReceivables)}
          subtitle={`${metrics.overdueInvoicesCount} overdue invoice(s)`}
          icon={AlertCircle}
          accentColor="rose"
        />
        <StatCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptionsCount}
          subtitle={`Churn: ${metrics.churnRate} | Renewals soon: ${metrics.renewalsDueSoonCount}`}
          icon={Repeat}
          accentColor="slate"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Volume Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Revenue & Invoiced Trajectory
              </CardTitle>
              <CardDescription>
                Cash collected vs. invoiced volume over the last 6 months
              </CardDescription>
            </div>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                <span>Detailed Analytics</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <RevenueTrendChart data={revenueTrends} />
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Plan Distribution
            </CardTitle>
            <CardDescription>
              MRR contribution by subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <PlanDistributionChart data={planDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Differentiating Shortcuts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/health" className="group">
          <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Subscription Health Center
              </span>
              <Badge variant="rose">Attention</Badge>
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              Actionable Lifecycle Monitor
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Identify renewals approaching, expiring plans, failed recurring charges, and pending customer cancellation requests.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/forecast" className="group">
          <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Revenue Forecast
              </span>
              <Badge variant="indigo">Projected</Badge>
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              30 / 60 / 90-Day Projections
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Calendar-aware cash flow projection calculated using active recurring contracts and scheduled billing dates.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/collections" className="group">
          <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Smart Collections Priority
              </span>
              <Badge variant="warning">Algorithmic</Badge>
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              Overdue Recovery Scoring
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Transparent rule-based scoring combining aging buckets, balance exposure, and automated attempt history.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
