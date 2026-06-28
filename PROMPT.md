# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 10 (Configurable Email Reminders) is complete. Starting Phase 11: Marketing Pages.**

## What was built so far
- Next.js 16 App Router + TypeScript + Tailwind CSS + shadcn/ui scaffolded and building cleanly
- Full folder structure created per the plan
- `src/types/index.ts` stub with shared types
- `vercel.json` with Vercel Cron config (hourly: `0 * * * *`)
- Prisma 7 + Supabase PostgreSQL connected
- `prisma/schema.prisma` — 8 models + 5 enums: User, Organization, OrgMember, Shift, ShiftAssignee, ShiftCompletion, Invitation; enums: PlatformRole, OrgRole, Plan, Recurrence, ReminderType
- `prisma/migrations/` — init + add_reminder_settings applied to Supabase
- `src/lib/prisma.ts` — singleton PrismaClient using `@prisma/adapter-pg`
- `prisma/seed.ts` — seed script (leader + member + org)
- `@kinde-oss/kinde-auth-nextjs` installed and configured
- `src/app/api/auth/[kindeAuth]/route.ts` — Kinde catch-all route handler
- `src/lib/auth.ts` — `getUser()`, `requireUser()`, `syncUser()` server helpers (syncUser wrapped in React.cache)
- `src/proxy.ts` — route proxy protecting app routes (Next.js 16: middleware → proxy)
- `src/lib/stripe.ts` — Stripe singleton + plan↔price maps
- `src/app/api/webhooks/stripe/route.ts` — webhook: syncs subscription/cancellation to DB
- `src/app/api/billing/checkout/route.ts` — creates Stripe Hosted Checkout Session
- `src/app/api/billing/portal/route.ts` — creates Stripe Customer Portal session
- `src/components/billing/PricingCards.tsx` — client pricing UI (Starter / Pro / Enterprise)
- `src/app/(app)/settings/billing/page.tsx` — billing settings page
- `src/lib/email.ts` — Nodemailer transporter; `sendInviteEmail`, `sendDailySummaryEmail`, `sendPersonalShiftSummaryEmail`, `sendPreShiftReminderEmail`
- `src/lib/plans.ts` — PLAN_MEMBER_LIMITS + PLAN_ASSIGNEE_LIMITS + PLAN_ORG_LIMITS + PLAN_ALLOWED_REMINDER_TYPES
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
- `src/app/(app)/dashboard/page.tsx` — rich dashboard: role-branched stat cards (ADMIN: org totals + completion rate; MEMBER: personal stats), upcoming shifts list, recent activity feed
- `src/lib/org.ts` — `ACTIVE_ORG_COOKIE` constant + `getActiveOrg(userId)` helper
- `src/lib/org-actions.ts` — `switchOrg(orgId)` server action
- `src/app/api/orgs/route.ts` — POST: create org (plan limit check, sets active-org cookie)
- `src/app/(app)/layout.tsx` — shared app shell: top nav with logo, page links, OrgSwitcher dropdown, Sign out; Reminders + Billing gated to org leaders
- `src/components/org/OrgSwitcher.tsx` — client dropdown: switch orgs + "New org" gated by plan limit
- `src/app/(app)/org/new/page.tsx` — shows plan-limit upgrade prompt when at cap; otherwise shows OrgCreateForm
- `src/app/(app)/org/new/OrgCreateForm.tsx` — client fetch form posting to `/api/orgs`
- `src/app/api/orgs/reminders/route.ts` — PATCH: owner-only, plan-gated, updates org reminder settings
- `src/components/org/ReminderSettingsForm.tsx` — client form: reminder type radio (filtered by plan), UTC hour picker, lead-time input
- `src/app/(app)/settings/reminders/page.tsx` — reminder settings page (org leaders / owners only)
- `src/app/api/cron/reminders/route.ts` — hourly cron handler: `CRON_SECRET` auth, routes per ReminderType, plan-gates before send

## Tech stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma 7 + Supabase (PostgreSQL) — **Note: Prisma 7 uses `prisma.config.ts`, not `url` in schema**
- Kinde (auth) — **Note: Next.js 16 uses `proxy.ts` not `middleware.ts`**
- Stripe (billing)
- Gmail SMTP / Nodemailer (email — invites + reminders)
- Vercel Cron (hourly reminders: `0 * * * *`)
- Vercel (deploy)

## User types
- **Org Leader**: self-registers, pays Stripe; is ADMIN in their org
- **Member**: invite-only via email token, always free; is MEMBER in org

## Subscription tiers (Org Leaders only, pricing TBD)
| Tier | Max orgs | Max members/org | Assignees/shift | Reminder types |
|---|---|---|---|---|
| Free | 1 | 10 | 1 | None |
| Starter | 3 | 20 | 5 | Daily summary (all members) |
| Pro | 8 | 50 | 10 | + Daily summary (assigned only), Personal shift summary |
| Enterprise | ∞ | ∞ | ∞ | + Pre-shift alert |

## Phase 11 — What to build

### What Claude will build

Marketing pages: a polished public-facing site for Shifty. These are static/server-rendered pages requiring no auth.

#### What to build
1. **`src/app/page.tsx`** — full landing page replacing the current stub:
   - Hero section: headline, subheadline, sign in / register CTAs
   - Features section: 3–4 feature highlights (shift management, team invites, reminders, multi-org)
   - Pricing preview: tier table (Free / Starter / Pro / Enterprise) linking to `/pricing`
   - Footer with nav links
2. **`src/app/(marketing)/pricing/page.tsx`** — full pricing page with tier comparison table
3. **`src/app/(marketing)/layout.tsx`** — marketing shell: simple nav (logo, "Sign in", "Get started") + footer; no auth required

#### Design notes
- Use existing shadcn/ui components (Card, Badge, Button)
- Keep Tailwind-only styling; no new dependencies
- All CTAs point to Kinde sign-in / register URLs (use `LoginLink` / `RegisterLink` from `@kinde-oss/kinde-auth-nextjs/components`)

## Working agreement
- Build **phase by phase** — confirm each phase works before starting the next
- After each phase: update `handover.md`, `PLAN.md`, `PROMPT.md`, and save memory

## Reference
See `PLAN.md` for full phase list and `handover.md` for detailed next steps.
