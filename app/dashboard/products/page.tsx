import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Package, Plus, Tag, Check, Layers, ArrowRight } from "lucide-react";
import { calculateVariantPrice } from "@/lib/calculations/financial";
import { NewProductModal } from "@/components/products/new-product-modal";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      _count: {
        select: {
          planProducts: true,
          subscriptionLines: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products & Variants
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage core subscription products, usage components, and explicit variant pricing models.
          </p>
        </div>

        <NewProductModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p) => {
          return (
            <Card key={p.id} className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {p.productCode}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {p.productType}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 mt-2">
                        {p.name}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        {formatCurrency(p.salesPrice)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cost: {formatCurrency(p.costPrice)}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2 text-xs line-clamp-2">
                    {p.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span>Configured Variants ({p.variants.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Used in {p._count.subscriptionLines} active line(s)
                    </span>
                  </div>

                  {p.variants.length > 0 ? (
                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50">
                      {p.variants.map((v) => {
                        const finalPrice = calculateVariantPrice({
                          basePrice: p.salesPrice,
                          pricingType: v.pricingType,
                          priceAdjustment: v.priceAdjustment,
                        });

                        return (
                          <div
                            key={v.id}
                            className="p-2.5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-800">
                                {v.variantName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                SKU: {v.sku}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-slate-900">
                                {formatCurrency(finalPrice)}
                              </div>
                              <div className="text-[10px] text-indigo-600 font-medium">
                                {v.pricingType === "ADDITIONAL"
                                  ? `+${formatCurrency(v.priceAdjustment)} addition`
                                  : `Override fixed price`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      Single base product without additional variants
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 bg-slate-50/60 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Included in {p._count.planProducts} plan(s)
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 hover:text-indigo-800">
                  <span>Manage Variants</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
