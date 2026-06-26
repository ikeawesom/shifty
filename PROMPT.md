# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 3 (Auth + Onboarding) is complete. Starting Phase 4: Billing (Stripe).**

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

## Phase 4 — What to do
1. Create a Stripe account, get test API keys
2. Create products/prices in Stripe dashboard (Starter, Pro, Enterprise tiers)
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

## Working agreement
- Build **phase by phase** — confirm each phase works before starting the next
- After each phase: update `handover.md`, `PLAN.md`, `PROMPT.md`, and save memory

## Reference
See `PLAN.md` for full phase list and `handover.md` for detailed next steps.
