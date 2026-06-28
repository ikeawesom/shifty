# Shifty — Handover

## Last completed: Phase 8 — Dashboards

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
