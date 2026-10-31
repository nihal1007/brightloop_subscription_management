import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, CheckCircle2, ShieldCheck, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: { method?: string };
}) {
  const methodFilter = searchParams?.method;

  const payments = await prisma.payment.findMany({
    where: methodFilter ? { paymentMethod: methodFilter as any } : undefined,
    include: {
      customer: true,
      invoice: true,
      recordedByUser: true,
    },
    orderBy: { paymentDate: "desc" },
  });

  const methodIcons: Record<string, string> = {
    UPI: "📱 UPI",
    BANK_TRANSFER: "🏦 Bank Transfer",
    CARD: "💳 Card",
    CASH: "💵 Cash / Cheque",
    OTHER: "🔄 Other",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payment Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction history with immutable reference logs, payment methods, and user attributions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <a
            href="/dashboard/payments"
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              !methodFilter ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Methods
          </a>
          <a
            href="/dashboard/payments?method=BANK_TRANSFER"
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              methodFilter === "BANK_TRANSFER" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bank Transfer
          </a>
          <a
            href="/dashboard/payments?method=UPI"
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              methodFilter === "UPI" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            UPI
          </a>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold">
            Recorded Transactions ({payments.length})
          </CardTitle>
          <CardDescription>
            Atomic balance deductions linked directly to reconciled invoice line records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Payment Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Method & UTR</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {p.paymentReference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.customer.companyName}</div>
                        <div className="text-[11px] text-slate-400">{p.customer.contactName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                          {p.invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {methodIcons[p.paymentMethod] || p.paymentMethod}
                        </div>
                        {p.externalReference && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {p.externalReference}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(p.paymentDate, "dd MMM yyyy, hh:mm a")}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 text-sm">
                        {formatCurrency(p.amount, p.customer.currency)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {p.recordedByUser?.name || "System Automated"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" className="text-[10px]">
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                      No recorded payments found.
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
