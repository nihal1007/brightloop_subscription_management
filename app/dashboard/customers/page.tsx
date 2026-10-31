import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Users, Building, Mail, Phone, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  const search = searchParams?.search || "";

  const customers = await prisma.customerProfile.findMany({
    where: search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { contactName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { customerNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      subscriptions: {
        select: { id: true, status: true, totalRecurringAmount: true },
      },
      invoices: {
        select: { id: true, status: true, outstandingAmount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage client accounts, contact details, assigned subscriptions, and account balances.
          </p>
        </div>

        <form method="GET" className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Filter by company or name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Customer Directory ({customers.length})
              </CardTitle>
              <CardDescription>
                Verified enterprise client profiles with live billing health
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Company & Contact</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Active Subscriptions</th>
                  <th className="py-3 px-4">Total Invoices</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const activeSubs = c.subscriptions.filter((s) => s.status === "ACTIVE");
                  const totalOutstanding = c.invoices.reduce((acc, inv) => {
                    return acc + (inv.status !== "PAID" && inv.status !== "CANCELLED" ? Number(inv.outstandingAmount) : 0);
                  }, 0);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {c.customerNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.companyName}</div>
                        <div className="text-[11px] text-slate-500">{c.contactName}</div>
                      </td>
                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate">{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {activeSubs.length > 0 ? (
                          <Badge variant="indigo" className="font-semibold">
                            {activeSubs.length} Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">0 Active</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.invoices.length} Invoices
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {totalOutstanding > 0 ? (
                          <span className="text-rose-600">
                            {formatCurrency(totalOutstanding, c.currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-600">Paid in Full</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/invoices?search=${encodeURIComponent(c.companyName)}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 hover:text-indigo-800">
                            <span>Invoices</span>
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No customer accounts matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
