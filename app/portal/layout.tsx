import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  CreditCard,
  User,
  LogOut,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const customerUser = user;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Customer Navigation Bar */}
      <header className="h-16 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-6">
          <Link href="/portal" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-sm shadow-indigo-300">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-900 leading-none text-base">
                Brightloop
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                Customer Self-Service Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <Link
              href="/portal"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/portal/subscriptions"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              My Subscriptions
            </Link>
            <Link
              href="/portal/invoices"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Invoices & Receipts
            </Link>
            <Link
              href="/portal/payments"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Payment History
            </Link>
            <Link
              href="/portal/profile"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Billing Details
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Switch to Admin link for reviewers */}
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 hidden sm:inline-flex items-center gap-1"
          >
            <span>Staff Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
              {customerUser.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {customerUser.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {customerUser.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Portal View */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {children}
      </main>

      <footer className="py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-400">
        Brightloop Software Customer Portal © 2026. All transactions encrypted with SHA-256.
      </footer>
    </div>
  );
}
