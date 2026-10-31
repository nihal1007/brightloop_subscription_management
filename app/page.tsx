import Link from "next/link";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Calendar,
  CreditCard,
  Bot,
  Activity,
  BarChart3,
  Users,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="border-b border-border/40 backdrop-blur sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Brightloop
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary ml-1.5 px-1.5 py-0.5 rounded bg-primary/10">
                SaaS Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5">
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary bg-primary/5 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Hackathon Edition · Production-Minded Subscription Architecture
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Recurring Billing &amp; Subscriptions,{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Engineered with Precision
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Brightloop powers subscription lifecycles, calendar-aware billing engines, 
              mathematically exact financial ledgers, and intelligent collections for modern B2B SaaS.
            </p>

            {/* Quick Launch Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 h-12 px-6 text-base shadow-lg shadow-primary/20">
                  <BarChart3 className="h-5 w-5" />
                  Admin &amp; Staff Dashboard
                </Button>
              </Link>
              <Link href="/portal">
                <Button size="lg" variant="outline" className="gap-2 h-12 px-6 text-base border-border">
                  <Users className="h-5 w-5" />
                  Customer Self-Service Portal
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="gap-2 h-12 px-5 text-base text-muted-foreground">
                  1-Click Role Switcher
                </Button>
              </Link>
            </div>

            {/* Demo Quick Logins Banner */}
            <div className="pt-8 max-w-2xl mx-auto">
              <Card className="bg-card/40 border-border/60 text-left p-4 backdrop-blur">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Pre-configured Hackathon Demo Accounts (Password: Brightloop@2026!)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-muted/30 border border-border/30">
                    <span className="font-bold text-foreground block">Admin (Full Access)</span>
                    <span className="text-muted-foreground font-mono text-[11px]">admin@brightloop.io</span>
                  </div>
                  <div className="p-2 rounded bg-muted/30 border border-border/30">
                    <span className="font-bold text-foreground block">Staff (Operations)</span>
                    <span className="text-muted-foreground font-mono text-[11px]">priya.sharma@brightloop.io</span>
                  </div>
                  <div className="p-2 rounded bg-muted/30 border border-border/30">
                    <span className="font-bold text-foreground block">Customer (Portal)</span>
                    <span className="text-muted-foreground font-mono text-[11px]">rahul.verma@apexcloud.io</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Pillars Grid */}
        <section className="py-16 border-t border-border/40 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Engineered Beyond Static Prototypes
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                A fully realized subscription operating system with real database persistence, 
                exact financial arithmetic, and calendar date intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-card/40 border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Exact Decimal Precision</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Zero IEEE-754 floating point drift. All currency calculations, discounts, 
                    and GST/VAT tax lines use pure Decimal math stored as `@db.Decimal(12,2)`.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Calendar-Aware Billing</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Handles 28, 29, 30, and 31-day months. Subscriptions starting on the 31st 
                    gracefully roll to month-end without skipped intervals or date corruption.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Grounded AI Assistant</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Answers complex financial questions with live SQL aggregations—MRR, overdue balances, 
                    churn rate, and top customers with zero hallucinated figures.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Subscription Health Center</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Proactive monitoring of renewal dates within 7 days, failed billing attempts, 
                    and overdue invoices with one-click dunning triggers.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Smart Collection Priority</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dynamic recovery algorithm scoring accounts by aging debt, overdue volume, 
                    and plan tier to maximize accounts receivable cash flow.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Strict Multi-Tenant RBAC</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enforced customer ownership boundaries. Customer sessions cannot access 
                    peer invoices, quotations, or administrative settings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Brightloop Software Inc. All rights reserved. Hackathon Demonstration Release.</p>
      </footer>
    </div>
  );
}
