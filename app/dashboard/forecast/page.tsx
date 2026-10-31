import * as React from "react";
import { getRevenueForecast } from "@/services/analytics-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Calendar, Info, ShieldCheck } from "lucide-react";
import { ForecastTimelineChart } from "@/components/forecast/forecast-chart";

export const dynamic = "force-dynamic";

export default async function ForecastPage({
  searchParams,
}: {
  searchParams?: { days?: string };
}) {
  const days = parseInt(searchParams?.days || "60", 10);
  const forecast = await getRevenueForecast(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Recurring Revenue Projection
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calendar-aware recurring billing projections derived from active subscription contracts and scheduled billing dates.
          </p>
        </div>

        {/* Forecast Horizon Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <a
            href="/dashboard/forecast?days=30"
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              days === 30 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            30 Days
          </a>
          <a
            href="/dashboard/forecast?days=60"
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              days === 60 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            60 Days
          </a>
          <a
            href="/dashboard/forecast?days=90"
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              days === 90 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            90 Days
          </a>
        </div>
      </div>

      {/* Assumptions & Integrity Notice */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs text-indigo-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Projection Methodology & Mathematical Grounding:
          </p>
          <p className="text-indigo-800 leading-relaxed">
            This projection sums contractual recurring amounts across active contracts on their scheduled renewal dates. Paused or pending-cancellation subscriptions are excluded. Figures represent potential scheduled billings and are distinct from guaranteed cash collections.
          </p>
        </div>
      </div>

      {/* Projection Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Projected Billing ({days}D)
          </span>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {formatCurrency(forecast.totalProjected)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Expected billable volume</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Contracts Analyzed
          </span>
          <div className="text-3xl font-black text-indigo-600 mt-2">
            {forecast.activeSubscriptionsConsidered}
          </div>
          <p className="text-xs text-slate-500 mt-1">Live customer accounts</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Forecast Horizon
          </span>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {forecast.horizonDays} Days
          </div>
          <p className="text-xs text-slate-500 mt-1">Calendar-aware intervals</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold">
            Projected Billing Timeline
          </CardTitle>
          <CardDescription>
            Scheduled billing events grouped by date over the next {days} days
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <ForecastTimelineChart data={forecast.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
