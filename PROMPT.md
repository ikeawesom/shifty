# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 12 (Polish + Deploy) is in progress.**

Landing page and dashboard visual polish is complete. The standalone `/pricing` page has been removed — all pricing is now inlined on the landing page with smooth scroll navigation. The app shell nav has also been polished.

## What was built so far
- Next.js 16 App Router + TypeScript + Tailwind CSS + shadcn/ui scaffolded and building cleanly
- Full folder structure created per the plan
- `src/types/index.ts` stub with shared types
- `vercel.json` with Vercel Cron config (hourly: `0 * * * *`)
- Prisma 7 + Supabase PostgreSQL connected
- `prisma/schema.prisma` — 8 models + 5 enums: User, Organization, OrgMember, Shift, ShiftAssignee, ShiftCompletion, Invitation; enums: PlatformRole, OrgRole, Plan, Recurrence, ReminderType
- `prisma/migrations/` — init + add_reminder_settings applied to Supabase
- `src/lib/prisma.ts` — singleton PrismaClient using `@kinde-oss/kinde-auth-nextjs`
- `prisma/seed.ts` — seed script (leader + member + org)
- `@kinde-oss/kinde-auth-nextjs` installed and configured
- `src/app/api/auth/[kindeAuth]/route.ts` — Kinde catch-all route handler
- `src/lib/auth.ts` — `getUser()`, `requireUser()`, `syncUser()` server helpers (syncUser wrapped in React.cache)
- `src/proxy.ts` — route proxy protecting app routes (Next.js 16: middleware → proxy)
- `src/lib/stripe.ts` — Stripe singleton + plan↔price maps
- `src/app/api/webhooks/stripe/route.ts` — webhook: syncs subscription/cancellation to DB
- `src/app/api/billing/checkout/route.ts` — creates Stripe Hosted Checkout Session
- `src/app/api/billing/portal/route.ts` — creates Stripe Customer Portal session
- `src/components/billing/PricingCards.tsx` — client pricing UI (Starter / Pro / Enterprise) with CheckCircle2 icons + Pro ring highlight
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
- `src/app/api/shifts/[id]/complete/route.ts` — POST: any org member marks shift complete; one per member per shift (409 if duplicate)
- `src/app/(app)/shifts/[id]/page.tsx` — shift detail: title, dates, recurrence, assignees, completion history, "Mark complete" button
- `src/app/(app)/shifts/[id]/MarkCompleteButton.tsx` — client button for marking complete
- `src/app/(app)/dashboard/page.tsx` — dashboard: role-branched stat cards with icons, upcoming shifts, recent activity feed
- `src/lib/org.ts` — `ACTIVE_ORG_COOKIE` constant + `getActiveOrg(userId)` helper
- `src/lib/org-actions.ts` — `switchOrg(orgId)` server action
- `src/app/api/orgs/route.ts` — POST: create org (plan limit check, sets active-org cookie)
- `src/app/(app)/layout.tsx` — app shell: sticky glass nav h-14 with Zap logo (purple), page links, OrgSwitcher, Sign out; Reminders + Billing gated to org leaders
- `src/components/org/OrgSwitcher.tsx` — client dropdown: switch orgs + "New org" gated by plan limit
- `src/app/(app)/org/new/page.tsx` — shows plan-limit upgrade prompt when at cap; otherwise shows OrgCreateForm
- `src/app/(app)/org/new/OrgCreateForm.tsx` — client fetch form posting to `/api/orgs`
- `src/app/api/orgs/reminders/route.ts` — PATCH: owner-only, plan-gated, updates org reminder settings
- `src/components/org/ReminderSettingsForm.tsx` — client form: reminder type radio, UTC hour picker, lead-time input
- `src/app/(app)/settings/reminders/page.tsx` — reminder settings page (org leaders / owners only)
- `src/app/api/cron/reminders/route.ts` — hourly cron handler: `CRON_SECRET` auth, routes per ReminderType, plan-gates before send
- `src/app/globals.css` — purple primary theme, scroll-behavior: smooth, Geist font fix
- `src/components/marketing/MarketingHeader.tsx` — sticky glass nav h-16; Zap logo; "Features" + "Pricing" hash links on right; rounded-full "Get started"
- `src/components/marketing/MarketingFooter.tsx` — logo | copyright | nav links; Pricing links to `/#pricing`
- `src/app/(marketing)/layout.tsx` — marketing shell using shared header/footer
- `src/app/page.tsx` — full landing page: Hero (blob deco, primary headline), How It Works (numbered steps), Features bento grid (`id="features"`), full Pricing section (`id="pricing"`, 4 cards + comparison table), dark CTA banner

## Tech stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui (base-nova, no tailwind.config.ts — theme in globals.css)
- Prisma 7 + Supabase (PostgreSQL) — **Note: Prisma 7 uses `prisma.config.ts`, not `url` in schema**
- Kinde (auth) — **Note: Next.js 16 uses `proxy.ts` not `middleware.ts`**
- Stripe (billing)
- Gmail SMTP / Nodemailer (email — invites + reminders)
- Vercel Cron (hourly reminders: `0 * * * *`)
- Vercel (deploy)
- Google Stitch MCP (configured as `stitch` server — restart Claude Code to load)

## User types
- **Org Leader**: self-registers, pays Stripe; is ADMIN in their org
- **Member**: invite-only via email token, always free; is MEMBER in org

## Subscription tiers (Org Leaders only)
| Tier | Price | Max orgs | Max members/org | Assignees/shift | Reminder types |
|---|---|---|---|---|---|
| Free | $0 | 1 | 10 | 1 | None |
| Starter | $9/mo | 3 | 20 | 5 | Daily summary (all members) |
| Pro | $29/mo | 8 | 50 | 10 | + Daily summary (assigned only), Personal shift summary |
| Enterprise | Custom | ∞ | ∞ | ∞ | + Pre-shift alert |

> Note: $9/mo and $29/mo are placeholders — confirm before launch.

## Phase 12 — What remains to build

### Priority order
1. **Error pages** — `src/app/not-found.tsx`, `src/app/error.tsx`
2. **Loading states** — `src/app/(app)/dashboard/loading.tsx`, `src/app/(app)/shifts/loading.tsx` (skeleton cards using shadcn/ui Skeleton)
3. **SEO** — update `src/app/layout.tsx` metadata + add Open Graph to landing page
4. **Env var audit** — all required secrets documented in PLAN.md
5. **Vercel deploy**

## Working agreement
- Build **phase by phase** — confirm each phase works before starting the next
- After each phase: update `handover.md`, `PLAN.md`, `PROMPT.md`, and save memory

## Reference
See `PLAN.md` for full phase list and `handover.md` for detailed next steps.
