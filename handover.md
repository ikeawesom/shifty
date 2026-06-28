# Shifty — Handover

## Last worked on: Phase 12 — Polish + Deploy (in progress)

### What was done THIS session

#### Plan 1 — Admin Bar Modifications ✅
- Prisma `Notification` model + `NotificationType` enum added to schema; migration `20260628141429_add_notifications` applied to Supabase
- `src/components/app/NotificationBell.tsx` — bell icon with red unread badge; fade/grow popup anchored top-right; fetches `GET /api/notifications` on mount; `PATCH /api/notifications` marks all read on open
- `src/components/app/GlobalSearch.tsx` — debounced 300ms input; `GET /api/search?q=...` returns Shifts across user's orgs with org name subtitle; dropdown navigates on click
- `src/app/api/notifications/route.ts` — GET (last 20, newest first) + PATCH (mark all read)
- `src/app/api/search/route.ts` — GET searches shifts by title across user's orgs
- `src/app/api/invitations/route.ts` — creates `INVITED_TO_ORG` notification for existing users on invite
- `src/app/api/invitations/[token]/route.ts` — creates `MEMBER_JOINED` notification for org owner on accept
- `src/app/api/cron/reminders/route.ts` — creates `REMINDER_SENT` notification after each reminder email
- `src/app/(app)/dashboard/page.tsx` — static search + bell replaced with `<GlobalSearch />` + `<NotificationBell userId={user.id} />`; admin bar now `hidden md:flex`

#### Plan 2 — Environment Modifications ✅
- `src/app/(app)/layout.tsx` — desktop sidebar `hidden md:flex`; mobile fixed header (h-14, z-50) with `<MobileSidebar>`; main content `md:ml-64 mt-14 md:mt-0`; `isOrgAdmin` derived from `activeMembership?.role === OrgRole.ADMIN`; `LogoutLink` replaced with `<ProfileMenu>`
- `src/components/app/SidebarNav.tsx` — added `isOrgAdmin: boolean` prop; Settings2 link for admins; Settings active state is exact-match only (avoids false positives with `/settings/billing` + `/settings/reminders`)
- `src/components/app/MobileSidebar.tsx` — Sheet-based hamburger drawer; mirrors desktop sidebar (SidebarNav + OrgSwitcher + ProfileMenu)
- `src/components/app/ProfileMenu.tsx` — avatar initial button; popup above (fade/grow, bottom-left anchor); "My Profile" → opens ProfileModal; "Sign Out" → LogoutLink
- `src/components/app/ProfileModal.tsx` — Dialog; 4 sections: Display Name (PATCH `/api/user/profile`), Email (read-only), Password Reset (POST `/api/user/password-reset`), Delete Account (DELETE `/api/user/account`)
- `src/app/(app)/settings/page.tsx` — server, ADMIN-only guard; OrgSettingsForm + DeleteOrgButton
- `src/app/(app)/settings/OrgSettingsForm.tsx` — PATCH org name via `/api/orgs/[id]`, calls `router.refresh()`
- `src/app/(app)/settings/DeleteOrgButton.tsx` — type-org-name-to-confirm deletion; DELETE `/api/orgs/[id]`; redirects to dashboard
- `src/app/api/orgs/[id]/route.ts` — PATCH (rename, owner-only) + DELETE (delete org + clear active-org cookie, owner-only)
- `src/app/api/user/profile/route.ts` — PATCH display name
- `src/app/api/user/password-reset/route.ts` — POST stub (returns ok)
- `src/app/api/user/account/route.ts` — DELETE user (cascades via Prisma) + returns Kinde logout URL

---

### What's immediately next (Phase 12 — remaining)

1. **Error pages**
   - `src/app/not-found.tsx` — 404 page with "Go home" link
   - `src/app/error.tsx` — error boundary with retry button

2. **Loading states** (`loading.tsx` files using shadcn/ui `Skeleton`)
   - `src/app/(app)/dashboard/loading.tsx`
   - `src/app/(app)/shifts/loading.tsx`
   - `src/app/(app)/members/loading.tsx`

3. **SEO** — `metadata` export in `src/app/layout.tsx`, landing page, and marketing pages (title, description, Open Graph)

4. **Env var audit** — all secrets documented in PLAN.md; confirm all are set in Vercel before deploy

5. **Vercel deployment** — push to GitHub, connect Vercel, add env vars, deploy

---

## Previous phases — see PLAN.md for full history
