import * as React from "react";
import Link from "next/link";
import { getSmartCollectionPriorities } from "@/services/analytics-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, ShieldAlert, ArrowRight, PhoneCall, Mail, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const priorities = await getSmartCollectionPriorities();

  const badgeVariants: Record<string, "danger" | "warning" | "indigo" | "secondary"> = {
    CRITICAL: "danger",
    HIGH: "warning",
    MEDIUM: "indigo",
    LOW: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Smart Collection Priority
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic debt recovery prioritization combining aging buckets, balance exposure, and automated attempt history.
          </p>
        </div>

        <Link href="/dashboard/invoices?status=OVERDUE">
          <Button variant="outline" size="sm" className="gap-1.5">
            <span>All Overdue Invoices</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Transparent Scoring Framework:</p>
          <p className="text-amber-800 leading-relaxed">
            The collection priority score (0–100) is calculated objectively: Days Overdue weight (max 40 pts) + Monetary Exposure weight (max 40 pts) + Previous Failed Automated Charges (max 20 pts). Each score indicates clear recovery steps rather than opaque black-box predictions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {priorities.map((item) => (
          <Card key={item.invoiceId} className="hover:border-slate-300 transition-all">
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {item.invoiceNumber}
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {item.customerName}
                  </span>
                  <Badge variant={badgeVariants[item.priorityLevel]} className="text-[10px] font-bold">
                    {item.priorityLevel} PRIORITY ({item.priorityScore}/100)
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Balance: </span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(item.outstandingAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Aging: </span>
                    <span className="font-semibold text-slate-800">
                      {item.daysOverdue} Days Past Due
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Failed Charges: </span>
                    <span className="font-semibold text-slate-800">
                      {item.failedAttemptsCount} Attempt(s)
                    </span>
                  </div>
                </div>

                {/* Transparent scoring breakdown */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {item.reasons.map((r, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                    >
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="md:w-72 bg-slate-50 p-3.5 rounded-lg border border-slate-100 flex flex-col justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Action
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {item.recommendedAction}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/dashboard/invoices?search=${encodeURIComponent(item.invoiceNumber)}`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                      Take Action
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {priorities.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No Overdue Receivables</p>
            <p className="text-slate-400 mt-1">All issued customer invoices are currently paid or within term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
