"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Layers } from "lucide-react";

export function NewPlanModal({
  availableProducts = [],
}: {
  availableProducts?: Array<{ id: string; name: string; productCode: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    planCode: "",
    name: "",
    description: "",
    billingInterval: "MONTHLY",
    billingIntervalCount: 1,
    basePrice: "",
    allowPause: true,
    allowEarlyCancel: true,
    productIds: [] as string[],
  });

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subscription plan.");

      alert(`Subscription plan "${data.plan.name}" created successfully!`);
      setOpen(false);
      setForm({
        planCode: "",
        name: "",
        description: "",
        billingInterval: "MONTHLY",
        billingIntervalCount: 1,
        basePrice: "",
        allowPause: true,
        allowEarlyCancel: true,
        productIds: [],
      });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 shadow-sm">
        <Plus className="h-3.5 w-3.5" />
        <span>New Subscription Plan</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Create Subscription Plan</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plan Code *
                  </label>
                  <Input
                    required
                    placeholder="e.g. PLAN-PRO-M"
                    value={form.planCode}
                    onChange={(e) => setForm({ ...form, planCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plan Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Pro Growth Tier"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Interval
                  </label>
                  <select
                    value={form.billingInterval}
                    onChange={(e) => setForm({ ...form, billingInterval: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DAILY">DAILY</option>
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Multiplier
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={form.billingIntervalCount}
                    onChange={(e) =>
                      setForm({ ...form, billingIntervalCount: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Price (₹) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="4999.00"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Target audience, inclusions, or commitments..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {availableProducts.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bundled Products
                  </label>
                  <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1.5 text-xs">
                    {availableProducts.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-mono text-[11px] text-slate-500">[{p.productCode}]</span>
                        <span className="text-slate-800">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-700 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.allowPause}
                    onChange={(e) => setForm({ ...form, allowPause: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Allow Pausing</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.allowEarlyCancel}
                    onChange={(e) => setForm({ ...form, allowEarlyCancel: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Allow Early Cancellation</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={loading}>
                  Save Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
