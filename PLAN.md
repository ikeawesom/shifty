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
| 7 | Completion Tracking | ⏳ Next |
| 8 | Dashboards | — |
| 9 | Multi-Org | — |
| 10 | Email Reminders (cron) | — |
| 11 | Marketing Pages | — |
| 12 | Polish + Deploy | — |

## Current Phase: 7 — Completion Tracking

### What to build
- `src/app/api/shifts/[id]/complete/route.ts` — POST: mark shift complete (one per member per shift)
- `src/app/(app)/shifts/[id]/page.tsx` — shift detail: assignees, completions, "Mark complete" button
- Update shifts list to show completion count (X/Y completed)

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
