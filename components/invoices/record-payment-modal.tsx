"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface RecordPaymentModalProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    currency: string;
    outstandingAmount: string | number;
    grandTotal: string | number;
  };
  onClose: () => void;
}

export function RecordPaymentModal({ invoice, onClose }: RecordPaymentModalProps) {
  const router = useRouter();
  const [amount, setAmount] = React.useState(String(invoice.outstandingAmount));
  const [method, setMethod] = React.useState<"UPI" | "BANK_TRANSFER" | "CARD" | "CASH">("BANK_TRANSFER");
  const [ref, setRef] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: parseFloat(amount),
          paymentMethod: method,
          externalReference: ref || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment recording failed.");

      alert(`Payment of ${formatCurrency(amount, invoice.currency)} recorded successfully! Ref: ${data.payment.paymentReference}`);
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error recording payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Record Payment — {invoice.invoiceNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Total:</span>
              <span className="text-slate-700">{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-1 font-bold">
              <span className="text-slate-700">Outstanding Balance:</span>
              <span className="text-rose-600">{formatCurrency(invoice.outstandingAmount, invoice.currency)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount ({invoice.currency})
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={String(invoice.outstandingAmount)}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI (Unified Payments Interface)</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash / Cheque</option>
              <option value="OTHER">Other Gateway / Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              External Reference / UTR Number
            </label>
            <Input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. UTR-982348231 / Bank TXN ID"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Notes (Optional)
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via HDFC Corporate Account"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span>Confirm Payment</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
