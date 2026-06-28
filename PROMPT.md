# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 12 (Polish + Deploy) — all prior plans complete.**

Remaining items (in order): error pages → loading states → SEO metadata → Vercel deploy.

---

## Immediate task: error pages + loading states + SEO

### Error pages
- `src/app/not-found.tsx` — 404 with "Go home" button
- `src/app/error.tsx` — error boundary with retry button (must be `'use client'`)

### Loading states (shadcn/ui Skeleton)
- `src/app/(app)/dashboard/loading.tsx`
- `src/app/(app)/shifts/loading.tsx`
- `src/app/(app)/members/loading.tsx`

### SEO metadata
- Root layout `src/app/layout.tsx` — `export const metadata: Metadata`
- Landing page `src/app/page.tsx` — page-level metadata
- Marketing layout `src/app/(marketing)/layout.tsx` — shared marketing metadata

---

## What was built (full history)
- Next.js 16 App Router + TypeScript + Tailwind CSS + shadcn/ui scaffolded and building cleanly
- Full folder structure per the plan
- `vercel.json` with Vercel Cron config (hourly: `0 * * * *`)
- Prisma 7 + Supabase PostgreSQL connected; `prisma.config.ts` pattern (not `url` in schema)
- `prisma/schema.prisma` — 9 models + 6 enums: User, Organization, OrgMember, Shift, ShiftAssignee, ShiftCompletion, Invitation, Notification; enums: PlatformRole, OrgRole, Plan, Recurrence, ReminderType, NotificationType
- `src/lib/prisma.ts` — singleton PrismaClient with `PrismaPg` adapter
- `src/lib/auth.ts` — `syncUser()` wrapped in `React.cache()`
- `src/proxy.ts` — route proxy protecting app routes (Next.js 16: middleware → proxy, export named `proxy`)
- `src/lib/stripe.ts` — Stripe singleton + `PLAN_TO_PRICE` / `PRICE_TO_PLAN` maps
- Stripe webhook, checkout, portal API routes
- `src/components/billing/PricingCards.tsx` — client pricing UI
- `src/app/(app)/settings/billing/page.tsx` — billing settings page
- `src/lib/email.ts` — Nodemailer; `sendInviteEmail`, `sendDailySummaryEmail`, `sendPersonalShiftSummaryEmail`, `sendPreShiftReminderEmail`
- `src/lib/plans.ts` — `PLAN_MEMBER_LIMITS`, `PLAN_ASSIGNEE_LIMITS`, `PLAN_ORG_LIMITS`, `PLAN_ALLOWED_REMINDER_TYPES`
- Full invite flow: POST `/api/invitations`, GET `/api/invitations/[token]`
- `src/app/(app)/members/page.tsx` + `MemberInviteForm.tsx`
- Full shifts CRUD: POST/GET/PATCH/DELETE `/api/shifts`, `/api/shifts/[id]`
- `src/app/(app)/shifts/page.tsx`, `shifts/new/page.tsx`, `shifts/new/ShiftForm.tsx`
- Completion tracking: POST `/api/shifts/[id]/complete`
- `src/app/(app)/shifts/[id]/page.tsx` + `MarkCompleteButton.tsx`
- `src/lib/org.ts` — `ACTIVE_ORG_COOKIE` + `getActiveOrg(userId)` — returns `OrgMember & { org: Organization }`; use `.orgId` (not `.id`) for org-scoped queries
- `src/lib/org-actions.ts` — `switchOrg(orgId)` server action
- POST `/api/orgs` — create org with plan limit check
- `src/app/(app)/layout.tsx` — mobile-responsive: desktop `hidden md:flex` sidebar, mobile hamburger header → `MobileSidebar.tsx` (Sheet 80vw); `ProfileMenu` replaces LogoutLink; `isOrgAdmin` passed to SidebarNav
- `src/components/app/SidebarNav.tsx` — "Settings" in `BASE_LINKS` (all members); Reminders + Billing for leaders only; no separate admin links
- `src/components/app/MobileSidebar.tsx` — Sheet-based drawer; `SheetTrigger` styled directly (no nested button)
- `src/components/app/ProfileMenu.tsx` — avatar + name; popup with My Profile + Sign Out
- `src/components/app/ProfileModal.tsx` — Dialog; name edit (User.name, global), email (read-only), password reset, delete account
- `src/components/org/OrgSwitcher.tsx` — client dropdown: switch orgs + "New org" gated by plan limit
- `src/app/(app)/org/new/page.tsx` + `OrgCreateForm.tsx`
- PATCH `/api/orgs/reminders` — reminder settings (owner-only, plan-gated)
- PATCH/DELETE `/api/orgs/[id]` — rename org + delete org (owner-only)
- `src/components/org/ReminderSettingsForm.tsx` + `src/app/(app)/settings/reminders/page.tsx`
- `src/app/(app)/settings/page.tsx` — accessible to ALL members; Display Name card at top (defaults to `user.name` when unset); Org rename + Danger Zone conditionally rendered for admins only
- `src/app/(app)/settings/profile/DisplayNameForm.tsx` — accepts `currentDisplayName` + `fallbackName`; input defaults to `fallbackName` (`user.name`) when display name is null
- GET `/api/cron/reminders` — hourly cron handler with `CRON_SECRET` auth; creates `REMINDER_SENT` notifications
- `src/app/globals.css` — purple primary theme, `scroll-behavior: smooth`, Geist font fix, cursor pointer for all interactive elements
- `src/components/marketing/MarketingHeader.tsx` — client component; IntersectionObserver for active section highlight; logo scroll-to-top
- `src/components/marketing/MarketingFooter.tsx` + `src/app/(marketing)/layout.tsx`
- `src/app/page.tsx` — full landing page (Hero, How It Works, Features bento, Pricing 4-card, dark CTA banner)
- `src/app/(app)/dashboard/page.tsx` — admin view: sticky admin bar (`hidden md:flex`) with `<GlobalSearch />` + `<NotificationBell />`; greeting; 4 stat cards; bento grid (Shifts Overview + Team Status + Recent Activity)
- `src/components/app/NotificationBell.tsx` — bell with unread badge; fade/grow popup; marks all read on open
- `src/components/app/GlobalSearch.tsx` — debounced 300ms; Shifts + Members dropdown; navigate on click
- Notification system: `Notification` model in DB; `GET/PATCH /api/notifications`; `GET /api/search`; triggers in invitations + cron reminders routes
- User API routes: `PATCH /api/user/profile`, `POST /api/user/password-reset`, `DELETE /api/user/account`
- `OrgMember.displayName String?` — org-scoped display name; `PATCH /api/org-member/display-name`; search filters by `displayName`; members page shows `displayName ?? user.name ?? user.email`

## Tech stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui (base-nova, no tailwind.config.ts — theme in globals.css)
- Prisma 7 + Supabase (PostgreSQL) — **Prisma 7 uses `prisma.config.ts`, not `url` in schema**
- Kinde (auth) — **Next.js 16 uses `proxy.ts` not `middleware.ts`; export named `proxy`**
- Stripe (billing)
- Gmail SMTP / Nodemailer (email — invites + reminders)
- Vercel Cron (hourly reminders: `0 * * * *`)
- Vercel (deploy)
- Google Stitch MCP (server: `stitch` — restart Claude Code to load tools if needed)

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

## Working agreement
- Build **phase by phase** — confirm each phase works before starting the next
- After each phase: update `handover.md`, `PLAN.md`, `PROMPT.md`, and save memory
- Commit after each meaningful change (lowercase messages); push only after full phase completes

## Reference
See `PLAN.md` for full phase list and `handover.md` for detailed next steps.
