import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt, Search, Plus, Filter, AlertCircle } from "lucide-react";
import { getEffectiveInvoiceStatus } from "@/services/invoice-service";
import { InvoiceRowActions } from "@/components/invoices/invoice-row-actions";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: { status?: string; search?: string };
}) {
  const statusFilter = searchParams?.status;
  const search = searchParams?.search;

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as any } : {}),
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search, mode: "insensitive" } },
              { customer: { companyName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      subscription: true,
      lines: true,
      payments: true,
    },
    orderBy: { issueDate: "desc" },
  });

  const statusVariants: Record<string, "success" | "warning" | "danger" | "indigo" | "secondary"> = {
    PAID: "success",
    PARTIALLY_PAID: "warning",
    OVERDUE: "danger",
    CONFIRMED: "indigo",
    DRAFT: "secondary",
    CANCELLED: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated and manual invoice records, tax lines, partial collections, and overdue aging status.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <a
              href="/dashboard/invoices"
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                !statusFilter ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </a>
            <a
              href="/dashboard/invoices?status=PAID"
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === "PAID" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Paid
            </a>
            <a
              href="/dashboard/invoices?status=OVERDUE"
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === "OVERDUE" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overdue
            </a>
            <a
              href="/dashboard/invoices?status=PARTIALLY_PAID"
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === "PARTIALLY_PAID" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Partial
            </a>
          </div>

          <form method="GET" className="flex items-center gap-1.5">
            <input
              type="search"
              name="search"
              defaultValue={search || ""}
              placeholder="Search invoice or customer..."
              className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="submit" variant="secondary" size="sm" className="h-8">
              Search
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold">
            Invoices ({invoices.length})
          </CardTitle>
          <CardDescription>
            Historical snapshot values with exact Decimal line items and payment histories
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Issue & Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const effectiveStatus = getEffectiveInvoiceStatus(
                    inv.status,
                    inv.dueDate,
                    inv.outstandingAmount
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{inv.customer.companyName}</div>
                        <div className="text-[11px] text-slate-400">{inv.customer.contactName}</div>
                      </td>
                      <td className="py-3 px-4">
                        {inv.subscription ? (
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {inv.subscription.subscriptionNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">One-Time Manual</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>Issue: {formatDate(inv.issueDate)}</div>
                        <div className="text-[11px] text-slate-400">Due: {formatDate(inv.dueDate)}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(inv.grandTotal, inv.currency)}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {Number(inv.outstandingAmount) > 0 ? (
                          <span className="text-rose-600">
                            {formatCurrency(inv.outstandingAmount, inv.currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-600">₹0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariants[effectiveStatus] || "secondary"} className="text-[10px]">
                          {effectiveStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <InvoiceRowActions
                          invoice={{
                            id: inv.id,
                            invoiceNumber: inv.invoiceNumber,
                            customerName: inv.customer.companyName,
                            currency: inv.currency,
                            outstandingAmount: inv.outstandingAmount.toString(),
                            grandTotal: inv.grandTotal.toString(),
                            status: effectiveStatus,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                      No invoices found for the selected query.
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
