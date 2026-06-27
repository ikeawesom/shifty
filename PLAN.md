# Shifty — Build Plan

## Phase Status

| Phase | Description | Status |
|---|---|---|
| 1 | Scaffold + Tooling | ✅ Done |
| 2 | Database (Supabase + Prisma) | ✅ Done |
| 3 | Auth + Onboarding (Kinde) | ✅ Done |
| 4 | Billing (Stripe) | ✅ Done |
| 5 | Members + Invite Flow | ✅ Done |
| 6 | Shifts (CRUD + recurrence engine) | ⏳ Next |
| 7 | Completion Tracking | — |
| 8 | Dashboards | — |
| 9 | Multi-Org | — |
| 10 | Email Reminders (cron) | — |
| 11 | Marketing Pages | — |
| 12 | Polish + Deploy | — |

## Current Phase: 6 — Shifts (CRUD + Recurrence Engine)

### What to build
- Shift list page for the org (`/shifts`)
- Create shift form (`/shifts/new`) — title, dates, recurrence, assignees
- API routes: POST create, GET/PATCH/DELETE by ID
- Assignee limit enforcement per plan (FREE:1, STARTER:5, PRO:10, ENTERPRISE:∞)
- ADMINs only can create/edit/delete

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
