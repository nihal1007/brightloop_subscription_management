import * as React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Printer,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/invoices/print-button";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      subscription: {
        include: { plan: true },
      },
      lines: {
        include: { product: true, variant: true },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const statusVariant: Record<string, "success" | "warning" | "danger" | "indigo" | "secondary"> = {
    PAID: "success",
    PARTIALLY_PAID: "warning",
    OVERDUE: "danger",
    CONFIRMED: "indigo",
    DRAFT: "secondary",
    CANCELLED: "secondary",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header - Hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Invoice Document Canvas */}
      <div className="bg-card text-foreground rounded-xl border border-border shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Brightloop Software Inc.</h2>
              <p className="text-xs text-muted-foreground">SaaS Subscription Management Suite</p>
              <p className="text-xs text-muted-foreground">GSTIN: 27AABCB1234F1Z8</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Tax Invoice
            </span>
            <span className="text-2xl font-mono font-bold text-primary block mt-0.5">
              {invoice.invoiceNumber}
            </span>
            <div className="mt-1.5">
              <Badge variant={statusVariant[invoice.status] || "secondary"} className="text-xs">
                {invoice.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-border text-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Billed To
            </h3>
            <div className="font-semibold text-foreground text-base">{invoice.customer.companyName}</div>
            <div className="text-muted-foreground text-xs mt-1">Attn: {invoice.customer.contactName}</div>
            <div className="text-muted-foreground text-xs">{invoice.customer.email}</div>
            {invoice.customer.billingAddress && (
              <div className="text-muted-foreground text-xs mt-1 leading-relaxed">
                {invoice.customer.billingAddress}
              </div>
            )}
            {invoice.customer.taxNumber && (
              <div className="text-xs font-mono text-muted-foreground mt-1">
                GSTIN/VAT: {invoice.customer.taxNumber}
              </div>
            )}
          </div>

          <div className="space-y-2 sm:text-right text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 sm:text-right">
              Invoice Summary
            </h3>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-muted-foreground">Issue Date:</span>
              <span className="font-medium text-foreground">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium text-foreground">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.subscription && (
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-muted-foreground">Subscription Ref:</span>
                <span className="font-mono font-medium text-foreground">
                  {invoice.subscription.subscriptionNumber} ({invoice.subscription.plan.name})
                </span>
              </div>
            )}
            {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-muted-foreground">Billing Period:</span>
                <span className="text-foreground">
                  {formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-8 border-b border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-border/60">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 text-center font-semibold">Qty</th>
                <th className="pb-3 text-right font-semibold">Unit Price</th>
                <th className="pb-3 text-right font-semibold">Tax</th>
                <th className="pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoice.lines.map((line) => (
                <tr key={line.id} className="text-xs">
                  <td className="py-3">
                    <div className="font-semibold text-foreground">{line.description}</div>
                    {line.variant && (
                      <div className="text-[11px] text-muted-foreground">
                        Variant: {line.variant.variantName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-center text-muted-foreground">{line.quantity}</td>
                  <td className="py-3 text-right text-muted-foreground font-mono">
                    {formatCurrency(line.unitPrice)}
                  </td>
                  <td className="py-3 text-right text-muted-foreground font-mono">
                    {line.taxRate.toString()}% ({formatCurrency(line.taxAmount)})
                  </td>
                  <td className="py-3 text-right font-bold text-foreground font-mono">
                    {formatCurrency(line.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Financial Totals */}
        <div className="py-6 flex flex-col sm:flex-row justify-between gap-6">
          <div className="text-xs text-muted-foreground max-w-sm space-y-2">
            <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Payment Instructions
            </p>
            <p>Direct Bank Transfer / NEFT / RTGS</p>
            <p className="font-mono">Bank: HDFC Bank Ltd. · A/C: 50200012345678</p>
            <p className="font-mono">IFSC: HDFC0001234 · Branch: Cyber City, Gurugram</p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between py-1 text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono text-foreground">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {Number(invoice.discountTotal) > 0 && (
              <div className="flex justify-between py-1 text-emerald-400">
                <span>Discount Applied:</span>
                <span className="font-mono">-{formatCurrency(invoice.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 text-muted-foreground">
              <span>Tax Total (GST):</span>
              <span className="font-mono text-foreground">{formatCurrency(invoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-b border-border text-sm font-bold text-foreground">
              <span>Grand Total:</span>
              <span className="font-mono text-primary">{formatCurrency(invoice.grandTotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-emerald-400">
              <span>Amount Paid:</span>
              <span className="font-mono">-{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-foreground">
              <span>Balance Due:</span>
              <span className="font-mono text-base text-foreground">
                {formatCurrency(invoice.outstandingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Recorded Payments & Receipts
            </h4>
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-foreground">{p.paymentReference}</span>
                    <span className="text-muted-foreground ml-2">via {p.paymentMethod}</span>
                    <span className="text-muted-foreground ml-2">on {formatDate(p.paymentDate)}</span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
