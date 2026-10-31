# ⚡ Brightloop — Subscription Management & Recurring Billing Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Tests](https://img.shields.io/badge/tests-71%2F71%20passing%20(100%25)-success)](https://github.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.21.1-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.14-38B2AC)](https://tailwindcss.com/)

**Brightloop** is a production-minded subscription management, accounts receivable, and recurring billing web platform designed for B2B SaaS companies. Built with Next.js 14 App Router, PostgreSQL, Prisma ORM, and `Decimal.js`, Brightloop unifies product cataloging, quotation conversion, automated calendar-aware billing, customer self-service, and AI-driven financial analytics into a cohesive, high-performance web application.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Verified Demo Accounts](#-verified-demo-accounts)
- [Technology Stack](#-technology-stack)
- [Architecture & Directory Structure](#-architecture--directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [Automated Testing & QA Verification](#-automated-testing--qa-verification)
- [Core Business Workflows](#-core-business-workflows)
  - [1. Quotation to Subscription Conversion](#1-quotation-to-subscription-conversion)
  - [2. Calendar-Aware Recurring Billing Engine](#2-calendar-aware-recurring-billing-engine)
  - [3. Partial Payments & Invoice Aging](#3-partial-payments--invoice-aging)
  - [4. Customer Self-Service & Cancellation](#4-customer-self-service--cancellation)
- [Security & Multi-Tenant Data Isolation](#-security--multi-tenant-data-isolation)
- [License](#-license)

---

## 🌟 Overview

Managing B2B subscription lifecycles often results in fragmented systems: disconnected billing cycles, floating-point rounding errors in invoices, lost revenue from uncollected debts, and lack of customer self-service.

**Brightloop solves this through an end-to-end operational platform:**
- **Zero Floating-Point Drift:** Exact monetary calculations using `Decimal.js` backed by PostgreSQL `@db.Decimal(12, 2)`.
- **Calendar-Aware Recurring Billing:** Handles month-end rollovers (e.g., Jan 31 → Feb 28/29 → Mar 31) and leap-year anniversaries with idempotent dry-run previews and duplicate-invoice prevention.
- **Multi-Tenant Customer Portal:** Complete self-service portal where customers can inspect active plans, review payment history, download invoice receipts, and request cancellations—strictly isolated to their own records.
- **Innovative Financial Back-Office:** Subscription Health scoring, 12-month revenue forecasting, smart debt collection prioritization, and a natural language AI Finance Assistant that queries live database tables.

---

## 🚀 Key Features

### 1. Product Catalog & Variant Pricing
- Configurable products with multiple variants (tiers, licenses, usage add-ons).
- Pricing schemes supporting `FIXED_OVERRIDE` (replaces base product price) and `ADDITIONAL` (incremental charge).
- Active/Archived product catalog controls with SKU and code validation.

### 2. Quotation Pipeline & Lifecycle Conversion
- Create detailed proposals with real-time tax calculation (inclusive and exclusive VAT/GST) and discount validation.
- One-click quotation approval and automated conversion into an active subscription with synchronized line items.
- Full state machine: `DRAFT` ➔ `QUOTATION` ➔ `CONFIRMED` ➔ `ACTIVE` ➔ `PAUSED` ➔ `CLOSED`.

### 3. Recurring Billing Engine
- Batch recurring billing runner that inspects active subscriptions due on or before a selected date.
- **Idempotency Guarantee:** Unique constraint on `[subscriptionId, billingPeriodStart]` prevents duplicate invoice generation.
- **Interactive Dry-Run Mode:** Preview upcoming charges, line items, and affected customers without writing changes to the database.

### 4. Accounts Receivable & Partial Payments
- Real-time invoice balance tracking (`amountPaid`, `amountDue`, `subtotal`, `taxAmount`, `discountAmount`).
- Dynamic status transitions: `DRAFT` ➔ `CONFIRMED` ➔ `PARTIALLY_PAID` ➔ `PAID` / `OVERDUE`.
- Atomic payment recording generating unique sequence references (e.g., `PAY-2026-XXXX-XXXX`).
- Printable invoice receipt view with clean print styling (`/dashboard/invoices/[id]`).

### 5. Multi-Tenant Customer Portal
- Self-service portal at `/portal` isolated by authenticated user credentials.
- Customers can view subscriptions, browse past invoices, record payments, and trigger cancellation requests without staff intervention.

### 6. Innovative Financial Intelligence Tools
- **Subscription Health Center (`/dashboard/health`):** Tracks MRR at risk, renewal timelines, and account churn indicators.
- **Revenue Forecast (`/dashboard/forecast`):** 12-month forward projection modeling existing contract renewals, expansion, and churn.
- **Collection Prioritization (`/dashboard/collections`):** Ranks outstanding invoices using a weighted risk algorithm based on days overdue, amount, and customer profile history.
- **AI Financial Assistant (`/dashboard/assistant`):** Natural language query engine answering financial inquiries (e.g., *"What is our current MRR?"*, *"Show accounts overdue by 30+ days"*) directly against live PostgreSQL records.

---

## 🔑 Verified Demo Accounts

Brightloop includes a **1-Click Role Switcher** on the login page (`/login`) allowing judges and evaluators to sign in instantly under any persona:

| Role | Email | Password | Default Landing Page | Access Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.io` | `Brightloop@2026!` | `/dashboard` | Unrestricted system-wide access, settings, tax & discount rules, all customers |
| **Staff** | `priya.sharma@brightloop.io` | `Brightloop@2026!` | `/dashboard` | Operational access to products, plans, quotations, subscriptions, invoices, and payments |
| **Customer** | `rahul.verma@apexcloud.io` | `Brightloop@2026!` | `/portal` | Strictly restricted to personal subscriptions, invoices, payment history, and profile |

---

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `14.2.15` | Full-stack React framework with Server Components and API route handlers |
| **Language** | TypeScript | `5.6.3` | Type-safety across client components, backend services, and database queries |
| **Database** | PostgreSQL | `16` | ACID-compliant relational persistence with foreign keys and unique constraints |
| **ORM** | Prisma ORM | `5.21.1` | Type-safe schema definition, migrations, transactions, and seeding |
| **Financial Math** | Decimal.js | `10.4.3` | High-precision arbitrary-precision decimal arithmetic eliminating IEEE-754 errors |
| **UI Styling** | Tailwind CSS | `3.4.14` | Modern utility-first design system with responsive layouts |
| **Icons** | Lucide React | `0.453.0` | Comprehensive iconography system |
| **Charts** | Recharts | `2.13.0` | Interactive cash-flow, MRR, and plan distribution visualizations |
| **Security** | bcryptjs & jose | `^2.4.3` / `^5.9.3` | Secure password hashing (10 rounds) and encrypted JWT session cookies |
| **Testing** | Vitest | `2.1.3` | Ultra-fast unit, integration, and lifecycle test runner |

---

## 📁 Architecture & Directory Structure

```text
odoo_project/
├── app/                                # Next.js 14 App Router
│   ├── (auth)/login/                   # Authentication & 1-Click Role Switcher
│   ├── api/                            # RESTful Backend API Endpoints
│   │   ├── assistant/                  # AI Financial Assistant queries
│   │   ├── billing/run/                # Recurring billing execution & preview
│   │   ├── customers/                  # Customer management API
│   │   ├── payments/                   # Payment recording & invoice update
│   │   ├── plans/                      # Subscription plans API
│   │   ├── products/                   # Products & variants API
│   │   ├── quotations/                 # Quotation creation & conversion
│   │   └── subscriptions/              # Subscription state machine & updates
│   ├── dashboard/                      # Back-Office Admin & Staff Dashboard
│   │   ├── analytics/                  # Financial KPIs, cohorts, and metrics
│   │   ├── assistant/                  # Interactive AI Assistant UI
│   │   ├── billing-preview/            # Interactive recurring billing runner
│   │   ├── collections/                # Smart collection prioritization
│   │   ├── customers/                  # Customer directory & details
│   │   ├── discounts/                  # Promotional discount rules
│   │   ├── forecast/                   # 12-month revenue projection
│   │   ├── health/                     # Subscription health & churn risk
│   │   ├── invoices/                   # Invoices list & printable detail view
│   │   ├── notifications/              # System notifications & alerts
│   │   ├── payments/                   # Payment audit log & settlement
│   │   ├── plans/                      # Plan management with interactive modal
│   │   ├── products/                   # Product catalog with interactive modal
│   │   ├── quotations/                 # Quotation builder & conversion
│   │   ├── settings/                   # System configurations
│   │   ├── subscriptions/              # Active subscriptions & lifecycle actions
│   │   └── taxes/                      # Tax rules & GST/VAT configuration
│   └── portal/                         # Customer Self-Service Portal
│       ├── invoices/                   # Customer-isolated invoice history
│       ├── payments/                   # Customer-isolated payment receipts
│       ├── profile/                    # Customer company details & settings
│       └── subscriptions/              # Customer active plans & cancellation requests
├── components/                         # Shared UI Components
│   ├── dashboard/                      # Dashboard modals, sidebar, topbar, cards
│   ├── portal/                         # Customer portal navigation & components
│   └── ui/                             # Buttons, inputs, modals, badges, data tables
├── lib/                                # Core Utilities & Helpers
│   ├── auth/                           # NextAuth / JWT session management
│   ├── calculations/                   # Decimal.js financial & tax arithmetic
│   ├── dates/                          # Calendar-aware billing interval calculations
│   └── permissions/                    # RBAC matrix & tenant ownership verification
├── prisma/                             # Database Layer
│   ├── schema.prisma                   # 13 interconnected relational models
│   └── seed.ts                         # Complete realistic demo dataset
├── services/                           # Pure Business Logic Layer
│   ├── ai-assistant-service.ts         # Natural language financial intelligence
│   ├── analytics-service.ts            # MRR, ARR, churn, aging, and forecasting
│   ├── billing-service.ts              # Idempotent batch billing engine
│   ├── discount-service.ts             # Discount validation & usage caps
│   ├── invoice-service.ts              # Invoice creation & sequence numbering
│   ├── payment-service.ts              # Atomic payment settlement & balance update
│   ├── subscription-service.ts         # Subscription state transitions & conversions
│   └── tax-service.ts                  # Tax rate calculation engine
├── tests/                              # Vitest Automated Test Suite
│   ├── unit/                           # Financial, date math, and RBAC tests
│   └── integration/                    # Subscription lifecycle & QA audit suite
├── .env.example                        # Template environment variables
├── package.json                        # Scripts and dependencies
└── vitest.config.ts                    # Vitest configuration
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14` or higher (PostgreSQL 16 recommended)
- **Git**

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR-GITHUB-REPOSITORY-URL>
   cd odoo_project
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(Review `.env` to verify your PostgreSQL connection URL and JWT secret).*

4. **Initialize and Seed the Database:**
   ```bash
   # Push schema to PostgreSQL and seed with realistic demo data
   npm run db:push
   npm run db:seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) and use the **1-Click Role Switcher** on `/login` to explore Admin, Staff, or Customer perspectives.

---

## ⚙️ Environment Configuration

Brightloop uses a minimal, secure environment configuration via `.env`:

```dotenv
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brightloop?schema=public"

# Authentication Session Secret (JWT encryption)
AUTH_SECRET="brightloop-super-secure-production-jwt-secret-key-change-in-prod-2026"

# Canonical App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# (Optional) AI Financial Assistant Gemini Key
# If omitted, Brightloop uses deterministic live database aggregation rules
GEMINI_API_KEY=""

# (Optional) Email Service Provider (e.g., Resend, Sendgrid, SMTP)
EMAIL_SERVER=""
EMAIL_FROM="billing@brightloop.io"
```

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Starts local Next.js development server on port 3000 |
| `npm run build` | `next build` | Compiles production build and validates TypeScript types |
| `npm run start` | `next start` | Runs compiled production server |
| `npm test` | `vitest run` | Runs all 71 unit and integration tests |
| `npm run test:watch` | `vitest` | Runs Vitest in interactive watch mode |
| `npm run db:push` | `prisma db push` | Synchronizes Prisma schema with PostgreSQL database |
| `npm run db:generate` | `prisma generate` | Generates type-safe Prisma client |
| `npm run db:seed` | `tsx prisma/seed.ts` | Populates database with customers, plans, invoices, and payments |
| `npm run db:studio` | `prisma studio` | Opens Prisma graphical database browser |
| `npm run db:setup` | *Composite* | Runs full automated database initialization, migration, and seeding |

---

## 🧪 Automated Testing & QA Verification

Brightloop includes an automated test suite verifying financial math, calendar logic, RBAC, and end-to-end integration workflows.

### Execution Results: 71/71 Tests Passing (100%)

Run the tests at any time using:
```bash
npm test
```

```text
 RUN  v2.1.9 D:/odoo_project

 ✓ tests/unit/financial.test.ts (12 tests)
 ✓ tests/unit/rbac.test.ts (10 tests)
 ✓ tests/unit/billing-dates.test.ts (11 tests)
 ✓ tests/integration/lifecycle.test.ts (5 tests)
 ✓ tests/integration/qa-suite.test.ts (33 tests)

 Test Files  5 passed (5)
      Tests  71 passed (71)
   Duration  3.69s
```

### Coverage Highlights

1. **Exact Financial Calculations (`tests/unit/financial.test.ts`)**:
   - Price variant adjustments (`FIXED_OVERRIDE` vs `ADDITIONAL`).
   - Inclusive and exclusive VAT/GST rate computations.
   - Promotional discount validation (percentage, fixed caps, and date validity).
   - Zero-drift floating point arithmetic via `Decimal.js`.

2. **Calendar-Aware Date Intervals (`tests/unit/billing-dates.test.ts`)**:
   - Daily, weekly, monthly, quarterly, and annual billing intervals.
   - Month-end rollover preservation: Jan 31 ➔ Feb 28/29 ➔ Mar 31.
   - Leap-year anniversary handling: Feb 29, 2024 ➔ Feb 28, 2025.

3. **Role-Based Access Control (`tests/unit/rbac.test.ts`)**:
   - Permission matrix enforcement across Admin, Staff, and Customer roles.
   - Strict customer resource isolation (rejecting cross-tenant access to subscriptions and invoices).

4. **Lifecycle & Recurring Billing (`tests/integration/lifecycle.test.ts`)**:
   - Quotation creation, tax computation, and one-click conversion to active subscription.
   - Automated invoice generation during billing runs.
   - Idempotency verification: re-running billing skips already-invoiced periods without duplicating records.
   - Partial payment recording followed by final invoice settlement to `PAID`.

5. **Comprehensive QA & Edge Case Suite (`tests/integration/qa-suite.test.ts`)**:
   - Unauthenticated request rejection (`401 Unauthorized`).
   - Customer boundary violations (`403 Forbidden`).
   - Input validation (missing required fields, negative prices, malformed JSON).
   - Transaction atomicity & rollback verification upon line-item failures.
   - Overdue balance tracking, aging buckets, and collection risk scoring.

---

## 🔄 Core Business Workflows

### 1. Quotation to Subscription Conversion
```mermaid
graph LR
    A[Create Quotation] --> B[Add Line Items & Plans]
    B --> C[Apply Tax & Discounts]
    C --> D[Quotation Confirmed]
    D --> E[Convert to Subscription]
    E --> F[Subscription ACTIVE]
    F --> G[Generate First Invoice]
```
1. Staff or Admin creates a quotation for a customer (`/dashboard/quotations`).
2. Products, variants, billing interval (e.g., Monthly), and optional discount codes are selected.
3. Upon acceptance, clicking **Convert to Subscription** converts the proposal into an `ACTIVE` subscription, calculates the initial `nextBillingDate`, and generates corresponding subscription line items in an atomic database transaction.

### 2. Calendar-Aware Recurring Billing Engine
```mermaid
graph TD
    A[Billing Runner Triggered] --> B{Dry Run Mode?}
    B -- Yes --> C[Preview Upcoming Charges & Affected Customers]
    B -- No --> D[Fetch Subscriptions Due for Billing]
    D --> E{Invoice Already Generated for Period?}
    E -- Yes --> F[Skip Idempotently]
    E -- No --> G[Generate Invoice & Invoice Lines]
    G --> H[Advance nextBillingDate via Calendar Logic]
```
1. Navigate to `/dashboard/billing-preview` to inspect subscriptions due for billing.
2. Select **Dry Run** to preview total billable amounts and generated line items without modifying the database.
3. Execute **Run Recurring Billing**: Invoices are generated, unique invoice numbers are assigned, and `nextBillingDate` advances according to the plan interval (preserving month-end dates).

### 3. Partial Payments & Invoice Aging
1. Navigate to `/dashboard/invoices` and select any confirmed invoice.
2. Enter a payment amount (e.g., $500 on a $1,200 invoice) and submit.
3. The invoice automatically transitions to `PARTIALLY_PAID`, with remaining `amountDue` updated to `$700.00`.
4. Subsequent payment of `$700.00` completes settlement, updating status to `PAID`.
5. If an invoice passes its `dueDate` with an outstanding balance, it is classified as `OVERDUE` and ranked in the **Collection Priority** dashboard (`/dashboard/collections`).

### 4. Customer Self-Service & Cancellation
1. Log in as a customer (`rahul.verma@apexcloud.io`) to access `/portal`.
2. The customer can review active subscriptions, payment history, and download invoice receipts.
3. Customers can click **Request Cancellation** to trigger an orderly cancellation workflow on their own subscription without modifying or viewing peer customer data.

---

## 🔒 Security & Multi-Tenant Data Isolation

Brightloop implements multi-layered security controls:

- **Strict Tenant Isolation:** Customer portal endpoints enforce `requireOwnershipOrStaff(session, customerId)`. Customer A cannot inspect, fetch, or cancel Customer B's subscriptions or invoices; attempts return `403 Forbidden`.
- **Server-Side Route Protection:** Protected dashboard pages and API endpoints require authenticated sessions; unauthenticated requests are redirected to `/login` (`401 Unauthorized`).
- **Cryptographic Password Security:** User passwords are encrypted using `bcryptjs` with 10 salt rounds. Plaintext passwords are never stored or logged.
- **Zero Real Payment Service Secrets:** All payment workflows operate via a simulated payment engine; no external payment gateway keys or live financial credentials are required or exposed.
- **Transactional Atomicity:** All financial mutations (converting quotations, batch billing, payment recordings) execute inside `prisma.$transaction` blocks to prevent partial or orphaned database states.

---

## 📄 License

This project is developed for hackathon evaluation and licensed under the [MIT License](LICENSE).
