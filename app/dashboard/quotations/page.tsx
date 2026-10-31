import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileSpreadsheet, Plus, Calendar, User, ArrowRight } from "lucide-react";
import { ConvertQuotationButton } from "@/components/quotations/quotation-actions";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: {
      customer: true,
      plan: true,
      lines: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quotations & Conversion
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build proposals with agreed pricing and execute transactional conversion into active recurring subscriptions.
          </p>
        </div>

        <Button size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          <span>New Quotation</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold">
            All Quotations ({quotations.length})
          </CardTitle>
          <CardDescription>
            Agreed terms, line items, taxes, discounts, and subscription conversion states
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Target Plan</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Subtotal & Tax</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4 text-right">Conversion Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => {
                  const statusVariants: Record<string, "secondary" | "success" | "warning" | "danger" | "indigo"> = {
                    DRAFT: "secondary",
                    SENT: "indigo",
                    ACCEPTED: "success",
                    REJECTED: "danger",
                    EXPIRED: "warning",
                  };

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {q.quotationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{q.customer.companyName}</div>
                        <div className="text-[11px] text-slate-400">{q.customer.contactName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {q.plan?.name || "Custom Line Bundle"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>Issue: {formatDate(q.issueDate)}</div>
                        <div className="text-[11px] text-slate-400">Exp: {formatDate(q.expiryDate)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariants[q.status] || "secondary"} className="text-[10px]">
                          {q.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>Sub: {formatCurrency(q.subtotal, q.customer.currency)}</div>
                        <div className="text-[11px] text-slate-400">Tax: {formatCurrency(q.taxTotal, q.customer.currency)}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {formatCurrency(q.grandTotal, q.customer.currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ConvertQuotationButton
                          quotationId={q.id}
                          quotationNumber={q.quotationNumber}
                          isConverted={Boolean(q.convertedToSubscriptionId)}
                          convertedSubId={q.convertedToSubscriptionId}
                        />
                      </td>
                    </tr>
                  );
                })}
                {quotations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                      No quotations found.
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
