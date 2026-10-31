# Brightloop — Subscription Management System

A subscription management and recurring billing platform built for the hackathon. Brightloop helps businesses manage products, subscription plans, quotations, recurring invoices, payments, and customer accounts from a centralized dashboard.

The project focuses on modular architecture, accurate financial calculations, automated billing workflows, role-based access control, and customer self-service.

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [User Roles](#user-roles)
* [Technology Stack](#technology-stack)
* [Project Architecture](#project-architecture)
* [Getting Started](#getting-started)
* [Environment Configuration](#environment-configuration)
* [Database Setup](#database-setup)
* [Running the Application](#running-the-application)
* [Testing](#testing)
* [Core Workflows](#core-workflows)
* [Security Considerations](#security-considerations)
* [Future Improvements](#future-improvements)

## Overview

Brightloop is designed to simplify subscription-based business operations by bringing subscription management, billing, invoicing, and payment tracking into one application.

The system supports the subscription lifecycle, from quotation creation and conversion to recurring billing and payment settlement.

It also includes financial analytics and operational tools to help administrators monitor subscriptions, outstanding invoices, and expected revenue.

## Key Features

### 1. Product and Subscription Management

* Product catalog and pricing variants.
* Configurable subscription plans.
* Support for different billing intervals.
* Subscription lifecycle management, including pausing, resuming, and closing subscriptions.

### 2. Quotation Management

* Create quotations for customers.
* Apply discounts and tax rules.
* Convert accepted quotations into subscriptions.
* Track quotation and subscription statuses.

### 3. Recurring Billing and Invoices

* Preview subscriptions due for billing.
* Generate recurring invoices.
* Calculate billing dates using calendar-aware logic.
* Prevent duplicate billing for the same subscription period.
* Track invoice balances and payment statuses.

### 4. Payment Management

* Record payments against invoices.
* Support partial payments and outstanding balances.
* Track payment references and transaction history.
* Update invoice statuses as balances are settled.

### 5. Financial Dashboard and Analytics

* Monitor key financial indicators.
* View subscription and invoice information.
* Explore revenue forecasts.
* Prioritize overdue accounts.
* Monitor subscription health and upcoming renewals.

### 6. Customer Self-Service Portal

* View personal subscriptions.
* Access invoice history.
* Review payment information.
* Manage available account and billing details.

### 7. AI Financial Assistant

* Ask questions about supported financial data.
* Retrieve answers based on available database information and calculations.

### 8. Automated Testing

* Unit tests for financial calculations.
* Tests for billing-date logic.
* Tests for role-based access control.
* Integration tests for subscription and payment workflows.

## User Roles

| Role     | Main Responsibilities                                                                         |
| -------- | --------------------------------------------------------------------------------------------- |
| Admin    | Manage products, plans, billing operations, and platform settings.                            |
| Staff    | Handle quotations, customer onboarding, invoices, and operational activities.                 |
| Customer | Access personal subscriptions, invoices, and payment information through the customer portal. |

Access should be restricted according to each user's assigned role and ownership of customer records.

## Technology Stack

The current project documentation identifies the following technologies:

| Technology   | Purpose                           |
| ------------ | --------------------------------- |
| Next.js      | Application framework             |
| React        | User interface                    |
| TypeScript   | Type-safe application development |
| PostgreSQL   | Relational database               |
| Prisma ORM   | Database schema and data access   |
| Decimal.js   | Accurate monetary calculations    |
| Vitest       | Automated testing                 |
| Tailwind CSS | UI styling                        |

Confirm the versions and dependencies against `package.json` before publishing the final documentation.

## Project Architecture

The project follows a modular structure that separates application pages, reusable components, business logic, database configuration, and tests.

```text
odoo_project/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── dashboard/
│   │   ├── analytics/
│   │   ├── assistant/
│   │   ├── billing-preview/
│   │   ├── collections/
│   │   ├── customers/
│   │   ├── discounts/
│   │   ├── forecast/
│   │   ├── health/
│   │   ├── invoices/
│   │   ├── notifications/
│   │   ├── payments/
│   │   ├── plans/
│   │   ├── products/
│   │   ├── quotations/
│   │   ├── settings/
│   │   └── subscriptions/
│   ├── portal/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── profile/
│   │   └── subscriptions/
│   ├── api/
│   └── page.tsx
├── components/
├── lib/
│   ├── calculations/
│   ├── dates/
│   ├── auth/
│   └── permissions/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── services/
├── tests/
│   ├── unit/
│   └── integration/
├── public/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

This is a logical overview. Some directories or files may differ in the current repository.

### Main Directories

* `app/` — Application pages, dashboards, customer portal, and API routes.
* `components/` — Reusable interface components and forms.
* `lib/` — Shared utilities, financial calculations, date logic, and access-control helpers.
* `services/` — Business logic for subscriptions, billing, payments, and related operations.
* `prisma/` — Database schema and demo-data seeding.
* `tests/` — Unit and integration tests.

## Getting Started

### Prerequisites

Install the following software:

* Node.js compatible with the project's dependencies.
* npm.
* PostgreSQL 16, or another supported PostgreSQL version.
* Git.

### 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd odoo_project
```

Replace the placeholder with your actual repository URL.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a local `.env` file based on `.env.example`.

Configure the database connection and authentication secret using your local development values.

**Never commit `.env` or real credentials to GitHub.**

### 4. Prepare the Database

After configuring the database connection, run:

```bash
npx prisma generate
npx prisma db push
```

Use these commands only after confirming that `DATABASE_URL` points to the intended development database.

### 5. Load Demo Data

If you want to populate the database with sample data, run:

```bash
npx tsx prisma/seed.ts
```

Run the seed script only after reviewing what it creates or modifies. Do not run it against a database containing data you need to preserve.

### 6. Start the Development Server

```bash
npm run dev
```

Open the following address in your browser:

http://localhost:3000

## Environment Configuration

Create an `.env.example` file containing placeholders similar to the following:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
JWT_SECRET="REPLACE_WITH_A_SECURE_RANDOM_SECRET"
```

Adjust the variable names and database configuration to match the application's actual requirements.

For local development:

1. Copy `.env.example` to `.env`.
2. Replace the placeholders with local configuration values.
3. Generate a strong, private authentication secret.
4. Keep `.env` out of version control.

Do not use example credentials or authentication secrets in a public deployment.

## Testing

The project includes unit and integration test files.

Run the automated test suite with:

```bash
npm test
```

The existing project documentation identifies these test areas:

* Financial calculations and monetary precision.
* Subscription billing dates and calendar boundaries.
* Role-based access control.
* Quotation-to-subscription conversion.
* Recurring billing and duplicate prevention.
* Partial payments and invoice settlement.
* Discount validation and usage limits.

Test results should be verified against the current code before reporting a passing test count.

## Core Workflows

### 1. Quotation to Subscription

1. Create a quotation for a customer.
2. Add products, prices, taxes, and discounts.
3. Accept the quotation.
4. Convert it into a subscription.
5. Verify the subscription status and next billing date.

### 2. Recurring Billing

1. Preview subscriptions due for billing.
2. Review the billing preview.
3. Execute the billing operation.
4. Verify that invoices are created.
5. Check that the next billing dates advance correctly.
6. Confirm that repeating the operation does not create duplicate invoices for the same billing period.

### 3. Payment and Settlement

1. Open an outstanding invoice.
2. Record a test payment.
3. Verify the payment record and remaining balance.
4. Record an additional payment if the invoice is only partially paid.
5. Confirm that the invoice status reflects its remaining balance.

Use simulated payments while testing.

## Security Considerations

The application is intended to enforce role-based access and customer data isolation.

Before deploying or presenting it as production-ready, verify:

* Server-side authorization for protected pages and API routes.
* Customer ownership checks for invoices, subscriptions, and payments.
* Secure handling of authentication tokens and cookies.
* Protection of environment variables and database credentials.
* Validation of user input and monetary values.
* Appropriate error handling and audit logging.
* Security of billing and payment operations.

A feature's presence in the code does not, by itself, prove that it is secure. These controls should be tested.

## Future Improvements

Potential areas for future development include:

* Additional automated tests for authorization and billing edge cases.
* Improved reporting and financial analytics.
* More comprehensive billing failure notifications.
* Payment gateway integration using a supported test environment.
* Improved deployment and monitoring documentation.
* Further performance testing with larger datasets.

## Project Information

**Project:** Brightloop Subscription Management System
**Purpose:** Hackathon project
**Repository:** See the GitHub repository containing this README.

---

*Documentation should be updated as the project evolves. Feature descriptions, setup instructions, and test results should reflect the current implementation.*
