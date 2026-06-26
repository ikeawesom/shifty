# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 2 (Database) is complete. Starting Phase 3: Auth + Onboarding (Kinde).**

## What was built so far
- Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui scaffolded and building cleanly
- Full folder structure created per the plan
- `src/types/index.ts` stub with shared enums
- `vercel.json` with Vercel Cron config
- Prisma 7 + Supabase PostgreSQL connected
- `prisma/schema.prisma` — 7 models: User, Organization, OrgMember, Shift, ShiftAssignee, ShiftCompletion, Invitation
- `prisma.config.ts` — Prisma 7 config (loads `.env.local`, points to DIRECT_URL for migrations)
- `prisma/migrations/20260626141645_init/` — initial migration applied to Supabase
- `src/lib/prisma.ts` — singleton PrismaClient using `@prisma/adapter-pg`
- `prisma/seed.ts` — seed script (leader + member + org)

## Tech stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma 7 + Supabase (PostgreSQL) — **Note: Prisma 7 uses `prisma.config.ts`, not `url` in schema**
- Kinde (auth)
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

## Phase 3 — What to do
1. Install and configure Kinde auth (`@kinde-oss/kinde-auth-nextjs`)
2. Add env vars: `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, `KINDE_ISSUER_URL`, `KINDE_SITE_URL`, `KINDE_POST_LOGOUT_REDIRECT_URL`, `KINDE_POST_LOGIN_REDIRECT_URL`
3. Create `src/app/api/auth/[kindeAuth]/route.ts` — Kinde catch-all route handler
4. Create `src/lib/auth.ts` — server-side `getUser()` helper
5. Create onboarding flow: after first login, prompt Org Leaders to create their first org
6. Protect `(app)` routes with middleware

## Working agreement
- Build **phase by phase** — confirm each phase works before starting the next
- After each phase: update `handover.md`, `PLAN.md`, `PROMPT.md`, and save memory

## Reference
See `PLAN.md` for full phase list and `handover.md` for detailed next steps.
