# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 7 (Completion Tracking) is complete. Starting Phase 8: Dashboards.**

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
- `src/app/(app)/dashboard/page.tsx` — protected dashboard with user sync + org redirect + nav links (billing hidden from MEMBERs)
- `src/app/(app)/org/new/page.tsx` — onboarding: create first org (server action)
- `src/app/page.tsx` — marketing home with sign in / register links
- `src/lib/stripe.ts` — Stripe singleton + plan↔price maps
- `src/app/api/webhooks/stripe/route.ts` — webhook: syncs subscription/cancellation to DB
- `src/app/api/billing/checkout/route.ts` — creates Stripe Hosted Checkout Session
- `src/app/api/billing/portal/route.ts` — creates Stripe Customer Portal session
- `src/components/billing/PricingCards.tsx` — client pricing UI (Starter / Pro / Enterprise)
- `src/app/(app)/settings/billing/page.tsx` — billing settings page
- `src/lib/email.ts` — Nodemailer transporter (Gmail SMTP via SMTP_USERNAME/SMTP_PASSWORD)
- `src/lib/plans.ts` — PLAN_MEMBER_LIMITS + PLAN_ASSIGNEE_LIMITS
- `src/app/api/invitations/route.ts` — POST: create Invitation row + send invite email
- `src/app/api/invitations/[token]/route.ts` — GET: validate token → create OrgMember → redirect to dashboard
- `src/app/(app)/members/page.tsx` — member list + pending invites + invite form (ADMIN only)
- `src/app/(app)/members/MemberInviteForm.tsx` — client invite form component
- `src/app/api/shifts/route.ts` — POST: create shift (ADMIN only, enforce assignee limits per plan)
- `src/app/api/shifts/[id]/route.ts` — GET (anyone in org), PATCH + DELETE (ADMIN only, transactional)
- `src/app/(app)/shifts/page.tsx` — shift list with recurrence badge + assignee names
- `src/app/(app)/shifts/new/page.tsx` — create shift page (ADMIN only)
- `src/app/(app)/shifts/new/ShiftForm.tsx` — client form: title, description, dates, recurrence, assignee checkboxes
- `src/app/api/shifts/[id]/complete/route.ts` — POST: any org member marks shift complete; one per member per shift (409 if duplicate); optional notes
- `src/app/(app)/shifts/[id]/page.tsx` — shift detail: title, dates, recurrence, assignees, completion history, "Mark complete" button
- `src/app/(app)/shifts/[id]/MarkCompleteButton.tsx` — client button for marking complete

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

## Phase 8 — What to build

### What Claude will build
TBD — dashboards showing shift completion stats, member activity, and org-level summaries.

## Working agreement
- Build **phase by phase** — confirm each phase works before starting the next
- After each phase: update `handover.md`, `PLAN.md`, `PROMPT.md`, and save memory

## Reference
See `PLAN.md` for full phase list and `handover.md` for detailed next steps.
