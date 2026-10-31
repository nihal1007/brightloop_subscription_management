import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Repeat, Plus, Filter, Calendar, AlertCircle } from "lucide-react";
import { SubscriptionActions } from "@/components/subscriptions/subscription-actions";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const statusFilter = searchParams?.status;

  const subscriptions = await prisma.subscription.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    include: {
      customer: true,
      plan: true,
      lines: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statusBadges: Record<string, "success" | "indigo" | "warning" | "danger" | "secondary"> = {
    ACTIVE: "success",
    CONFIRMED: "indigo",
    PAUSED: "warning",
    CLOSED: "danger",
    DRAFT: "secondary",
    QUOTATION: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Lifecycle
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active recurring commitments, agreed unit prices, renewal intervals, and state transitions.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <a
            href="/dashboard/subscriptions"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              !statusFilter ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </a>
          <a
            href="/dashboard/subscriptions?status=ACTIVE"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === "ACTIVE" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active
          </a>
          <a
            href="/dashboard/subscriptions?status=PAUSED"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === "PAUSED" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paused
          </a>
          <a
            href="/dashboard/subscriptions?status=CLOSED"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === "CLOSED" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Closed
          </a>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold">
            Subscription Records ({subscriptions.length})
          </CardTitle>
          <CardDescription>
            Live state, next billing date schedules, and agreed recurring amounts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Subscription ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan & Interval</th>
                  <th className="py-3 px-4">Next Billing Date</th>
                  <th className="py-3 px-4">Recurring Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((s) => {
                  const hasCancelRequest = Boolean(s.cancelRequestedAt);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {s.subscriptionNumber}
                        {hasCancelRequest && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            <span>Cancel Requested</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.customer.companyName}</div>
                        <div className="text-[11px] text-slate-400">{s.customer.contactName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{s.plan.name}</div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {s.billingInterval.toLowerCase()} recurring
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{formatDate(s.nextBillingDate)}</div>
                        <div className="text-[10px] text-slate-400">
                          Terms: {s.paymentTerms}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {formatCurrency(s.totalRecurringAmount, s.customer.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadges[s.status] || "secondary"} className="text-[10px]">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <SubscriptionActions
                          subscriptionId={s.id}
                          status={s.status}
                          allowPause={s.plan.allowPause}
                          hasCancelRequest={hasCancelRequest}
                        />
                      </td>
                    </tr>
                  );
                })}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No subscriptions matching the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
