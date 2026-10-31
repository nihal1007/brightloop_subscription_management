"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  LogOut,
  User,
  ShieldAlert,
  Zap,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TopbarProps {
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

export function Topbar({
  userName = "Rohan Patel (Admin)",
  userRole = "ADMIN",
  userEmail = "admin@brightloop.io",
}: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const notifications = [
    {
      id: "1",
      title: "Upcoming Subscription Renewal",
      message: "Acme Innovations Ltd renews in 3 days (₹1,41,600).",
      time: "10m ago",
      href: "/dashboard/health",
      type: "renewal",
    },
    {
      id: "2",
      title: "Overdue Invoice Notice",
      message: "Nexus Fintech Solutions has 1 overdue invoice past 25 days.",
      time: "1h ago",
      href: "/dashboard/collections",
      type: "overdue",
    },
    {
      id: "3",
      title: "Payment Received",
      message: "₹2,948.82 received via UPI for INV-2026-00001.",
      time: "3h ago",
      href: "/dashboard/payments",
      type: "payment",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to global search or relevant entity
    router.push(`/dashboard/invoices?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between z-20 shrink-0">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscriptions, customers, invoices (e.g. Acme, INV-2026-001)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </form>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Batch Billing trigger button */}
        <Link href="/dashboard/billing-preview">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs text-indigo-700 bg-indigo-50/50 border-indigo-200 hover:bg-indigo-100">
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            <span>Recurring Billing Run</span>
          </Button>
        </Link>

        {/* Customer Portal Link */}
        <Link href="/portal" target="_blank" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium hidden md:inline-flex">
          <span>Customer Portal</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                <Badge variant="indigo" className="text-[10px]">
                  3 New
                </Badge>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setShowNotifications(false)}
                    className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {n.time}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
              {userName.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {userName.split(" ")[0]}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {userRole}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                <Badge variant={userRole === "ADMIN" ? "indigo" : "secondary"} className="mt-1 text-[10px]">
                  {userRole}
                </Badge>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account & Settings</span>
                </Link>
                <Link
                  href="/dashboard/health"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
                  <span>Platform Health</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
