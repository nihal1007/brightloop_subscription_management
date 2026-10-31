import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt, FileText } from "lucide-react";
import { PortalInvoiceRow } from "@/components/portal/portal-invoice-row";

export const dynamic = "force-dynamic";

export default async function CustomerInvoicesPage() {
  const user = await getCurrentUser();

  if (!user?.email) return null;

  const customer = await prisma.customerProfile.findUnique({
    where: { email: user.email },
    include: {
      invoices: {
        include: {
          customer: true,
          lines: true,
          payments: true,
        },
        orderBy: { issueDate: "desc" },
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
          Invoices & Receipts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical invoice records, payment reconciliations, and downloadable official tax receipts.
        </p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold">
            All Invoices ({customer.invoices.length})
          </CardTitle>
          <CardDescription>
            Official tax invoices issued to {customer.companyName}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                        <span className="text-emerald-600">Paid in Full</span>
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
                      <PortalInvoiceRow invoice={inv} />
                    </td>
                  </tr>
                ))}
                {customer.invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No invoices issued yet.
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
