# Shifty — Build Plan

## Phase Status

| Phase | Description | Status |
|---|---|---|
| 1 | Scaffold + Tooling | ✅ Done |
| 2 | Database (Supabase + Prisma) | ✅ Done |
| 3 | Auth + Onboarding (Kinde) | ✅ Done |
| 4 | Billing (Stripe) | ⏳ Next |
| 5 | Members + Invite Flow | — |
| 6 | Shifts (CRUD + recurrence engine) | — |
| 7 | Completion Tracking | — |
| 8 | Dashboards | — |
| 9 | Multi-Org | — |
| 10 | Email Reminders (cron) | — |
| 11 | Marketing Pages | — |
| 12 | Polish + Deploy | — |

## Current Phase: 4 — Billing (Stripe)

**What to do:**
1. Create a Stripe account, get test API keys
2. Create products/prices in Stripe dashboard (Starter, Pro, Enterprise)
3. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_PRICE_STARTER="price_..."
   STRIPE_PRICE_PRO="price_..."
   STRIPE_PRICE_ENTERPRISE="price_..."
   ```
4. Tell Claude "Phase 4 ready"

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + Supabase (PostgreSQL)
- Kinde (auth)
- Stripe (billing)
- Gmail SMTP / Nodemailer (email)
- Vercel Cron (reminders)
- Vercel (deploy)
