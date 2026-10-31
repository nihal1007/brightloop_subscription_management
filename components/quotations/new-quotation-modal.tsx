"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, FileSpreadsheet, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface NewQuotationModalProps {
  customers: Array<{ id: string; companyName: string; customerNumber: string }>;
  plans: Array<{ id: string; name: string; basePrice: any; billingInterval: string }>;
}

export function NewQuotationModal({ customers = [], plans = [] }: NewQuotationModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [customerId, setCustomerId] = React.useState(customers[0]?.id || "");
  const [planId, setPlanId] = React.useState(plans[0]?.id || "");
  const [paymentTerms, setPaymentTerms] = React.useState("Immediate");
  const [notes, setNotes] = React.useState("");

  const [lines, setLines] = React.useState([
    {
      description: "SaaS Subscription License",
      quantity: 1,
      unitPrice: "4999.00",
      taxRate: "18.00",
      discountAmount: "0.00",
    },
  ]);

  const addLine = () => {
    setLines([
      ...lines,
      {
        description: "Additional Seat / Module",
        quantity: 1,
        unitPrice: "1000.00",
        taxRate: "18.00",
        discountAmount: "0.00",
      },
    ]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: string, val: any) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: val };
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError("Please select a target customer.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          planId: planId || undefined,
          paymentTerms,
          notes: notes || undefined,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create quotation.");

      alert(`Quotation ${data.quotation.quotationNumber} created successfully!`);
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating quotation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 shadow-sm">
        <Plus className="h-3.5 w-3.5" />
        <span>New Quotation</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Create New Quotation</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Customer *
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.customerNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Associated Plan
                  </label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Custom Line Bundle</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.basePrice.toString()}/{p.billingInterval.toLowerCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Line Items
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={addLine} className="h-6 text-xs text-indigo-600">
                    <Plus className="h-3 w-3 mr-1" />
                    <span>Add Line</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => updateLine(idx, "description", e.target.value)}
                          className="flex-1"
                          required
                        />
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Qty</span>
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updateLine(idx, "quantity", parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Unit Price (₹)</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => updateLine(idx, "unitPrice", e.target.value)}
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Tax (%)</span>
                          <Input
                            type="number"
                            step="0.1"
                            value={line.taxRate}
                            onChange={(e) => updateLine(idx, "taxRate", e.target.value)}
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Discount (₹)</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={line.discountAmount}
                            onChange={(e) => updateLine(idx, "discountAmount", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notes
                  </label>
                  <Input
                    placeholder="Custom clauses or SLA remarks..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={loading}>
                  Generate Quotation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
