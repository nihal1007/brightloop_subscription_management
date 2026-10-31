import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Layers, Plus, Check, Calendar, Repeat, PauseCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    include: {
      planProducts: {
        include: { product: true },
      },
      _count: {
        select: {
          subscriptions: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: { basePrice: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Plans
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure calendar-aware billing frequencies, trial periods, product bundling, and pause rules.
          </p>
        </div>

        <Button size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          <span>New Subscription Plan</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          return (
            <Card key={plan.id} className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {plan.planCode}
                    </span>
                    <Badge variant="indigo" className="text-[10px] font-bold">
                      {plan.billingInterval}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg font-bold text-slate-900 mt-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {plan.description || "Configured subscription plan package."}
                  </CardDescription>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(plan.basePrice)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      /{plan.billingIntervalCount > 1 ? `${plan.billingIntervalCount} ` : ""}{plan.billingInterval.toLowerCase()}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Features & Policies */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{plan.autoRenew ? "Automatic recurring renewal" : "Manual renewal"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <PauseCircle className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{plan.allowPause ? "Customer pause permitted" : "Pause disabled"}</span>
                    </div>

                    {plan.trialDays > 0 ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>{plan.trialDays}-Day Free Trial Period</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-400" />
                        <span>Immediate billing on start</span>
                      </div>
                    )}
                  </div>

                  {/* Bundled Products */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Bundled Products ({plan.planProducts.length})
                    </p>
                    <div className="space-y-1">
                      {plan.planProducts.map((pp) => (
                        <div key={pp.id} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded">
                          <span className="truncate">{pp.product.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Qty: {pp.defaultQuantity}</span>
                        </div>
                      ))}
                      {plan.planProducts.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No products attached</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 bg-slate-50/60 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {plan._count.subscriptions} Active Subscriptions
                </span>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Edit Plan
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
