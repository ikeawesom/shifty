# Shifty — Handover

## Last worked on: Phase 12 — Polish + Deploy (display_name plan complete)

### What was done THIS session

#### Plan 3 — UI Polish ✅
- `src/app/globals.css` — `cursor: pointer` for all interactive elements (`button:not([disabled])`, `a`, `[role="button"]`, `select`, `label`)

#### Plan 4 — Search Enhancement ✅
- `src/app/api/search/route.ts` — added member search via `getActiveOrg(user.id)`; queries `OrgMember` by `user.email OR user.name`; returns `members[]` alongside `shifts[]`
- `src/components/app/GlobalSearch.tsx` — `max-w-sm` → `w-full`; `MemberResult` type; Members section in dropdown; clicking navigates to `/members`

#### Display Name Plan (8 commits) ✅
- `prisma/schema.prisma` + migration `20260628152731_add_org_member_display_name` — `displayName String?` added to `OrgMember`
- `src/app/api/org-member/display-name/route.ts` (new) — `PATCH` updates org-scoped display name for active org member
- `src/app/(app)/settings/profile/page.tsx` + `DisplayNameForm.tsx` (new) — profile settings page accessible to all members; shows current `displayName`, saves via `PATCH /api/org-member/display-name`
- `src/components/app/SidebarNav.tsx` — added `UserCog` "My Profile" link to `BASE_LINKS` (visible to all members)
- `src/components/app/ProfileModal.tsx` — heading "Display Name" → "Name"; added sub-label "Your global account name across all organisations."
- `src/app/api/search/route.ts` — full rewrite: single `activeOrg.orgId` scope; members filtered by `displayName`; `realName` in response for admins only; fixes pre-existing `activeOrg.id` vs `activeOrg.orgId` bug
- `src/components/app/GlobalSearch.tsx` — `MemberResult` type updated (`displayName`, `realName?`); member row shows `displayName ?? '—'` + conditional `realName`
- `src/app/(app)/members/page.tsx` — name display: `displayName ?? user.name ?? user.email`

#### Force push
- Remote was diverged (stale at Phase 6 with different SHA history). Force-pushed local master to bring remote up to date.

---

### What's immediately next (Phase 12 — remaining items)

1. **Error pages**
   - `src/app/not-found.tsx` — 404 page with "Go home" link
   - `src/app/error.tsx` — error boundary with retry button

2. **Loading states**
   - `src/app/(app)/dashboard/loading.tsx`
   - `src/app/(app)/shifts/loading.tsx`
   - `src/app/(app)/members/loading.tsx`
   - Use shadcn/ui `Skeleton` component

3. **SEO** — `metadata` export in:
   - `src/app/layout.tsx` (root)
   - `src/app/page.tsx` (landing)
   - `src/app/(marketing)/layout.tsx`

4. **Env var audit** + **Vercel deployment**

---

## Previous phases — see PLAN.md for full history
