import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerPaymentsPage() {
  const user = await getCurrentUser();

  if (!user?.email) return null;

  const customer = await prisma.customerProfile.findUnique({
    where: { email: user.email },
    include: {
      payments: {
        include: { invoice: true },
        orderBy: { paymentDate: "desc" },
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
          Payment History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete log of confirmed payments and clearance receipts for {customer.companyName}.
        </p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold">
            Payment Receipts ({customer.payments.length})
          </CardTitle>
          <CardDescription>
            All recorded remittances credited to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Payment Reference</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {p.paymentReference}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-600">
                      {p.invoice.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {p.paymentMethod.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(p.paymentDate, "dd MMM yyyy, hh:mm a")}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 text-sm">
                      {formatCurrency(p.amount, customer.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" className="text-[10px]">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {customer.payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                      No payments recorded yet.
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
