"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle, XCircle, RotateCw } from "lucide-react";

export function SubscriptionActions({
  subscriptionId,
  status,
  allowPause,
  hasCancelRequest,
}: {
  subscriptionId: string;
  status: string;
  allowPause: boolean;
  hasCancelRequest: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleAction = async (action: "pause" | "resume" | "close") => {
    let confirmMsg = `Are you sure you want to ${action} this subscription?`;
    if (action === "close") {
      confirmMsg = "Are you sure you want to CLOSE this subscription? This will stop future billing periods.";
    }

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error executing action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {status === "ACTIVE" && allowPause && (
        <Button
          size="sm"
          variant="outline"
          isLoading={loading}
          onClick={() => handleAction("pause")}
          className="h-7 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
          title="Pause recurring billing"
        >
          <PauseCircle className="h-3 w-3 mr-1" />
          <span>Pause</span>
        </Button>
      )}

      {status === "PAUSED" && (
        <Button
          size="sm"
          variant="outline"
          isLoading={loading}
          onClick={() => handleAction("resume")}
          className="h-7 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          title="Resume recurring billing"
        >
          <PlayCircle className="h-3 w-3 mr-1" />
          <span>Resume</span>
        </Button>
      )}

      {status !== "CLOSED" && (
        <Button
          size="sm"
          variant="ghost"
          isLoading={loading}
          onClick={() => handleAction("close")}
          className="h-7 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          title="Close subscription"
        >
          <XCircle className="h-3 w-3 mr-1" />
          <span>Close</span>
        </Button>
      )}
    </div>
  );
}
