import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brightloop — Advanced Subscription Management Platform",
  description: "Unified recurring billing, subscription lifecycle, and revenue intelligence platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
