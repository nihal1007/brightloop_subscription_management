# ⚡ Brightloop — Advanced Subscription Management Platform

> A modern, production-grade subscription lifecycle, recurring billing engine, and financial operations suite engineered for high-growth B2B SaaS.

Built for the Hackathon with enterprise rigor: real database persistence, exact monetary math, calendar intelligence, customer self-service isolation, and verified AI financial queries.

---

## 🌟 Executive Summary & Key Differentiators

Unlike static frontend prototypes or toy CRUD templates, **Brightloop** implements a complete recurring billing and accounts receivable operating system:

1. **Exact Decimal Precision (Zero Floating-Point Drift)**:
   - All currencies, tax calculations, discounts, unit prices, and balances are stored as `@db.Decimal(12, 2)` in PostgreSQL and computed using `Decimal.js`.
   - Complete immunity to IEEE-754 precision bugs (e.g. `0.1 + 0.2 = 0.30000000000000004`).

2. **Calendar-Aware Recurring Billing Engine**:
   - Accounts for 28, 29, 30, and 31-day months.
   - Handles month-end rollovers: a subscription starting on January 31st bills on February 28th (or 29th on leap years), then rolls to March 31st and April 30th without skipping or corrupting dates.
   - Enforces unique period constraints `[subscriptionId, billingPeriodStart]` for 100% idempotent batch execution.

3. **Multi-Tenant Role-Based Access Control (RBAC)**:
   - `ADMIN`: Complete CRUD on products, pricing variants, subscription plans, billing runs, and platform configuration.
   - `STAFF`: Quotations, customer onboarding, invoice recording, and operational monitoring.
   - `CUSTOMER`: Strict customer isolation. Customer sessions are routed to `/portal` and cannot view peer invoices, contracts, or administrative endpoints.

4. **Intelligent Financial Modules**:
   - **Subscription Health Center**: Real-time alerts for impending renewals (<7 days), failed transaction attempts, and overdue invoices with 1-click dunning notifications.
   - **Revenue Forecast**: Algorithmic ARR and MRR projections combining active contracts, churn discount factors, and renewal schedules.
   - **Smart Collection Priority**: Multi-factor scoring model that ranks overdue customer accounts by debt age, outstanding volume, and plan tier.
   - **Grounded AI Financial Assistant**: Natural-language finance interface answering questions using deterministic database aggregations (zero fabricated metrics).

---

## 🚀 Quick Launch & Demo Credentials

Brightloop comes pre-seeded with 21 customer accounts, 4 product lines with variants, 5 tiered subscription plans, tax rules, discount rules, active subscriptions, and invoice history.

### 1-Click Role Switcher
Visit `/login` and click any of the 1-click test buttons to instantly switch active roles:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.io` | `Brightloop@2026!` | Full Admin & Operations Dashboard (`/dashboard`) |
| **Staff** | `priya.sharma@brightloop.io` | `Brightloop@2026!` | Operations, Quotations, Invoices (`/dashboard`) |
| **Customer** | `rahul.verma@apexcloud.io` | `Brightloop@2026!` | Customer Self-Service Portal (`/portal`) |

---

## 🏛 Architecture & Tech Stack

```
d:\odoo_project
├── app/
│   ├── (auth)/login/             # 1-Click Role switcher & JWT authentication
│   ├── dashboard/                # Admin & Staff back-office management suite
│   │   ├── analytics/            # Deep-dive SaaS metrics & cohorts
│   │   ├── assistant/            # Grounded AI Finance Assistant
│   │   ├── billing-preview/      # Dry-run preview & batch billing runner
│   │   ├── collections/          # Smart Collection Priority scoring
│   │   ├── customers/            # Customer directory & profile management
│   │   ├── discounts/            # Promo rules, usage limits & caps
│   │   ├── forecast/             # Revenue & cash flow projection
│   │   ├── health/               # Subscription Health Center
│   │   ├── invoices/             # Invoice ledger & printable PDF view
│   │   │   └── [id]/             # Printable invoice receipt (A4 format)
│   │   ├── notifications/        # In-app event activity stream
│   │   ├── payments/             # Atomic payment recording & ledger
│   │   ├── plans/                # Subscription plans & interval rules
│   │   ├── products/             # Catalog & pricing variants
│   │   ├── quotations/           # Quotation generation & conversion
│   │   ├── settings/             # System settings & billing policy
│   │   └── subscriptions/        # Lifecycle management (Pause/Resume/Close)
│   ├── portal/                   # Customer Self-Service Portal (Isolated)
│   │   ├── invoices/             # Customer invoice history & downloads
│   │   ├── payments/             # Customer receipt verification
│   │   ├── profile/              # Billing address & contact information
│   │   └── subscriptions/        # Active plans & cancellation requests
│   ├── api/                      # REST API endpoints with RBAC guards
│   └── page.tsx                  # Showcase landing page
├── components/                   # Modular UI kit & Recharts visualizers
├── lib/
│   ├── calculations/financial.ts # Decimal.js monetary math engine
│   ├── dates/billing-dates.ts    # Calendar & leap-year billing engine
│   ├── auth/session.ts           # Jose JWT tokens & HTTP-only cookies
│   └── permissions/rbac.ts       # Role guards & customer ownership rules
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema with Decimal precision
│   └── seed.ts                   # Deterministic hackathon demo dataset
└── tests/
    ├── unit/                     # Unit test suites (Financial, Dates, RBAC)
    └── integration/              # End-to-end lifecycle integration tests
```

---

## 🧪 Automated Test Suite (38/38 Tests Passing)

Brightloop includes comprehensive unit and integration tests powered by **Vitest**:

```bash
# Run all automated test suites
npm test
```

### Verified Test Suites:
- `tests/unit/financial.test.ts`: Decimal line item arithmetic, variant price calculations (override vs additive), tax inclusiveness, discount clamping, and balance settlements.
- `tests/unit/billing-dates.test.ts`: Month-end rollovers (Jan 31 -> Feb 28 -> Mar 31), leap year February 29 preservation, interval step math, and due date checks.
- `tests/unit/rbac.test.ts`: Role-based route boundaries and customer ownership isolation.
- `tests/integration/lifecycle.test.ts`: Complete lifecycle:
  1. Quotation creation with tax & discount calculation.
  2. Idempotent quotation conversion to active subscription.
  3. Recurring billing engine execution with idempotency & duplicate prevention.
  4. Partial payment recording (`PARTIALLY_PAID`) followed by balance settlement (`PAID`).
  5. Discount rule coupon validation and usage limit enforcement.

---

## 🔧 Local Development & Installation

### Prerequisites
- Node.js 18+ (Tested on Node.js 24)
- PostgreSQL 16 (Portable instance bundled in `.db/pgsql` or external PostgreSQL)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Set your `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brightloop?schema=public"
JWT_SECRET="brightloop-super-secret-jwt-key-2026-production"
```

### 3. Sync Database Schema & Generate Prisma Client
```bash
npx prisma db push
npx prisma generate
```

### 4. Seed Deterministic Demo Data
```bash
npx tsx prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📊 Core Business Workflows

### 1. Quotation to Subscription Conversion
- Sales creates a Quotation with custom lines, discounts, and tax rates.
- Upon customer confirmation, `convertQuotationToSubscription(id)` atomically transitions the quotation to `ACCEPTED`, generates an `ACTIVE` subscription, calculates the next billing date, and links the subscription lines.
- The conversion is **strictly idempotent**: calling it multiple times returns the existing subscription without generating duplicates.

### 2. Idempotent Recurring Billing Run
- The recurring billing engine evaluates subscriptions where `nextBillingDate <= asOfDate`.
- `previewDueBilling(asOfDate)` generates a risk-free dry-run summary.
- `executeRecurringBillingBatch(asOfDate)` generates invoices, advances `nextBillingDate` using calendar-aware interval logic, creates an audit log, and notifies the customer.
- If a billing run is triggered twice, database unique constraints and idempotency checks automatically flag existing periods as `SKIPPED`.

### 3. Partial Payments & Balance Tracking
- Payments are recorded atomically with unique sequence references (`PAY-2026-XXXX-XXXX`).
- Paying less than the grand total marks the invoice as `PARTIALLY_PAID`.
- Paying the remaining outstanding balance automatically transitions the invoice to `PAID` with zero balance.

---

## 🛡 Security & Compliance

- **HTTP-Only Cookies**: JWT tokens are signed with HMAC-SHA256 and stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- **Ownership Verification**: API routes and server actions verify that customer users can only read or mutate records matching their `customerId`.
- **Audit Trails**: Critical operations (billing runs, status modifications, payment records) log immutable records to `AuditLog`.

---

© 2026 Brightloop Software Inc. All rights reserved. Hackathon Demonstration Release.
