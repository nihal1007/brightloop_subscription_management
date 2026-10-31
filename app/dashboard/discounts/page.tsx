import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Tag, Users, ShieldCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  const discounts = await prisma.discountRule.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      applicablePlan: true,
      _count: {
        select: { redemptions: true },
      },
    },
  });

  const activeDiscounts = discounts.filter((d) => d.active).length;
  const totalRedemptions = discounts.reduce((acc, d) => acc + d._count.redemptions, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Discount Rules & Coupons
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure promotional promo codes, usage caps, per-customer limits, and plan-specific coupons.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Discount Rules</p>
              <p className="text-xl font-bold text-foreground">{discounts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Promotions</p>
              <p className="text-xl font-bold text-emerald-400">{activeDiscounts}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Redemptions</p>
              <p className="text-xl font-bold text-foreground">{totalRedemptions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card className="bg-card/40 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Configured Promotional Rules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/30 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Code / Name</th>
                  <th className="py-3 px-4 font-semibold">Type & Value</th>
                  <th className="py-3 px-4 font-semibold">Min Purchase</th>
                  <th className="py-3 px-4 font-semibold">Applicable Plan</th>
                  <th className="py-3 px-4 font-semibold">Usage / Limit</th>
                  <th className="py-3 px-4 font-semibold">Per-Customer Cap</th>
                  <th className="py-3 px-4 font-semibold">Validity</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {discounts.map((discount) => {
                  const isExpired = discount.validTo && new Date(discount.validTo) < new Date();
                  const isExhausted =
                    discount.maxUsageCount !== null &&
                    discount.currentUsageCount >= discount.maxUsageCount;

                  return (
                    <tr key={discount.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-primary flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5" />
                          {discount.discountCode}
                        </div>
                        <div className="text-xs text-muted-foreground">{discount.name}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {discount.discountType === "PERCENTAGE" ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Percent className="h-3.5 w-3.5" />
                            {discount.value.toString()}% OFF
                          </span>
                        ) : (
                          <span className="text-emerald-400">
                            {formatCurrency(discount.value)} OFF
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {discount.minPurchaseValue ? (
                          formatCurrency(discount.minPurchaseValue)
                        ) : (
                          <span className="text-muted-foreground/60">No minimum</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {discount.applicablePlan ? (
                          <Badge variant="outline" className="font-normal text-xs bg-muted/40">
                            {discount.applicablePlan.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/70">All Plans</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">
                            {discount.currentUsageCount}
                          </span>
                          <span className="text-muted-foreground">
                            / {discount.maxUsageCount !== null ? discount.maxUsageCount : "∞"}
                          </span>
                        </div>
                        {isExhausted && (
                          <span className="text-[10px] text-amber-500 font-medium">Exhausted</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {discount.perCustomerLimit ? `${discount.perCustomerLimit} per customer` : "Unlimited"}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <div>From: {formatDate(discount.validFrom)}</div>
                        <div>To: {discount.validTo ? formatDate(discount.validTo) : "Never"}</div>
                      </td>
                      <td className="py-3 px-4">
                        {discount.active && !isExpired && !isExhausted ? (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        ) : isExpired ? (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Expired</Badge>
                        ) : isExhausted ? (
                          <Badge variant="warning" className="text-xs">Max Used</Badge>
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
