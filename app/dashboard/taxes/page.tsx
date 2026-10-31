import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Percent, CheckCircle2, ShieldCheck, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TaxesPage() {
  const taxes = await prisma.taxRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activeTaxes = taxes.filter((t) => t.active).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Tax Configuration & Rules
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage fiscal tax rules, percentage or fixed calculation types, and inclusive vs. exclusive tax policies.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Configured Tax Rules</p>
              <p className="text-xl font-bold text-foreground">{taxes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Tax Rates</p>
              <p className="text-xl font-bold text-emerald-400">{activeTaxes}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Compliance Standards</p>
              <p className="text-xl font-bold text-foreground">GST & VAT Ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rules Table */}
      <Card className="bg-card/40 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active & Historical Tax Rates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/30 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tax Code / Description</th>
                  <th className="py-3 px-4 font-semibold">Rate / Amount</th>
                  <th className="py-3 px-4 font-semibold">Calculation Mode</th>
                  <th className="py-3 px-4 font-semibold">Inclusive / Exclusive</th>
                  <th className="py-3 px-4 font-semibold">Effective Range</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {taxes.map((tax) => {
                  return (
                    <tr key={tax.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-primary flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5" />
                          {tax.taxCode}
                        </div>
                        <div className="text-xs text-muted-foreground">{tax.name}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {tax.taxType === "PERCENTAGE" ? (
                          <span className="flex items-center gap-1 text-primary">
                            <Percent className="h-3.5 w-3.5" />
                            {tax.rate.toString()}%
                          </span>
                        ) : (
                          <span>₹{tax.rate.toString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <Badge variant="outline" className="font-normal text-xs bg-muted/30">
                          {tax.taxType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {tax.isInclusive ? (
                          <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-500/30">
                            Inclusive in price
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-sky-400 border-sky-500/30">
                            Added on checkout (Exclusive)
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <div>From: {formatDate(tax.effectiveFrom)}</div>
                        <div>To: {tax.effectiveTo ? formatDate(tax.effectiveTo) : "Present"}</div>
                      </td>
                      <td className="py-3 px-4">
                        {tax.active ? (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Disabled</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
