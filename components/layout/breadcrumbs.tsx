"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5">
        <li className="inline-flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors font-medium"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </li>

        {segments.slice(1).map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 2).join("/");
          const isLast = idx === segments.length - 2;
          const formatted = seg
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          return (
            <li key={href} className="inline-flex items-center">
              <ChevronRight className="h-3 w-3 text-slate-400 mx-1" />
              {isLast ? (
                <span className="font-semibold text-slate-800">{formatted}</span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-slate-800 transition-colors font-medium"
                >
                  {formatted}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
