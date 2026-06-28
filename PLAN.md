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
| 11 | Marketing Pages | ✅ Done |
| 12 | Polish + Deploy | 🔄 In Progress |

## Current Phase: 12 — Polish + Deploy

### Done so far

- **Theme**: Purple primary (`oklch(0.548 0.241 286.7)`), ring + sidebar updated, font bug fixed (`globals.css`)
- **Smooth scroll**: `scroll-behavior: smooth` added to `html` in `globals.css`
- **Shared nav** (`src/components/marketing/MarketingHeader.tsx`): client component; IntersectionObserver highlights active "Features"/"Pricing" nav link; logo click smooth-scrolls to top
- **Shared footer** (`src/components/marketing/MarketingFooter.tsx`): Pricing link updated to `/#pricing`
- **Marketing layout**: `src/app/(marketing)/layout.tsx` uses shared header/footer
- **Landing page** (`src/app/page.tsx`): full Stitch-inspired overhaul; comparison table removed; features bento grid + inline pricing section
- **Standalone `/pricing` page deleted** — content fully inlined on landing page
- **App layout** (`src/app/(app)/layout.tsx`): mobile-responsive — desktop fixed `w-64` sidebar (`hidden md:flex`), mobile hamburger header → `MobileSidebar.tsx` (Sheet at 80vw); `md:ml-64 mt-14 md:mt-0` main content offset
- **`src/components/app/SidebarNav.tsx`**: `isOrgAdmin` prop, Settings2 link for admins, active link fix for `/settings` exact match; `UserCog` "My Profile" link for all members
- **Dashboard admin view redesign** (`src/app/(app)/dashboard/page.tsx`): sticky admin bar (`hidden md:flex`), greeting, 4 stat cards, bento grid. Bar now uses `<GlobalSearch />` + `<NotificationBell userId={user.id} />`
- **Notification system**: `Notification` Prisma model + `NotificationType` enum; migration `20260628141429_add_notifications` applied; `GET/PATCH /api/notifications`; `GET /api/search`; triggers in invitations + cron reminders routes
- **`src/components/app/NotificationBell.tsx`**: bell with unread badge, fade/grow popup, mark-all-read on open
- **`src/components/app/GlobalSearch.tsx`**: debounced 300ms; Shifts + Members dropdown (members show `displayName`, admins see `realName`); full-width bar; navigates on click
- **`src/components/app/MobileSidebar.tsx`**: Sheet-based hamburger drawer mirroring desktop sidebar; hydration bug fixed (no `asChild` nested button)
- **`src/components/app/ProfileMenu.tsx`**: replaces LogoutLink; shows avatar initial + name/email; popup with My Profile + Sign Out
- **`src/components/app/ProfileModal.tsx`**: Dialog; 4 sections (Name — global account name, email readonly, password reset, delete account)
- **Settings page** (`src/app/(app)/settings/page.tsx`): org admin only; `OrgSettingsForm.tsx` + `DeleteOrgButton.tsx` (type-to-confirm); `PATCH/DELETE /api/orgs/[id]`
- **User API routes**: `PATCH /api/user/profile`, `POST /api/user/password-reset`, `DELETE /api/user/account`
- **Plan 3** — `globals.css`: cursor pointer for all interactive elements ✅
- **Plan 4** — `api/search/route.ts` + `GlobalSearch.tsx`: member search by name/email in active org ✅
- **Display Name Plan** (8 commits) ✅
  - `prisma/schema.prisma` + migration `20260628152731_add_org_member_display_name` — `displayName String?` on `OrgMember`
  - `PATCH /api/org-member/display-name` — update org-scoped display name
  - `src/app/(app)/settings/profile/page.tsx` + `DisplayNameForm.tsx` — profile settings page (exists but nav link removed)
  - `src/components/app/ProfileModal.tsx` — heading renamed "Display Name" → "Name" + sub-label
  - `src/app/api/search/route.ts` — scoped to `activeOrg.orgId`, filters by `displayName`, admin-only `realName` in response
  - `src/components/app/GlobalSearch.tsx` — updated `MemberResult` type + member row
  - `src/app/(app)/members/page.tsx` — `displayName ?? user.name ?? user.email` fallback
- **Post-session fixes** ✅
  - `npx prisma generate` — Prisma client regenerated after `displayName` migration (was causing 500 on `/api/search`)
  - `src/app/(app)/settings/page.tsx` — Display Name card added for all members; admin-only redirect lifted; Org + Danger Zone now conditionally rendered for admins only
  - `src/app/(app)/settings/profile/DisplayNameForm.tsx` — accepts `fallbackName` prop; input defaults to `user.name` when `displayName` is null
  - `src/components/app/SidebarNav.tsx` — "Settings" moved to `BASE_LINKS` (all members); "My Profile" link + `ADMIN_LINKS` removed; `UserCog` import dropped

### Still to do

- **Error pages** — `src/app/not-found.tsx`, `src/app/error.tsx`
- **Loading states** — `src/app/(app)/dashboard/loading.tsx`, `src/app/(app)/shifts/loading.tsx`, `src/app/(app)/members/loading.tsx` (shadcn/ui Skeleton)
- **SEO** — metadata + Open Graph in `src/app/layout.tsx`, landing + marketing pages
- **Env var audit** — document all secrets needed for Vercel deploy
- **Vercel deployment**

### Env vars needed for deploy

| Var | Source |
|---|---|
| `DATABASE_URL` | Supabase connection string |
| `DIRECT_URL` | Supabase direct connection (for migrations) |
| `KINDE_CLIENT_ID` | Kinde app dashboard |
| `KINDE_CLIENT_SECRET` | Kinde app dashboard |
| `KINDE_ISSUER_URL` | Kinde app dashboard |
| `KINDE_SITE_URL` | Production URL (e.g. `https://shifty.vercel.app`) |
| `KINDE_POST_LOGOUT_REDIRECT_URL` | Production URL |
| `KINDE_POST_LOGIN_REDIRECT_URL` | `${KINDE_SITE_URL}/dashboard` |
| `STRIPE_SECRET_KEY` | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI / Vercel webhook config |
| `SMTP_HOST` | Gmail SMTP host |
| `SMTP_PORT` | 587 |
| `SMTP_USERNAME` | Gmail address |
| `SMTP_PASSWORD` | Gmail app password |
| `CRON_SECRET` | Auto-injected by Vercel Cron |
| `KINDE_M2M_CLIENT_ID` | Kinde M2M app (for user management API) |
| `KINDE_M2M_CLIENT_SECRET` | Kinde M2M app (for user management API) |

---

## Completed Phase: 10 — Email Reminders (cron)

### What was built
- `prisma/schema.prisma` — added `ReminderType` enum + three fields on `Organization`: `reminderType`, `reminderHourUtc`, `reminderLeadMinutes`
- `prisma/migrations/20260628050902_add_reminder_settings/` — applied to Supabase
- `src/lib/plans.ts` — added `PLAN_ALLOWED_REMINDER_TYPES`
- `src/lib/email.ts` — added `sendDailySummaryEmail`, `sendPersonalShiftSummaryEmail`, `sendPreShiftReminderEmail`
- `src/app/api/orgs/reminders/route.ts` — PATCH: owner-only, plan-gated, updates org reminder settings
- `src/components/org/ReminderSettingsForm.tsx` — client form: radio type picker, UTC hour picker, lead-time input
- `src/app/(app)/settings/reminders/page.tsx` — server page, owner-only guard
- `src/app/api/cron/reminders/route.ts` — hourly GET handler secured with `CRON_SECRET`
- `vercel.json` — cron schedule changed to hourly `0 * * * *`
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
- Updated `src/app/(app)/dashboard/page.tsx` — role-branched stat cards, "My Upcoming Shifts" (next 5), "Recent Activity" (last 10 completions)

## Completed Phase: 7 — Completion Tracking

### What was built
- `src/app/api/shifts/[id]/complete/route.ts` — POST: mark shift complete (one per member per shift, 409 if duplicate)
- `src/app/(app)/shifts/[id]/page.tsx` — shift detail page with completion history + "Mark complete" button
- `src/app/(app)/shifts/[id]/MarkCompleteButton.tsx` — client button component
- Updated `src/app/(app)/shifts/page.tsx` — each row links to detail, shows X/Y completed badge

## Completed Phase: 6 — Shifts (CRUD + Recurrence Engine)

### What was built
- `src/lib/plans.ts` — added PLAN_ASSIGNEE_LIMITS
- `src/app/api/shifts/route.ts` — POST create shift
- `src/app/api/shifts/[id]/route.ts` — GET / PATCH / DELETE
- `src/app/(app)/shifts/page.tsx` — shift list
- `src/app/(app)/shifts/new/page.tsx` + `ShiftForm.tsx` — create shift UI

## Completed Phase: 5 — Members + Invite Flow

### What was built
- `src/lib/email.ts` — Nodemailer transporter + sendInviteEmail
- `src/lib/plans.ts` — PLAN_MEMBER_LIMITS
- `src/app/api/invitations/route.ts` — create invitation + send email
- `src/app/api/invitations/[token]/route.ts` — validate token → create OrgMember → redirect
- `src/app/(app)/members/page.tsx` — member list + pending invites + invite form
- `src/app/(app)/members/MemberInviteForm.tsx` — client invite form

## Tech Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui (base-nova style, CSS-variable based)
- Prisma 7 + Supabase (PostgreSQL)
- Kinde (auth)
- Stripe (billing)
- Gmail SMTP / Nodemailer (email)
- Vercel Cron (reminders)
- Vercel (deploy)
