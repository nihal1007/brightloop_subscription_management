import * as React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Repeat,
  Receipt,
  CreditCard,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerPortalOverviewPage() {
  const user = await getCurrentUser();

  if (!user?.email) {
    return null;
  }

  // Find customer profile matching authenticated user
  const customer = await prisma.customerProfile.findUnique({
    where: { email: user.email },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
        take: 5,
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 5,
      },
    },
  });

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800">No Customer Record Linked</h3>
        <p className="text-xs text-slate-500 mt-1">Please sign in with a registered customer account.</p>
        <Link href="/login">
          <Button size="sm" className="mt-4">Go to Login</Button>
        </Link>
      </div>
    );
  }

  const activeSubscription = customer.subscriptions[0];
  const totalOutstanding = customer.invoices.reduce((acc, inv) => {
    return acc + (inv.status !== "PAID" && inv.status !== "CANCELLED" ? Number(inv.outstandingAmount) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {customer.contactName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Account #{customer.customerNumber} • {customer.companyName}
          </p>
        </div>

        <Link href="/portal/invoices">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-slate-500" />
            <span>View All Invoices</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Plan
            </span>
            <Badge variant="indigo" className="text-[10px]">
              {activeSubscription ? "Subscribed" : "None"}
            </Badge>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {activeSubscription ? activeSubscription.plan.name : "No Active Service"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeSubscription
              ? `${formatCurrency(activeSubscription.totalRecurringAmount, customer.currency)} / ${activeSubscription.billingInterval.toLowerCase()}`
              : "Explore plan upgrades"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Next Scheduled Billing
            </span>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {activeSubscription ? formatDate(activeSubscription.nextBillingDate) : "—"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeSubscription?.autoRenew ? "Automatic recurring mandate" : "Manual payment"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Outstanding Balance
            </span>
            {totalOutstanding > 0 ? (
              <Badge variant="danger" className="text-[10px]">Due Now</Badge>
            ) : (
              <Badge variant="success" className="text-[10px]">Paid</Badge>
            )}
          </div>
          <div className="text-xl font-bold mt-2">
            {totalOutstanding > 0 ? (
              <span className="text-rose-600">{formatCurrency(totalOutstanding, customer.currency)}</span>
            ) : (
              <span className="text-emerald-600">{formatCurrency(0, customer.currency)}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalOutstanding > 0 ? "Pending payment clearance" : "All accounts in good standing"}
          </p>
        </div>
      </div>

      {/* Recent Invoices & Billing Documents */}
      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Recent Invoices & Receipts
            </CardTitle>
            <CardDescription>
              Direct access to tax invoices, payment statuses, and downloadable records
            </CardDescription>
          </div>
          <Link href="/portal/invoices">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-800 gap-1">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(inv.issueDate)}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal, customer.currency)}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {Number(inv.outstandingAmount) > 0 ? (
                        <span className="text-rose-600">{formatCurrency(inv.outstandingAmount, customer.currency)}</span>
                      ) : (
                        <span className="text-emerald-600">₹0.00</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          inv.status === "PAID"
                            ? "success"
                            : inv.status === "OVERDUE"
                            ? "danger"
                            : inv.status === "PARTIALLY_PAID"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/portal/invoices`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 hover:text-indigo-800">
                          View Receipt
                        </Button>
                      </Link>
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
