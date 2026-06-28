# Shifty — Handover

## Last completed: Phase 10 — Configurable Email Reminders

### What was done

- Added `ReminderType` enum to `prisma/schema.prisma`: `NONE | ALL_DAILY_SUMMARY | ASSIGNEE_DAILY_SUMMARY | ASSIGNEE_OWN_SHIFT | ASSIGNEE_PRE_SHIFT`
- Added three fields to `Organization`: `reminderType @default(NONE)`, `reminderHourUtc Int @default(7)`, `reminderLeadMinutes Int @default(60)`
- Migration `20260628050902_add_reminder_settings` applied to Supabase
- Added `PLAN_ALLOWED_REMINDER_TYPES` to `src/lib/plans.ts`: Starter gets type 1; Pro gets types 1–3; Enterprise gets all four
- Added three email functions to `src/lib/email.ts`: `sendDailySummaryEmail`, `sendPersonalShiftSummaryEmail`, `sendPreShiftReminderEmail`
- Created `src/app/api/orgs/reminders/route.ts` — PATCH: requires org ownership, validates plan tier server-side, updates the three reminder fields
- Created `src/components/org/ReminderSettingsForm.tsx` — client form with radio type picker (options filtered by plan), UTC hour picker (0–23) for daily types, lead-time input + unit select for pre-shift type
- Created `src/app/(app)/settings/reminders/page.tsx` — server page: redirects non-leaders; shows "owner only" message if not owner; renders form with current org settings
- Created `src/app/api/cron/reminders/route.ts` — hourly GET; verifies `Authorization: Bearer $CRON_SECRET`; processes each org with an active reminder type; plan-gates before sending; pre-shift window is `[now + leadMinutes, now + leadMinutes + 60min)` to ensure each shift is caught exactly once per hourly run
- Changed `vercel.json` cron from `0 7 * * *` to `0 * * * *` (hourly) so each org can choose its own send hour
- Added "Reminders" nav link in `src/app/(app)/layout.tsx` (gated to org leaders, before Billing)

### Reminder type gating

| Type | Tier |
|---|---|
| ALL_DAILY_SUMMARY — all members, full daily org summary | Starter+ |
| ASSIGNEE_DAILY_SUMMARY — assigned members only, full daily org summary | Pro+ |
| ASSIGNEE_OWN_SHIFT — assigned members only, their own shifts | Pro+ |
| ASSIGNEE_PRE_SHIFT — assigned members, their own shift, X min before | Enterprise |

### Key files

- `prisma/schema.prisma` — ReminderType enum + Organization fields
- `src/lib/plans.ts` — PLAN_ALLOWED_REMINDER_TYPES
- `src/lib/email.ts` — three new email functions
- `src/app/api/orgs/reminders/route.ts` — PATCH save settings
- `src/components/org/ReminderSettingsForm.tsx` — client settings form
- `src/app/(app)/settings/reminders/page.tsx` — settings page
- `src/app/api/cron/reminders/route.ts` — hourly cron handler
- `vercel.json` — hourly cron schedule

### Env var needed

- `CRON_SECRET` — Vercel injects automatically on deploy; add to `.env.local` for local testing

---

## Previous phases

### Phase 9 — Multi-Org

### What was done

- Added `PLAN_ORG_LIMITS` to `src/lib/plans.ts` (FREE:1, STARTER:3, PRO:8, ENTERPRISE:∞)
- Wrapped `syncUser` in `React.cache()` in `src/lib/auth.ts` to deduplicate DB calls across shared layout + pages
- Created `src/lib/org.ts` — `ACTIVE_ORG_COOKIE` constant + `getActiveOrg(userId)` helper (reads cookie, validates membership, falls back to `findFirst` with `orderBy: joinedAt asc` for determinism)
- Created `src/lib/org-actions.ts` — `switchOrg(orgId)` server action (validates membership, sets `httpOnly` cookie)
- Created `src/app/api/orgs/route.ts` — POST: create org with plan limit check, sets active-org cookie on success
- Reworked `src/app/(app)/org/new/page.tsx` — removed inline server action; now checks `ownedOrgCount >= limit` server-side; shows upgrade prompt card when at limit
- Converted `src/app/(app)/org/new/OrgCreateForm.tsx` to client fetch pattern (`fetch('/api/orgs')`, shows upgrade link on 403)
- Created `src/app/(app)/layout.tsx` — shared app shell: sticky top nav with logo, Dashboard/Shifts/Members/Reminders/Billing links (Reminders+Billing gated to ORG_LEADER), `OrgSwitcher`, Sign out
- Created `src/components/org/OrgSwitcher.tsx` — client dropdown; `useTransition` + `router.refresh()` after switch; shows checkmark on active org; "New org" item disabled with "Upgrade" hint when `atOrgLimit`
- Updated all 5 `(app)` pages to use `getActiveOrg(user.id)` instead of `prisma.orgMember.findFirst()`
- Removed inline nav and LogoutLink from `dashboard/page.tsx` (now in shared layout)

### Key files

- `src/lib/plans.ts` — added PLAN_ORG_LIMITS
- `src/lib/auth.ts` — syncUser wrapped in cache()
- `src/lib/org.ts` — ACTIVE_ORG_COOKIE, getActiveOrg
- `src/lib/org-actions.ts` — switchOrg server action
- `src/app/api/orgs/route.ts` — POST create org
- `src/app/(app)/layout.tsx` — shared app shell (new)
- `src/components/org/OrgSwitcher.tsx` — org switcher dropdown (new)
- `src/app/(app)/org/new/page.tsx` — plan gate + create form
- `src/app/(app)/org/new/OrgCreateForm.tsx` — client fetch form

### Data / cookie flow

1. User visits any `(app)` route → layout fetches `syncUser()` + all memberships + reads `shifty-active-org` cookie
2. Page calls `getActiveOrg(userId)` independently (cache deduplicates `syncUser`, cookie read is separate)
3. OrgSwitcher: click org → `switchOrg(orgId)` server action → sets cookie → `router.refresh()` re-renders with new active org
4. Create org: `POST /api/orgs` → checks plan limit → creates org → sets cookie → client `router.push('/dashboard')`

---

## Previous phases

### Phase 8 — Dashboards

### What was done

- Replaced the barebones `/dashboard` page with a full dashboard in `src/app/(app)/dashboard/page.tsx`:
  - **Stat cards** (role-branched, 3 DB counts run in parallel):
    - ADMIN: Total Shifts, Members, Org Completion Rate (totalCompletions / totalAssignees × 100%)
    - MEMBER: My Shifts, Completed, My Completion Rate
    - Zero-division guard: shows `0%` when denominator is 0
  - **My Upcoming Shifts**: ShiftAssignee rows where `memberId = membership.id`, shift starts in the future, and no ShiftCompletion exists for that member on that shift — uses Prisma `none` relation filter; sorted by `startsAt asc`; limited to 5
  - **Recent Activity**: last 10 ShiftCompletion rows for the org, includes `completedBy.user` for display name and `shift.title`; sorted by `completedAt desc`
  - Stat cards and upcoming+activity each run in a `Promise.all` — 3 total DB round-trips
  - All empty states handled with descriptive text
  - Nav links and LogoutLink preserved; Billing link still gated to `isLeader`

### Key files

- `src/app/(app)/dashboard/page.tsx` — only file changed

### Data flow

1. `syncUser()` → findFirst OrgMember (with org) → redirect if none
2. Role-branched `Promise.all` for stat counts
3. Parallel `Promise.all` for upcoming shifts + recent completions
4. Server-rendered; no client components added

---

## Previous phases

### Phase 7 — Completion Tracking

### What was done

- Created `src/app/api/shifts/[id]/complete/route.ts`:
  - POST: any org member can mark a shift complete; finds their OrgMember record; checks for existing completion and returns 409 if found; creates ShiftCompletion with optional `notes`
- Created `src/app/(app)/shifts/[id]/page.tsx` — server component shift detail page: title, recurrence badge, date/time range, description, assignee list, "Mark complete" button (hidden if already completed), full completion history (who + when + notes)
- Created `src/app/(app)/shifts/[id]/MarkCompleteButton.tsx` — client component; POSTs to `/api/shifts/[id]/complete`; calls `router.refresh()` on success; shows inline error on failure
- Updated `src/app/(app)/shifts/page.tsx`:
  - Each shift row is now a `<Link>` to `/shifts/[id]`
  - Includes `completions: { select: { id: true } }` in query
  - Shows `X/Y completed` badge (X = completions, Y = assignees)

### Completion flow

1. Any org member visits `/shifts/[id]`
2. Clicks "Mark complete" → POST `/api/shifts/[id]/complete`
3. Page refreshes; completion appears in history; button replaced with "already completed" message
4. Shifts list shows updated X/Y count

### Key files

- `src/app/api/shifts/[id]/complete/route.ts` — POST complete
- `src/app/(app)/shifts/[id]/page.tsx` — detail page
- `src/app/(app)/shifts/[id]/MarkCompleteButton.tsx` — client button
- `src/app/(app)/shifts/page.tsx` — updated list

---

## Previous phases

### Phase 6 — Shifts (CRUD + Recurrence Engine)

#### What was done

- Updated `src/lib/plans.ts` — added `PLAN_ASSIGNEE_LIMITS` (FREE:1, STARTER:5, PRO:10, ENTERPRISE:∞)
- Created `src/app/api/shifts/route.ts`:
  - POST: ADMIN-only, enforces `PLAN_ASSIGNEE_LIMITS[user.plan]`, creates Shift + ShiftAssignees in one query
- Created `src/app/api/shifts/[id]/route.ts`:
  - GET: any org member can read; includes assignees → member → user
  - PATCH: ADMIN-only; accepts partial update; if `assigneeIds` provided, replaces assignees atomically in a transaction (deleteMany + createMany); enforces assignee limit
  - DELETE: ADMIN-only; deletes ShiftAssignee + ShiftCompletion + Shift in a transaction (no schema cascade)
- Created `src/app/(app)/shifts/page.tsx` — list shifts sorted by startsAt; shows title, recurrence badge (hidden for ONE_OFF), date/time range, assignee names; "New shift" button for ADMINs only
- Created `src/app/(app)/shifts/new/page.tsx` — ADMIN-only server page; loads org members; redirects non-admins to `/shifts`
- Created `src/app/(app)/shifts/new/ShiftForm.tsx` — client form: title, description, startsAt, endsAt, recurrence select, assignee checkboxes; POSTs to `/api/shifts`; redirects to `/shifts` on success
- Updated `src/app/(app)/dashboard/page.tsx` — added Shifts nav link (before Members)
- Build passes cleanly, all 16 routes present

### Shift flow

1. ADMIN clicks "New shift" on `/shifts`
2. Fills form → POST `/api/shifts` → creates Shift + ShiftAssignees
3. Redirected to `/shifts` list
4. Any org member can view `/shifts`
5. PATCH `/api/shifts/[id]` — update fields / reassign
6. DELETE `/api/shifts/[id]` — ADMIN removes shift

### Key files

- `src/lib/plans.ts` — PLAN_MEMBER_LIMITS + PLAN_ASSIGNEE_LIMITS
- `src/app/api/shifts/route.ts` — POST create
- `src/app/api/shifts/[id]/route.ts` — GET / PATCH / DELETE
- `src/app/(app)/shifts/page.tsx` — shift list
- `src/app/(app)/shifts/new/page.tsx` — create shift page
- `src/app/(app)/shifts/new/ShiftForm.tsx` — client form

---

## Previous phases

### Phase 5 — Members + Invite Flow

- `src/lib/email.ts` — Nodemailer transporter + sendInviteEmail
- `src/app/api/invitations/route.ts` — create invitation + send email
- `src/app/api/invitations/[token]/route.ts` — accept invitation
- `src/app/(app)/members/page.tsx` — members page
- `src/app/(app)/members/MemberInviteForm.tsx` — invite form

### Phase 4 — Billing (Stripe)

- `src/lib/stripe.ts` — singleton + `PLAN_TO_PRICE` / `PRICE_TO_PLAN` maps
- `src/app/api/webhooks/stripe/route.ts` — subscription sync
- `src/app/api/billing/checkout/route.ts` — checkout
- `src/app/api/billing/portal/route.ts` — portal
- `src/components/billing/PricingCards.tsx` — billing UI
- `src/app/(app)/settings/billing/page.tsx` — billing page

### Phase 3 — Auth + Onboarding (Kinde)

- `src/lib/auth.ts` — `getUser()`, `requireUser()`, `syncUser()` helpers
- `src/proxy.ts` — route protection (Next.js 16: `proxy.ts` not `middleware.ts`)
- `src/app/(app)/dashboard/page.tsx` — protected dashboard, redirects to `/org/new` if no org
- `src/app/(app)/org/new/page.tsx` — create first org (server action)

### Phase 2 — Database (Supabase + Prisma)

- Prisma 7 + Supabase PostgreSQL
- `prisma/schema.prisma` — 7 models, 4 enums
- `src/lib/prisma.ts` — singleton PrismaClient with `PrismaPg` adapter
- Migration `20260626141645_init` applied

### Phase 1 — Scaffold + Tooling

- Next.js 16 App Router + TypeScript + Tailwind CSS + shadcn/ui
- Full folder structure, `src/types/index.ts`, `vercel.json`

---

## Next: Phase 7 — Completion Tracking

### What to build

- `src/app/api/shifts/[id]/complete/route.ts` — POST: any org member marks a shift complete (creates ShiftCompletion row)
- `src/app/(app)/shifts/[id]/page.tsx` — shift detail page: shows assignees, completion history, "Mark complete" button for assignees
- Prevent duplicate completions (one per member per shift? or allow multiple — TBD)
- Display completion status on the shifts list page
