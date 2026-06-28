# Shifty — Build Plan

## Phase Status

| Phase | Description | Status |
|---|---|---|
| 1 | Scaffold + Tooling | ✅ Done |
| 2 | Database (Supabase + Prisma) | ✅ Done |
| 3 | Auth + Onboarding (Kinde) | ✅ Done |
| 4 | Billing (Stripe) | ✅ Done |
| 5 | Members + Invite Flow | ✅ Done |
| 6 | Shifts (CRUD + recurrence engine) | ✅ Done |
| 7 | Completion Tracking | ✅ Done |
| 8 | Dashboards | ✅ Done |
| 9 | Multi-Org | ✅ Done |
| 10 | Email Reminders (cron) | ✅ Done |
| 11 | Marketing Pages | ⏳ Next |
| 12 | Polish + Deploy | — |

## Current Phase: 11 — Marketing Pages

### What to build
- `src/app/page.tsx` — full landing page: hero, feature highlights, pricing preview, CTA
- `/features`, `/pricing` static pages (or sections on the landing page)
- Responsive layout with consistent nav + footer
- No auth required; links to sign in / register

## Completed Phase: 10 — Email Reminders (cron)

### What was built
- `prisma/schema.prisma` — added `ReminderType` enum (`NONE | ALL_DAILY_SUMMARY | ASSIGNEE_DAILY_SUMMARY | ASSIGNEE_OWN_SHIFT | ASSIGNEE_PRE_SHIFT`) + three fields on `Organization`: `reminderType`, `reminderHourUtc` (0–23), `reminderLeadMinutes`
- `prisma/migrations/20260628050902_add_reminder_settings/` — applied to Supabase
- `src/lib/plans.ts` — added `PLAN_ALLOWED_REMINDER_TYPES` (Starter: type 1; Pro: types 1–3; Enterprise: all 4)
- `src/lib/email.ts` — added `sendDailySummaryEmail`, `sendPersonalShiftSummaryEmail`, `sendPreShiftReminderEmail`
- `src/app/api/orgs/reminders/route.ts` — PATCH: owner-only, plan-gated, updates org reminder settings
- `src/components/org/ReminderSettingsForm.tsx` — client form: radio type picker (filtered by plan), UTC hour picker, lead-time input
- `src/app/(app)/settings/reminders/page.tsx` — server page, owner-only guard
- `src/app/api/cron/reminders/route.ts` — hourly GET handler secured with `CRON_SECRET`; routes logic per reminder type; pre-shift window `[now+lead, now+lead+60min)`
- `vercel.json` — cron schedule changed from daily `0 7 * * *` to hourly `0 * * * *`
- `src/app/(app)/layout.tsx` — "Reminders" nav link added for org leaders

## Completed Phase: 9 — Multi-Org

### What was built
- `src/lib/plans.ts` — added PLAN_ORG_LIMITS
- `src/lib/auth.ts` — syncUser wrapped in React.cache()
- `src/lib/org.ts` — ACTIVE_ORG_COOKIE + getActiveOrg helper
- `src/lib/org-actions.ts` — switchOrg server action
- `src/app/api/orgs/route.ts` — POST create org (plan limit enforced)
- `src/app/(app)/layout.tsx` — shared app shell with top nav + OrgSwitcher
- `src/components/org/OrgSwitcher.tsx` — client dropdown (switch + create)
- `src/app/(app)/org/new/page.tsx` — plan gate + updated create form
- `src/app/(app)/org/new/OrgCreateForm.tsx` — client fetch pattern
- All 5 `(app)` pages updated to use `getActiveOrg()`

## Completed Phase: 8 — Dashboards

### What was built
- Updated `src/app/(app)/dashboard/page.tsx` — role-branched stat cards (ADMIN: total shifts, members, org completion rate; MEMBER: my shifts, my completions, my completion rate), "My Upcoming Shifts" list (next 5 assigned + not yet completed), "Recent Activity" feed (last 10 completions across org)

## Completed Phase: 7 — Completion Tracking

### What was built
- `src/app/api/shifts/[id]/complete/route.ts` — POST: mark shift complete (one per member per shift, 409 if duplicate)
- `src/app/(app)/shifts/[id]/page.tsx` — shift detail: title, dates, recurrence, assignees, completion history, "Mark complete" button (hidden once completed)
- `src/app/(app)/shifts/[id]/MarkCompleteButton.tsx` — client button component
- Updated `src/app/(app)/shifts/page.tsx` — each row links to detail page, shows X/Y completed badge

## Completed Phase: 6 — Shifts (CRUD + Recurrence Engine)

### What was built
- `src/lib/plans.ts` — added PLAN_ASSIGNEE_LIMITS
- `src/app/api/shifts/route.ts` — POST create shift
- `src/app/api/shifts/[id]/route.ts` — GET / PATCH / DELETE
- `src/app/(app)/shifts/page.tsx` — shift list
- `src/app/(app)/shifts/new/page.tsx` + `ShiftForm.tsx` — create shift UI
- Dashboard nav updated with Shifts link

## Completed Phase: 5 — Members + Invite Flow

### What was built
- `src/lib/email.ts` — Nodemailer transporter + sendInviteEmail
- `src/lib/plans.ts` — PLAN_MEMBER_LIMITS
- `src/app/api/invitations/route.ts` — create invitation + send email
- `src/app/api/invitations/[token]/route.ts` — validate token → create OrgMember → redirect
- `src/app/(app)/members/page.tsx` — member list + pending invites + invite form
- `src/app/(app)/members/MemberInviteForm.tsx` — client invite form
- Updated dashboard with nav links (billing hidden from MEMBERs)

## Tech Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma 7 + Supabase (PostgreSQL)
- Kinde (auth)
- Stripe (billing)
- Gmail SMTP / Nodemailer (email)
- Vercel Cron (reminders)
- Vercel (deploy)
