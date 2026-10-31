"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Check } from "lucide-react";

export function RequestCancellationModal({
  subscriptionId,
  subscriptionNumber,
  planName,
  onClose,
}: {
  subscriptionId: string;
  subscriptionNumber: string;
  planName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for your cancellation request.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_cancel",
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request submission failed.");

      alert("Your cancellation request has been submitted to the Brightloop team for review.");
      router.refresh();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error submitting request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Request Subscription Cancellation
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Subscription:</span>
              <span className="font-mono font-semibold text-slate-800">{subscriptionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Plan:</span>
              <span className="font-semibold text-slate-800">{planName}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Please let us know why you would like to cancel:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Consolidating tools, project ended, missing a specific integration..."
              className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Keep Subscription
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={loading} className="gap-1.5">
              <span>Submit Request</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
