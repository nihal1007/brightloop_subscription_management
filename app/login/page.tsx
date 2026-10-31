"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles, Building2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@brightloop.io");
  const [password, setPassword] = React.useState("BrightLoop@2026!");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      if (data.user.role === "CUSTOMER") {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (role: "ADMIN" | "STAFF" | "CUSTOMER") => {
    setError(null);
    if (role === "ADMIN") {
      setEmail("admin@brightloop.io");
      setPassword("BrightLoop@2026!");
    } else if (role === "STAFF") {
      setEmail("sarah.staff@brightloop.io");
      setPassword("BrightLoop@2026!");
    } else {
      setEmail("vikram@acmeinnovations.com");
      setPassword("BrightLoop@2026!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-indigo-300">
            B
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to Brightloop
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Unified Subscription Management & Revenue Automation Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-2 gap-2"
            >
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Demo Account Switcher for Hackathon Reviewers */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hackathon Demo Logins (1-Click)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount("ADMIN")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Admin</span>
                <span className="text-[9px] text-slate-400">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("STAFF")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center"
              >
                <UserCheck className="h-4 w-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Staff</span>
                <span className="text-[9px] text-slate-400">Quotes & Billing</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("CUSTOMER")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center"
              >
                <Building2 className="h-4 w-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Customer</span>
                <span className="text-[9px] text-slate-400">Self-Service</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Brightloop Software © 2026. Secure cryptographic session active.
        </p>
      </div>
    </div>
  );
}
