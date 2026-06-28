# Shifty — Session Starter Prompt

We are building **Shifty**, a shift and task delegation management SaaS platform.

## Current status
**Phase 12 (Polish + Deploy) — Plans 1–4 and the display_name plan are all complete.**

Remaining items: error pages → loading states → SEO metadata → Vercel deploy.

## Immediate task: error pages + loading states + SEO

### Error pages
- `src/app/not-found.tsx` — 404 with "Go home" button
- `src/app/error.tsx` — error boundary with retry button (must be a client component with `'use client'`)

### Loading states (shadcn/ui Skeleton)
- `src/app/(app)/dashboard/loading.tsx`
- `src/app/(app)/shifts/loading.tsx`
- `src/app/(app)/members/loading.tsx`

### SEO metadata
- Root layout `src/app/layout.tsx` — `export const metadata: Metadata`
- Landing page `src/app/page.tsx` — page-level metadata
- Marketing layout `src/app/(marketing)/layout.tsx` — shared marketing metadata

---

### Archived: display_name plan (complete)

Execute commits in this order: 1 → 2 → (3, 4, 5 in parallel) → (6, 7 together) → 8 ✅

---

### Archived Commit 1 — `prisma: add displayName to OrgMember`
**Files:** `prisma/schema.prisma` + new migration

Add `displayName String?` to `OrgMember` after the `role` field:
```prisma
model OrgMember {
  id          String   @id @default(cuid())
  userId      String
  orgId       String
  role        OrgRole  @default(MEMBER)
  displayName String?
  joinedAt    DateTime @default(now())
  ...
}
```
Run: `npx prisma migrate dev --name add_org_member_display_name`

---

### Commit 2 — `feat: add PATCH /api/org-member/display-name endpoint`
**New file:** `src/app/api/org-member/display-name/route.ts`

```ts
import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await syncUser()
  const activeOrg = await getActiveOrg(user.id)
  if (!activeOrg) return Response.json({ error: 'No active organisation' }, { status: 400 })
  const { displayName } = (await req.json()) as { displayName?: string }
  await prisma.orgMember.update({
    where: { userId_orgId: { userId: user.id, orgId: activeOrg.orgId } },
    data: { displayName: displayName?.trim() || null },
  })
  return Response.json({ ok: true })
}
```

---

### Commit 3 — `feat: add /settings/profile page for org-scoped display name`
**New files:** `src/app/(app)/settings/profile/page.tsx`, `src/app/(app)/settings/profile/DisplayNameForm.tsx`

**`page.tsx`** — server component, no admin check, accessible to all members:
```tsx
import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import { redirect } from 'next/navigation'
import DisplayNameForm from './DisplayNameForm'

export default async function ProfileSettingsPage() {
  const user = await syncUser()
  const membership = await getActiveOrg(user.id)
  if (!membership) redirect('/org/new')

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your identity within {membership.org.name}</p>
      </div>
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold">Display Name</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Shown to other members in {membership.org.name}. Falls back to your account name when not set.
          </p>
        </div>
        <DisplayNameForm currentDisplayName={membership.displayName} />
      </div>
    </main>
  )
}
```

**`DisplayNameForm.tsx`** — client component, `useRef` + `useRouter().refresh()` pattern (same as `OrgSettingsForm`):
```tsx
'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DisplayNameForm({ currentDisplayName }: { currentDisplayName: string | null }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const displayName = inputRef.current?.value ?? ''
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/org-member/display-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      if (!res.ok) { setError((await res.json()).error ?? 'Failed to save'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          defaultValue={currentDisplayName ?? ''}
          placeholder="Your name in this organisation"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {saved && <p className="text-xs text-green-600">Display name saved!</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
```

---

### Commit 4 — `feat: add My Profile link to SidebarNav for all members`
**File:** `src/components/app/SidebarNav.tsx`

Add `UserCog` to lucide-react import. Add to `BASE_LINKS`:
```ts
{ href: '/settings/profile', label: 'My Profile', icon: UserCog }
```
Visible to all members. MobileSidebar picks this up automatically.

---

### Commit 5 — `fix: rename "Display Name" to "Name" in ProfileModal`
**File:** `src/components/app/ProfileModal.tsx`

Change heading from `"Display Name"` → `"Name"`. Add sub-label below heading:
```tsx
<p className="text-xs text-muted-foreground mb-3">Your global account name across all organisations.</p>
```
No functional changes.

---

### Commit 6 — `fix: search route — restrict to active org, search by displayName, privacy-aware response`
**File:** `src/app/api/search/route.ts`

Full rewrite:
```ts
import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import prisma from '@/lib/prisma'
import { OrgRole } from '@prisma/client'

export async function GET(request: Request) {
  const user = await syncUser()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return Response.json({ shifts: [], members: [] })

  const activeOrg = await getActiveOrg(user.id)
  if (!activeOrg) return Response.json({ shifts: [], members: [] })

  const isAdmin = activeOrg.role === OrgRole.ADMIN

  const [shifts, members] = await Promise.all([
    prisma.shift.findMany({
      where: { orgId: activeOrg.orgId, title: { contains: q, mode: 'insensitive' } },
      select: { id: true, title: true, startsAt: true },
      take: 8,
      orderBy: { startsAt: 'asc' },
    }),
    prisma.orgMember.findMany({
      where: { orgId: activeOrg.orgId, displayName: { contains: q, mode: 'insensitive' } },
      select: {
        id: true,
        displayName: true,
        role: true,
        user: { select: { id: true, name: true } },
      },
      take: 5,
    }),
  ])

  return Response.json({
    shifts: shifts.map((s) => ({ ...s, orgName: activeOrg.org.name })),
    members: members.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      role: m.role,
      ...(isAdmin && { realName: m.user.name }),
    })),
  })
}
```

**Key fixes in this commit:**
- Removes multi-org shift search (was `orgId: { in: orgIds }`) — now single `activeOrg.orgId` only
- Fixes pre-existing bug: was `orgId: activeOrg.id` (OrgMember PK) — now correctly `activeOrg.orgId`
- Members filtered by `displayName`, not `user.name`/`user.email`
- `realName` only included in response for admins

---

### Commit 7 — `fix: GlobalSearch — update MemberResult type and member row for displayName`
**File:** `src/components/app/GlobalSearch.tsx`

Update `MemberResult` type:
```ts
type MemberResult = {
  id: string
  displayName: string | null
  role: string
  realName?: string | null
}
```

Update member row JSX — replace the two `<span>` lines inside the member button:
```tsx
<span className="text-sm font-medium">{m.displayName ?? '—'}</span>
{m.realName != null && (
  <span className="text-xs text-muted-foreground">{m.realName}</span>
)}
```

---

### Commit 8 — `fix: members page — show displayName with fallback to user.name then email`
**File:** `src/app/(app)/members/page.tsx`

The existing `include: { user: true }` query already returns `displayName` after the migration — no query changes needed.

In the table body, change the member name display:
```tsx
// Before
{m.user.name ?? m.user.email}
// After
{m.displayName ?? m.user.name ?? m.user.email}
```

---

## Remaining Phase 12 items (next up)

1. **Error pages** — `src/app/not-found.tsx` (404 + "Go home"), `src/app/error.tsx` (error boundary + retry)
2. **Loading states** — `src/app/(app)/dashboard/loading.tsx`, `src/app/(app)/shifts/loading.tsx`, `src/app/(app)/members/loading.tsx` (shadcn/ui `Skeleton`)
3. **SEO** — `metadata` export in `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/(marketing)/layout.tsx`
4. **Vercel deploy** — env var audit + deploy

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
- `src/components/app/SidebarNav.tsx` — `isLeader` + `isOrgAdmin` props; Settings2 link for admins; "My Profile" link for all members (added in display_name plan)
- `src/components/app/MobileSidebar.tsx` — Sheet-based drawer; `SheetTrigger` styled directly (no nested button — `@base-ui/react` Trigger already renders a button)
- `src/components/app/ProfileMenu.tsx` — avatar + name; popup with My Profile + Sign Out
- `src/components/app/ProfileModal.tsx` — Dialog; name edit (User.name, global), email (read-only), password reset, delete account
- `src/components/org/OrgSwitcher.tsx` — client dropdown: switch orgs + "New org" gated by plan limit
- `src/app/(app)/org/new/page.tsx` + `OrgCreateForm.tsx`
- PATCH `/api/orgs/reminders` — reminder settings (owner-only, plan-gated)
- PATCH/DELETE `/api/orgs/[id]` — rename org + delete org (owner-only)
- `src/components/org/ReminderSettingsForm.tsx` + `src/app/(app)/settings/reminders/page.tsx`
- `src/app/(app)/settings/page.tsx` — org admin only; `OrgSettingsForm.tsx` + `DeleteOrgButton.tsx` (type-to-confirm)
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
