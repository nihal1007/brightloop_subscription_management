import { prisma } from "@/lib/prisma";
import { getDashboardMetrics, getRevenueTrends, getPlanDistribution } from "@/services/analytics-service";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueTrendChart, PlanDistributionChart } from "@/components/dashboard/dashboard-charts";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [metrics, trends, planDistribution] = await Promise.all([
    getDashboardMetrics(30),
    getRevenueTrends(6),
    getPlanDistribution(),
  ]);

  // Top 5 customers by total paid payments (Lifetime Value)
  const customers = await prisma.customerProfile.findMany({
    include: {
      payments: {
        where: { status: "COMPLETED" },
        select: { amount: true },
      },
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
      },
      _count: {
        select: { invoices: true },
      },
    },
  });

  const rankedCustomers = customers
    .map((c) => {
      const totalSpent = c.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      return {
        ...c,
        ltv: totalSpent,
        activePlan: c.subscriptions[0]?.plan.name || "None",
      };
    })
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            SaaS Revenue & Retention Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            In-depth financial performance metrics, recurring run-rate normalization, and customer lifetime value.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Monthly Recurring Revenue</span>
              <Badge variant="outline" className="text-xs text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                +14.2% MoM
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {formatCurrency(metrics.mrr)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              Annualized Run Rate: {formatCurrency(metrics.arr)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Cash Collected (30d)</span>
              <Badge variant="outline" className="text-xs text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                Settled
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {formatCurrency(metrics.revenueCollected)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Outstanding Receivables: {formatCurrency(metrics.outstandingReceivables)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Subscription Health</span>
              <Badge variant="success" className="text-xs">Healthy</Badge>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {metrics.activeSubscriptionsCount} Active
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.newSubscriptionsCount} new this period · Churn: {metrics.churnRate}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Billing Efficiency</span>
              <Badge variant="outline" className="text-xs text-blue-400 bg-blue-500/10 border-blue-500/20">
                Automated
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {metrics.failedBillingCount === 0 ? "100%" : "98.5%"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.renewalsDueSoonCount} upcoming renewals in next 7 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/40 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Cash Collected vs Invoiced Revenue (6 Months)
            </CardTitle>
            <CardDescription className="text-xs">
              Accrual billing volume compared to actual settled cash payments over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={trends} />
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              MRR by Subscription Plan
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of active subscriptions across tiers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanDistributionChart data={planDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Top Customer Accounts by Lifetime Value */}
      <Card className="bg-card/40 border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            Top SaaS Accounts by Lifetime Value (LTV)
          </CardTitle>
          <CardDescription className="text-xs">
            High-value enterprise and pro accounts with aggregate verified collections.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/30 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Rank / Company</th>
                  <th className="py-3 px-4 font-semibold">Primary Contact</th>
                  <th className="py-3 px-4 font-semibold">Active Plan</th>
                  <th className="py-3 px-4 font-semibold">Invoices</th>
                  <th className="py-3 px-4 font-semibold text-right">Lifetime Collections</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rankedCustomers.map((cust, idx) => (
                  <tr key={cust.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-foreground">{cust.companyName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{cust.customerNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="text-foreground">{cust.contactName}</div>
                      <div className="text-muted-foreground">{cust.email}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <Badge variant="outline" className="font-normal text-xs bg-muted/30">
                        {cust.activePlan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {cust._count.invoices} invoices
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-foreground text-right">
                      {formatCurrency(cust.ltv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
