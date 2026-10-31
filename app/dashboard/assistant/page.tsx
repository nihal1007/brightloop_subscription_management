import * as React from "react";
import { Bot, Sparkles, ShieldCheck } from "lucide-react";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Finance Assistant
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Query business performance, overdue receivables, and renewal trends using verified natural language financial analytics.
        </p>
      </div>

      <AssistantChat />
    </div>
  );
}
