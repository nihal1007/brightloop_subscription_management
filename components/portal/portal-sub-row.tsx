"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RequestCancellationModal } from "./request-cancellation-modal";

export function PortalSubRowActions({
  subscriptionId,
  subscriptionNumber,
  planName,
  allowCancel,
  hasCancelRequest,
  status,
}: {
  subscriptionId: string;
  subscriptionNumber: string;
  planName: string;
  allowCancel: boolean;
  hasCancelRequest: boolean;
  status: string;
}) {
  const [showModal, setShowModal] = React.useState(false);

  if (hasCancelRequest) {
    return (
      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
        Cancellation Requested
      </span>
    );
  }

  if (status !== "ACTIVE" || !allowCancel) {
    return (
      <span className="text-[11px] text-slate-400">
        Contact Account Executive
      </span>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowModal(true)}
        className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
      >
        Request Cancel
      </Button>

      {showModal && (
        <RequestCancellationModal
          subscriptionId={subscriptionId}
          subscriptionNumber={subscriptionNumber}
          planName={planName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
