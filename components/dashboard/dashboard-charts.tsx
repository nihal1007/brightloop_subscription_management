"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6"];

export function RevenueTrendChart({
  data,
}: {
  data: Array<{ month: string; collected: number; invoiced: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), ""]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "0.5rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="collected"
            name="Cash Collected"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCollected)"
          />
          <Area
            type="monotone"
            dataKey="invoiced"
            name="Invoiced Volume"
            stroke="#4f46e5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInvoiced)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlanDistributionChart({
  data,
}: {
  data: Array<{ planName: string; count: number; recurringRevenue: number }>;
}) {
  return (
    <div className="h-72 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="recurringRevenue"
            nameKey="planName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "MRR Contribution"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "0.5rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(val) => <span className="text-xs text-slate-600">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
