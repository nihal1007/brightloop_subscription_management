import * as React from "react";
import Link from "next/link";
import { getHealthCenterItems } from "@/services/analytics-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  HeartPulse,
  AlertTriangle,
  Clock,
  Repeat,
  ShieldAlert,
  ArrowRight,
  Zap,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HealthCenterPage() {
  const health = await getHealthCenterItems();

  const totalFlagged =
    health.failedAttempts.length +
    health.overdueInvoices.length +
    health.pendingCancellations.length +
    health.upcomingRenewals.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Subscription Health Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated monitoring of critical lifecycle bottlenecks, charge failures, and retention risks with recommended next actions.
          </p>
        </div>

        <Link href="/dashboard/billing-preview">
          <Button size="sm" className="gap-1.5 shadow-sm">
            <Zap className="h-3.5 w-3.5" />
            <span>Launch Billing Catch-Up</span>
          </Button>
        </Link>
      </div>

      {/* Summary Score Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Flagged Items
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalFlagged}
          </div>
          <span className="text-[11px] text-slate-500">Across 4 health categories</span>
        </div>

        <div className="p-2 md:pl-6">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
            Failed Automated Charges
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {health.failedAttempts.length}
          </div>
          <span className="text-[11px] text-slate-500">Requires retry / mandate check</span>
        </div>

        <div className="p-2 md:pl-6">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
            Overdue Accounts
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {health.overdueInvoices.length}
          </div>
          <span className="text-[11px] text-slate-500">Past due collection risks</span>
        </div>

        <div className="p-2 md:pl-6">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
            Pending Cancellations
          </span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {health.pendingCancellations.length}
          </div>
          <span className="text-[11px] text-slate-500">Customer churn intervention</span>
        </div>
      </div>

      {/* Section 1: Failed Recurring Billing Attempts */}
      <Card className="border-rose-200/80">
        <CardHeader className="py-4 bg-rose-50/40 border-b border-rose-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <CardTitle className="text-sm font-bold text-rose-900">
                Failed Billing Charges ({health.failedAttempts.length})
              </CardTitle>
            </div>
            <Badge variant="danger">Immediate Action</Badge>
          </div>
          <CardDescription className="text-xs text-rose-700">
            Automated recurring charges that encountered payment gateway timeouts or mandate failures
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {health.failedAttempts.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs">
                      {item.subscription.customer.companyName}
                    </span>
                    <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {item.subscription.subscriptionNumber}
                    </span>
                  </div>
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    Reason: {item.failureReason || "Gateway charge declined"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Plan: {item.subscription.plan.name} ({formatCurrency(item.subscription.totalRecurringAmount)}) • Attempted {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/billing-preview`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-50">
                      <span>Manual Retry</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {health.failedAttempts.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No failed recurring billing attempts recorded.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Overdue Invoices Aging */}
      <Card className="border-amber-200/80">
        <CardHeader className="py-4 bg-amber-50/40 border-b border-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-amber-900">
                Aging Overdue Accounts ({health.overdueInvoices.length})
              </CardTitle>
            </div>
            <Link href="/dashboard/collections">
              <Button variant="ghost" size="sm" className="h-6 text-xs text-amber-800 hover:bg-amber-100">
                <span>View Prioritization Scoring</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <CardDescription className="text-xs text-amber-700">
            Unpaid invoices exceeding agreed credit payment terms
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {health.overdueInvoices.map((inv) => (
              <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs">
                      {inv.customer.companyName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {inv.invoiceNumber}
                    </span>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    Balance: {formatCurrency(inv.outstandingAmount, inv.currency)} (Due {formatDate(inv.dueDate)})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/invoices?search=${encodeURIComponent(inv.invoiceNumber)}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <span>Record Payment</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Pending Customer Cancellation Requests */}
      {health.pendingCancellations.length > 0 && (
        <Card className="border-indigo-200/80">
          <CardHeader className="py-4 bg-indigo-50/40 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-indigo-900">
                Pending Cancellation Requests ({health.pendingCancellations.length})
              </CardTitle>
              <Badge variant="indigo">Retention Review</Badge>
            </div>
            <CardDescription className="text-xs text-indigo-700">
              Customers who have submitted cancellation requests through the self-service portal
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {health.pendingCancellations.map((sub) => (
                <div key={sub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs">
                      {sub.customer.companyName} ({sub.plan.name})
                    </span>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{sub.cancelReason || "No specific feedback provided"}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitted on {formatDate(sub.cancelRequestedAt)}
                    </p>
                  </div>
                  <Link href={`/dashboard/subscriptions`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Review & Resolve
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
