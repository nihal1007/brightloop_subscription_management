"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export function BillingRunPanel({
  initialPreviews,
}: {
  initialPreviews: Array<{
    subscriptionId: string;
    subscriptionNumber: string;
    customerName: string;
    planName: string;
    billingInterval: string;
    billingPeriodStart: Date | string;
    billingPeriodEnd: Date | string;
    subtotal: string;
    discountTotal: string;
    taxTotal: string;
    grandTotal: string;
    prospectiveNextBillingDate: Date | string;
  }>;
}) {
  const router = useRouter();
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleRunBatch = async () => {
    if (!confirm(`Generate recurring invoices for all ${initialPreviews.length} due subscriptions now?`)) {
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/billing/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch billing failed.");
      setResult(data);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error executing billing batch.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Run Action Card */}
      <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span>Eligible Recurring Billing Queue ({initialPreviews.length})</span>
          </h3>
          <p className="text-xs text-indigo-800 mt-1">
            Subscriptions whose next billing date has arrived and are ready for invoice generation and next billing date rollover.
          </p>
        </div>

        <Button
          size="md"
          isLoading={running}
          onClick={handleRunBatch}
          disabled={initialPreviews.length === 0}
          className="gap-2 shadow-sm font-semibold shrink-0"
        >
          <Zap className="h-4 w-4" />
          <span>Execute Recurring Billing ({initialPreviews.length})</span>
        </Button>
      </div>

      {result && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Batch Billing Execution Completed Successfully!</span>
          </div>
          <p>
            Processed: <strong>{result.totalEligible}</strong> | Invoices Generated: <strong>{result.succeeded}</strong> | Skipped (Already Billed): <strong>{result.skipped}</strong> | Failures: <strong>{result.failed}</strong>
          </p>
          <Link href="/dashboard/invoices">
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs border-emerald-300 text-emerald-900 bg-white">
              <span>View Generated Invoices</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Prospective Invoices Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Preview: Prospective Invoices
          </span>
          <span className="text-xs text-slate-500">
            Transactional Idempotency & Duplicate Prevention Guaranteed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan & Interval</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Tax (GST)</th>
                <th className="py-3 px-4">Invoice Total</th>
                <th className="py-3 px-4">Next Rollover Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialPreviews.map((p) => (
                <tr key={p.subscriptionId} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">
                    {p.subscriptionNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {p.customerName}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {p.planName} ({p.billingInterval.toLowerCase()})
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {formatDate(p.billingPeriodStart)} → {formatDate(p.billingPeriodEnd)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatCurrency(p.subtotal)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatCurrency(p.taxTotal)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(p.grandTotal)}
                  </td>
                  <td className="py-3 px-4 font-medium text-emerald-700">
                    {formatDate(p.prospectiveNextBillingDate)}
                  </td>
                </tr>
              ))}
              {initialPreviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    All active subscriptions are currently up to date. No billing runs are currently due.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
