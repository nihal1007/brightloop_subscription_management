import * as React from "react";
import { previewDueBilling } from "@/services/billing-service";
import { Zap } from "lucide-react";
import { BillingRunPanel } from "@/components/billing/billing-run-panel";

export const dynamic = "force-dynamic";

export default async function BillingPreviewPage() {
  const previews = await previewDueBilling(new Date());

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Automated Recurring Billing Engine
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Inspect eligible recurring billing cycles, verify tax and discount computations, and execute idempotent batch invoicing.
        </p>
      </div>

      <BillingRunPanel initialPreviews={previews} />
    </div>
  );
}
