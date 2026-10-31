"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Send, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: string;
  quickLinks?: Array<{ label: string; href: string }>;
}

const SAMPLE_PROMPTS = [
  "How much revenue did we collect this month?",
  "Which invoices are overdue?",
  "Which subscriptions renew next week?",
  "Which plan has the most active customers?",
  "Summarize our financial performance.",
];

export function AssistantChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your Brightloop Financial Intelligence Assistant. I am directly connected to your live subscription database to answer revenue, overdue invoice, renewal, and plan analytics queries without hallucinating figures. How can I help you today?",
      mode: "DETERMINISTIC_VERIFIED",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assistant query failed");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          mode: data.mode,
          quickLinks: data.quickLinks,
        },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Unable to process query: ${err instanceof Error ? err.message : "Error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Brightloop Financial Assistant
            </h3>
            <span className="text-[10px] text-slate-500">
              Grounded on PostgreSQL Live Transactions
            </span>
          </div>
        </div>

        <Badge variant="success" className="text-[10px] gap-1 font-semibold">
          <ShieldCheck className="h-3 w-3" />
          <span>Zero-Hallucination Guard Active</span>
        </Badge>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                AI
              </div>
            )}
            <div
              className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-xs"
                  : "bg-slate-50 text-slate-800 border border-slate-200/60 rounded-tl-xs whitespace-pre-line"
              }`}
            >
              {m.content}

              {m.quickLinks && m.quickLinks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-2">
                  {m.quickLinks.map((ql, lIdx) => (
                    <Link
                      key={lIdx}
                      href={ql.href}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                      <span>{ql.label}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-400">
            <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 animate-pulse font-bold">
              AI
            </div>
            <span>Analyzing real transactional tables...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts chips */}
      <div className="px-5 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span>Quick:</span>
        </span>
        {SAMPLE_PROMPTS.map((prompt, pIdx) => (
          <button
            key={pIdx}
            type="button"
            onClick={() => sendMessage(prompt)}
            className="text-[11px] text-slate-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/60 px-2.5 py-1 rounded-full border border-slate-200 hover:border-indigo-300 whitespace-nowrap transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any financial question (e.g. Which invoices are overdue?)"
          className="flex-1 text-xs rounded-lg border border-slate-200 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || loading}
          className="gap-1.5 h-8 px-4"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Ask</span>
        </Button>
      </form>
    </div>
  );
}
