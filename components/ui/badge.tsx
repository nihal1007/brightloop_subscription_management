import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "rose"
    | "outline"
    | "indigo"
    | "emerald";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/80",
    rose: "bg-rose-50 text-rose-700 border border-rose-200/80",
    outline: "text-slate-700 border border-slate-300",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
