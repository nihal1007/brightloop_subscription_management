import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Building,
  CreditCard,
  Calendar,
  Lock,
  Globe,
  Database,
  CheckCircle2,
  Server,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            System & Billing Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure global SaaS tenant parameters, billing recurring intervals, currency format, and security rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company & Billing Info */}
        <Card className="bg-card/40 border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Organization Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Entity information appearing on all generated PDF invoices and quotations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">Legal Name</span>
              <span className="col-span-2 font-medium text-foreground">Brightloop Software Inc.</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">Tax Identifier</span>
              <span className="col-span-2 font-medium font-mono text-foreground">27AABCB1234F1Z8 (GSTIN)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">Registered Address</span>
              <span className="col-span-2 text-foreground">Tower B, Cyber City, Phase III, Gurugram, Haryana 122002</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">Support Contact</span>
              <span className="col-span-2 text-foreground">billing@brightloop.io / +91 124 456 7890</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2">
              <span className="text-muted-foreground">Base Currency</span>
              <span className="col-span-2">
                <Badge variant="outline" className="font-mono text-xs">INR (₹ Indian Rupee)</Badge>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Engine & Database Info */}
        <Card className="bg-card/40 border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Database Engine & Architecture
            </CardTitle>
            <CardDescription className="text-xs">
              High-concurrency PostgreSQL cluster with exact Decimal financial precision.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">Database Engine</span>
              <span className="col-span-2 font-medium text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                PostgreSQL 16 (Local Native Cluster)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">ORM & Typing</span>
              <span className="col-span-2 font-mono text-xs text-foreground">Prisma 5.22.0 (Strict Types)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">Calculation Engine</span>
              <span className="col-span-2 font-mono text-xs text-foreground">Decimal.js (Zero IEEE-754 Drift)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
              <span className="text-muted-foreground">Idempotency Mode</span>
              <span className="col-span-2">
                <Badge variant="success" className="text-xs">Enforced per billing period</Badge>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2">
              <span className="text-muted-foreground">Timezone Alignment</span>
              <span className="col-span-2 text-foreground font-mono text-xs">Asia/Kolkata (UTC +05:30)</span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Controls */}
        <Card className="bg-card/40 border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Role-Based Access Control (RBAC)
            </CardTitle>
            <CardDescription className="text-xs">
              Configured roles and server-side authorization boundaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">ADMIN Role</p>
                <p className="text-xs text-muted-foreground">Full CRUD on all products, plans, billing runs, and financial settings.</p>
              </div>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Full Access</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">STAFF Role</p>
                <p className="text-xs text-muted-foreground">Quotations, customer onboarding, invoice recording; cannot delete plans.</p>
              </div>
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">Operations</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">CUSTOMER Role</p>
                <p className="text-xs text-muted-foreground">Strictly isolated to their own customer portal, invoices, and payments.</p>
              </div>
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Isolated Portal</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Billing Policy Rules */}
        <Card className="bg-card/40 border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Calendar & Rollover Policy
            </CardTitle>
            <CardDescription className="text-xs">
              Automatic date adjustment logic for monthly and leap year billing cycles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-foreground">End of Month (31st Rollover)</p>
              <p className="text-xs text-muted-foreground">
                Subscriptions starting on the 31st automatically roll to the 28th/29th in February and 30th in 30-day months without missing a cycle.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Leap Year Preservation</p>
              <p className="text-xs text-muted-foreground">
                Annual renewals starting February 29th roll to February 28th on non-leap years, preserving annual anniversary dates.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Duplicate Invoice Protection</p>
              <p className="text-xs text-muted-foreground">
                A composite database unique constraint `[subscriptionId, billingPeriodStart]` ensures batch billing is safe to re-run idempotently at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
