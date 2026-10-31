"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Repeat } from "lucide-react";

export function ConvertQuotationButton({
  quotationId,
  quotationNumber,
  isConverted,
  convertedSubId,
}: {
  quotationId: string;
  quotationNumber: string;
  isConverted: boolean;
  convertedSubId?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  if (isConverted) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
        <CheckCircle className="h-3.5 w-3.5" />
        <span>Converted</span>
      </div>
    );
  }

  const handleConvert = async () => {
    if (!confirm(`Convert quotation ${quotationNumber} to an active subscription? This will snapshot agreed prices and initialize recurring billing.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/quotations/${quotationId}/convert`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to convert quotation.");
      }
      alert(`Success! Created Subscription: ${data.subscription.subscriptionNumber}`);
      router.refresh();
      router.push(`/dashboard/subscriptions`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error converting quotation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="primary"
      isLoading={loading}
      onClick={handleConvert}
      className="h-7 text-xs gap-1 shadow-xs"
    >
      <Repeat className="h-3 w-3" />
      <span>Convert to Sub</span>
    </Button>
  );
}
