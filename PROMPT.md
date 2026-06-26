# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 4 (Billing) is complete. Starting Phase 5: Members + Invite Flow.**

## What was built so far
- Next.js 16 App Router + TypeScript + Tailwind CSS + shadcn/ui scaffolded and building cleanly
- Full folder structure created per the plan
- `src/types/index.ts` stub with shared types
- `vercel.json` with Vercel Cron config
- Prisma 7 + Supabase PostgreSQL connected
- `prisma/schema.prisma` — 7 models: User, Organization, OrgMember, Shift, ShiftAssignee, ShiftCompletion, Invitation
- `prisma.config.ts` — Prisma 7 config (loads `.env.local`, points to DIRECT_URL for migrations)
- `prisma/migrations/20260626141645_init/` — initial migration applied to Supabase
- `src/lib/prisma.ts` — singleton PrismaClient using `@prisma/adapter-pg`
- `prisma/seed.ts` — seed script (leader + member + org)
- `@kinde-oss/kinde-auth-nextjs` installed and configured
- `src/app/api/auth/[kindeAuth]/route.ts` — Kinde catch-all route handler
- `src/lib/auth.ts` — `getUser()`, `requireUser()`, `syncUser()` server helpers
- `src/proxy.ts` — route proxy protecting app routes (Next.js 16: middleware → proxy)
- `src/app/(app)/dashboard/page.tsx` — protected dashboard with user sync + org redirect
- `src/app/(app)/org/new/page.tsx` — onboarding: create first org (server action)
- `src/app/page.tsx` — marketing home with sign in / register links
- `src/lib/stripe.ts` — Stripe singleton + plan↔price maps
- `src/app/api/webhooks/stripe/route.ts` — webhook: syncs subscription/cancellation to DB
- `src/app/api/billing/checkout/route.ts` — creates Stripe Hosted Checkout Session
- `src/app/api/billing/portal/route.ts` — creates Stripe Customer Portal session
- `src/components/billing/PricingCards.tsx` — client pricing UI (Starter / Pro / Enterprise)
- `src/app/(app)/settings/billing/page.tsx` — billing settings page

## Tech stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma 7 + Supabase (PostgreSQL) — **Note: Prisma 7 uses `prisma.config.ts`, not `url` in schema**
- Kinde (auth) — **Note: Next.js 16 uses `proxy.ts` not `middleware.ts`**
- Stripe (billing)
- Gmail SMTP / Nodemailer (email — invites + reminders)
- Vercel Cron (daily reminders at 07:00 UTC)
- Vercel (deploy)

## User types
- **Org Leader**: self-registers, pays Stripe; is ADMIN in their org
- **Member**: invite-only via email token, always free; is MEMBER in org

## Subscription tiers (Org Leaders only, pricing TBD)
| Tier | Max orgs | Max members/org | Assignees/shift | Reminders |
|---|---|---|---|---|
| Free | 1 | 10 | 1 | No |
| Starter | 3 | 20 | 5 | No |
| Pro | 8 | 50 | 10 | Yes |
| Enterprise | ∞ | ∞ | ∞ | Yes |

## Phase 5 — What to do

### Prerequisites
- Gmail SMTP credentials for sending invite emails (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
- Add to `.env.local`:
  ```
  SMTP_HOST="smtp.gmail.com"
  SMTP_PORT="587"
  SMTP_USER="your@gmail.com"
  SMTP_PASS="your-app-password"
  ```

### Tell Claude
Once env vars are set: tell Claude **"Phase 5 ready"**

## Working agreement
- Build **phase by phase** — confirm each phase works before starting the next
- After each phase: update `handover.md`, `PLAN.md`, `PROMPT.md`, and save memory

## Reference
See `PLAN.md` for full phase list and `handover.md` for detailed next steps.
