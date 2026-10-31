"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, X, CheckCircle, ShieldCheck } from "lucide-react";

export function InvoiceReceiptModal({
  invoice,
  onClose,
}: {
  invoice: any;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Modal Top Actions */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
          <span className="text-xs font-bold text-slate-700">Tax Invoice / Receipt</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-7 text-xs gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </Button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 space-y-6 text-slate-900 text-xs">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-base">
                  B
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">Brightloop Software</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Brightloop Technologies Pvt Ltd<br />
                Prestige Tech Cloud, Bengaluru 560103, India<br />
                GSTIN: 29AABCB1234F1Z9 • support@brightloop.io
              </p>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-slate-900 block font-mono">
                {invoice.invoiceNumber}
              </span>
              <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                <div>Issue Date: {formatDate(invoice.issueDate)}</div>
                <div>Due Date: {formatDate(invoice.dueDate)}</div>
                <div className="font-semibold text-slate-800">Status: {invoice.status}</div>
              </div>
            </div>
          </div>

          {/* Customer & Billing Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoice.customer.companyName}</p>
              <p className="text-slate-600 mt-0.5">{invoice.customer.contactName}</p>
              <p className="text-slate-500 text-[11px]">{invoice.customer.billingAddress}</p>
              {invoice.customer.taxNumber && (
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Tax/GST ID: {invoice.customer.taxNumber}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Payment & Contract Terms
              </span>
              <p className="font-medium text-slate-700">Terms: {invoice.paymentTerms || "Immediate"}</p>
              {invoice.billingPeriodStart && (
                <p className="text-slate-500 text-[11px] font-mono mt-1">
                  Period: {formatDate(invoice.billingPeriodStart)} to {formatDate(invoice.billingPeriodEnd)}
                </p>
              )}
            </div>
          </div>

          {/* Lines Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Tax (18%)</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.lines.map((l: any) => (
                <tr key={l.id}>
                  <td className="py-2.5 font-medium text-slate-800">{l.description}</td>
                  <td className="py-2.5 text-center">{l.quantity}</td>
                  <td className="py-2.5 text-right">{formatCurrency(l.unitPrice, invoice.currency)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(l.taxAmount, invoice.currency)}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">
                    {formatCurrency(l.lineTotal, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-800">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (GST):</span>
                <span className="font-medium text-slate-800">{formatCurrency(invoice.taxTotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-rose-600 border-t border-slate-200 pt-1">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.outstandingAmount, invoice.currency)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Computer-generated official tax invoice. Authorized electronically.</span>
            <span>Brightloop Subscription Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
}
