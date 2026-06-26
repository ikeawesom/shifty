# Shifty — Build Plan

## Phase Status

| Phase | Description | Status |
|---|---|---|
| 1 | Scaffold + Tooling | ✅ Done |
| 2 | Database (Supabase + Prisma) | ✅ Done |
| 3 | Auth + Onboarding (Kinde) | ⏳ Next |
| 4 | Billing (Stripe) | — |
| 5 | Members + Invite Flow | — |
| 6 | Shifts (CRUD + recurrence engine) | — |
| 7 | Completion Tracking | — |
| 8 | Dashboards | — |
| 9 | Multi-Org | — |
| 10 | Email Reminders (cron) | — |
| 11 | Marketing Pages | — |
| 12 | Polish + Deploy | — |

## Current Phase: 3 — Auth + Onboarding (Kinde)

**What to do:**
1. Create a Kinde account at kinde.com, create an application
2. Add to `.env.local`:
   ```
   KINDE_CLIENT_ID="..."
   KINDE_CLIENT_SECRET="..."
   KINDE_ISSUER_URL="https://yourapp.kinde.com"
   KINDE_SITE_URL="http://localhost:3000"
   KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
   KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/dashboard"
   ```
3. Tell Claude "Phase 3 ready" and Claude will implement auth

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + Supabase (PostgreSQL)
- Kinde (auth)
- Stripe (billing)
- Gmail SMTP / Nodemailer (email)
- Vercel Cron (reminders)
- Vercel (deploy)
