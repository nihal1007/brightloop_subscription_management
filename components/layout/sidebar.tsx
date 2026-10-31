"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileSpreadsheet,
  Repeat,
  Receipt,
  CreditCard,
  Percent,
  BarChart3,
  Bell,
  Settings,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  Bot,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "indigo" | "rose" | "emerald";
  roles?: string[];
}

const mainNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Plans", href: "/dashboard/plans", icon: Layers },
  { label: "Quotations", href: "/dashboard/quotations", icon: FileSpreadsheet },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat },
  { label: "Invoices", href: "/dashboard/invoices", icon: Receipt },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  {
    label: "Discounts",
    href: "/dashboard/discounts",
    icon: Percent,
    roles: ["ADMIN"],
  },
  {
    label: "Taxes",
    href: "/dashboard/taxes",
    icon: Landmark,
    roles: ["ADMIN"],
  },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

const intelligenceNavItems: NavItem[] = [
  {
    label: "Health Center",
    href: "/dashboard/health",
    icon: HeartPulse,
    badge: "Attention",
    badgeVariant: "rose",
  },
  {
    label: "Revenue Forecast",
    href: "/dashboard/forecast",
    icon: TrendingUp,
  },
  {
    label: "Smart Collections",
    href: "/dashboard/collections",
    icon: AlertTriangle,
    badge: "Scored",
    badgeVariant: "rose",
  },
  {
    label: "AI Assistant",
    href: "/dashboard/assistant",
    icon: Bot,
    badge: "Verified",
    badgeVariant: "indigo",
  },
  {
    label: "Run Billing",
    href: "/dashboard/billing-preview",
    icon: Zap,
    badge: "Auto",
    badgeVariant: "emerald",
  },
];

export function Sidebar({ userRole = "ADMIN" }: { userRole?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const filterByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    });
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 z-30 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-300 font-bold text-lg">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-900 leading-none text-base">
                Brightloop
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                Subscription Cloud
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">
              B
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors",
            collapsed && "hidden"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations
            </p>
          )}
          <nav className="space-y-0.5">
            {filterByRole(mainNavItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Intelligence / Differentiating Features */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Intelligence & Health
            </p>
          )}
          <nav className="space-y-0.5">
            {intelligenceNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 font-semibold rounded-full",
                        item.badgeVariant === "rose"
                          ? "bg-rose-100 text-rose-700"
                          : item.badgeVariant === "emerald"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-indigo-100 text-indigo-700"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Indicator Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white border border-slate-200/60 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">
                {userRole === "ADMIN" ? "Administrator" : "Staff Member"}
              </span>
              <span className="text-[10px] text-slate-500">
                Role-Based Guard Active
              </span>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="p-2 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
