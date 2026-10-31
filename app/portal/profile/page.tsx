import * as React from "react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const user = await getCurrentUser();

  if (!user?.email) return null;

  const customer = await prisma.customerProfile.findUnique({
    where: { email: user.email },
  });

  if (!customer) {
    return <div>No customer profile found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account & Billing Details
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered corporate profile and tax invoicing information for {customer.companyName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Company Information</span>
            </CardTitle>
            <CardDescription>Official business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Customer ID</span>
              <span className="font-mono font-bold text-slate-800">{customer.customerNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Company Name</span>
              <span className="font-semibold text-slate-900 text-sm">{customer.companyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Contact</span>
              <span className="font-medium text-slate-800">{customer.contactName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <span className="text-slate-700">{customer.email}</span>
            </div>
            {customer.phone && (
              <div>
                <span className="text-slate-400 block text-[11px]">Phone</span>
                <span className="text-slate-700">{customer.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>Tax & Billing Address</span>
            </CardTitle>
            <CardDescription>Address printed on official GST/VAT invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Tax / GSTIN Identifier</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {customer.taxNumber || "Not Provided"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Default Invoicing Currency</span>
              <span className="font-semibold text-slate-800">{customer.currency}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Billing Address</span>
              <p className="text-slate-700 leading-relaxed mt-0.5">
                {customer.billingAddress || "No address on file."}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              To update tax credentials or legal entity name, please contact your account manager.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
