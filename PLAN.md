# Shifty — Build Plan

## Phase Status

| Phase | Description | Status |
|---|---|---|
| 1 | Scaffold + Tooling | ✅ Done |
| 2 | Database (Supabase + Prisma) | ✅ Done |
| 3 | Auth + Onboarding (Kinde) | ✅ Done |
| 4 | Billing (Stripe) | ✅ Done |
| 5 | Members + Invite Flow | ⏳ Next |
| 6 | Shifts (CRUD + recurrence engine) | — |
| 7 | Completion Tracking | — |
| 8 | Dashboards | — |
| 9 | Multi-Org | — |
| 10 | Email Reminders (cron) | — |
| 11 | Marketing Pages | — |
| 12 | Polish + Deploy | — |

## Current Phase: 5 — Members + Invite Flow

### What to build
- Invite member by email (token-based)
- Accept invite → create OrgMember (role: MEMBER)
- Member dashboard view (no billing)
- Enforce tier limits on invite send

## Completed Phase: 4 — Billing (Stripe)

### What was built
- `src/lib/stripe.ts` — singleton + `PLAN_TO_PRICE` / `PRICE_TO_PLAN` maps
- `src/app/api/webhooks/stripe/route.ts` — handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `src/app/api/billing/checkout/route.ts` — creates Stripe Checkout Session
- `src/app/api/billing/portal/route.ts` — creates Stripe Customer Portal session
- `src/components/billing/PricingCards.tsx` — client pricing UI (3 tiers, upgrade/manage billing)
- `src/app/(app)/settings/billing/page.tsx` — billing settings page

## Tech Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma 7 + Supabase (PostgreSQL)
- Kinde (auth)
- Stripe (billing) — CLI-assisted setup
- Gmail SMTP / Nodemailer (email)
- Vercel Cron (reminders)
- Vercel (deploy)
