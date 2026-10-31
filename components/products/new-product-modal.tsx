"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Package } from "lucide-react";

export function NewProductModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    productCode: "",
    name: "",
    description: "",
    productType: "SERVICE",
    salesPrice: "",
    costPrice: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product.");

      alert(`Product "${data.product.name}" created successfully!`);
      setOpen(false);
      setForm({
        productCode: "",
        name: "",
        description: "",
        productType: "SERVICE",
        salesPrice: "",
        costPrice: "0",
      });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 shadow-sm">
        <Plus className="h-3.5 w-3.5" />
        <span>New Product</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Create New Product</h3>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Code *
                </label>
                <Input
                  required
                  placeholder="e.g. PROD-SECURITY-SCAN"
                  value={form.productCode}
                  onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Automated Vulnerability Scanner"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Type
                </label>
                <select
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SERVICE">SERVICE</option>
                  <option value="LICENSE">LICENSE</option>
                  <option value="USAGE">USAGE</option>
                  <option value="PHYSICAL">PHYSICAL</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sales Price (₹) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1999.00"
                    value={form.salesPrice}
                    onChange={(e) => setForm({ ...form, salesPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="350.00"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short service or feature description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={loading}>
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
