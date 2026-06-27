# Shifty — Handover

## Last completed: Phase 5 — Members + Invite Flow

### What was done
- Installed `nodemailer` + `@types/nodemailer`
- Created `src/lib/email.ts` — Nodemailer transporter singleton (SMTP_HOST/PORT/USERNAME/PASSWORD)
- Created `src/lib/plans.ts` — `PLAN_MEMBER_LIMITS` constant (FREE:10, STARTER:20, PRO:50, ENTERPRISE:∞)
- Created `src/app/api/invitations/route.ts`:
  - POST: auth check, ADMIN guard, tier limit check, duplicate invite check, creates Invitation row (7-day expiry), sends invite email
- Created `src/app/api/invitations/[token]/route.ts`:
  - GET: if unauthenticated → redirect to Kinde login with return URL; validates token (not expired, not accepted, email match); upserts User (platformRole: MEMBER); upserts OrgMember (role: MEMBER); marks acceptedAt; redirects to `/dashboard`
- Created `src/app/(app)/members/page.tsx` — member list + pending invites + invite form (ADMIN only)
- Created `src/app/(app)/members/MemberInviteForm.tsx` — client form component
- Updated `src/app/(app)/dashboard/page.tsx` — added nav links (Members for all, Billing only for ORG_LEADER)
- Build passes cleanly

### Invite flow
1. ADMIN visits `/members`, enters email, submits form
2. POST `/api/invitations` creates DB row + sends email with token link
3. Invitee clicks link → `GET /api/invitations/[token]`
4. If not logged in → redirected to Kinde login → back to accept route
5. Token validated → OrgMember created (role: MEMBER) → redirect `/dashboard`

### Key env vars used
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `EMAIL_FROM`, `EMAIL_FROM_NAME`

### Key files
- `src/lib/email.ts` — Nodemailer transporter + sendInviteEmail
- `src/lib/plans.ts` — PLAN_MEMBER_LIMITS
- `src/app/api/invitations/route.ts` — create invitation
- `src/app/api/invitations/[token]/route.ts` — accept invitation
- `src/app/(app)/members/page.tsx` — members page
- `src/app/(app)/members/MemberInviteForm.tsx` — invite form

---

## Previous phases

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

## Next: Phase 6 — Shifts (CRUD + Recurrence Engine)

### What to build
- Shift model already in DB: title, description, startsAt, endsAt, recurrence (ONE_OFF/DAILY/WEEKLY/MONTHLY)
- `src/app/(app)/shifts/page.tsx` — list shifts for the org
- `src/app/(app)/shifts/new/page.tsx` — create shift form (title, dates, recurrence, assignees)
- `src/app/api/shifts/route.ts` — POST create shift (enforce assignee limits per plan)
- `src/app/api/shifts/[id]/route.ts` — GET, PATCH, DELETE
- Assignee limit enforcement: check ShiftAssignee count against `Plan` limits (FREE:1, STARTER:5, PRO:10, ENTERPRISE:∞)
- Only ADMINs can create/edit/delete shifts
