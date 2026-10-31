import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Repeat, Calendar, Check, AlertCircle } from "lucide-react";
import { PortalSubRowActions } from "@/components/portal/portal-sub-row";

export const dynamic = "force-dynamic";

export default async function CustomerSubscriptionsPage() {
  const user = await getCurrentUser();

  if (!user?.email) return null;

  const customer = await prisma.customerProfile.findUnique({
    where: { email: user.email },
    include: {
      subscriptions: {
        include: {
          plan: {
            include: { planProducts: { include: { product: true } } },
          },
          lines: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) {
    return <div>No customer account found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Subscriptions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your enrolled SaaS plans, contractual recurring amounts, and upcoming renewal dates.
        </p>
      </div>

      <div className="space-y-4">
        {customer.subscriptions.map((s) => (
          <Card key={s.id}>
            <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                    {s.subscriptionNumber}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {s.plan.name}
                  </span>
                  <Badge variant={s.status === "ACTIVE" ? "success" : s.status === "PAUSED" ? "warning" : "secondary"}>
                    {s.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600">
                  {s.plan.description || "Active subscription commitment."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Recurring Price</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatCurrency(s.totalRecurringAmount, customer.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Billing Frequency</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {s.billingInterval.toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Next Renewal</span>
                    <span className="font-semibold text-indigo-700">
                      {formatDate(s.nextBillingDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Payment Terms</span>
                    <span className="font-semibold text-slate-800">
                      {s.paymentTerms}
                    </span>
                  </div>
                </div>

                {/* Included features */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Entitlements & Included Modules
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.lines.map((l) => (
                      <span key={l.id} className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        ✓ {l.description} (Qty: {l.quantity})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions side */}
              <div className="flex flex-col items-end justify-between self-stretch shrink-0 pt-1">
                <PortalSubRowActions
                  subscriptionId={s.id}
                  subscriptionNumber={s.subscriptionNumber}
                  planName={s.plan.name}
                  allowCancel={s.plan.allowEarlyCancel}
                  hasCancelRequest={Boolean(s.cancelRequestedAt)}
                  status={s.status}
                />
              </div>
            </div>
          </Card>
        ))}

        {customer.subscriptions.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
            No active subscriptions found for this account.
          </div>
        )}
      </div>
    </div>
  );
}
