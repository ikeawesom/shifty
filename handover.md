# Shifty — Handover

## Last completed: Phase 3 — Auth + Onboarding (Kinde)

### What was done
- Installed `@kinde-oss/kinde-auth-nextjs@2.13.0`
- Created `src/app/api/auth/[kindeAuth]/route.ts` — Kinde catch-all route handler (`GET = handleAuth()`)
- Created `src/lib/auth.ts` — `getUser()`, `requireUser()`, `syncUser()` server helpers
  - `syncUser()` upserts a DB `User` row from the Kinde session on every protected page load
- Created `src/proxy.ts` — route proxy protecting `/dashboard`, `/org`, `/members`, `/shifts`, `/settings`
  - Note: Next.js 16 renamed `middleware.ts` → `proxy.ts`, export named `proxy` (not default)
- Created `src/app/(app)/dashboard/page.tsx` — syncs user, redirects to `/org/new` if no org membership
- Created `src/app/(app)/org/new/page.tsx` + `OrgCreateForm.tsx` — server action creates Org + OrgMember (ADMIN)
- Replaced boilerplate `src/app/page.tsx` with Sign in / Create account links; redirects to `/dashboard` if logged in
- Updated `src/app/layout.tsx` — metadata + Sonner `<Toaster />`
- Build passes cleanly (no warnings)

### Auth flow
1. User visits `/` → not authed → sees sign in / register links
2. User clicks "Create account" → `/api/auth/register` → Kinde hosted UI
3. Kinde redirects to `/dashboard` on success
4. `syncUser()` upserts User row (sets `platformRole = ORG_LEADER` on create)
5. No org membership → redirected to `/org/new`
6. User fills org name → server action creates Org + OrgMember (ADMIN) → back to `/dashboard`
7. Returning visits: middleware (`proxy.ts`) checks Kinde cookies; unauthenticated requests go to `/api/auth/login`

### Key files
- `src/proxy.ts` — route protection (replaces middleware)
- `src/lib/auth.ts` — server auth helpers; import `syncUser` on every protected Server Component
- `src/app/api/auth/[kindeAuth]/route.ts` — Kinde handler
- `src/app/(app)/dashboard/page.tsx` — entry point after login
- `src/app/(app)/org/new/page.tsx` — onboarding: create first org

### Next.js 16 gotcha
`middleware.ts` is deprecated — renamed to `proxy.ts`. The exported function must be named `proxy`, not `default`. The `config.matcher` export still works the same.

---

## Previous phases

### Phase 2 — Database (Supabase + Prisma)
- Prisma 7 + Supabase PostgreSQL
- `prisma/schema.prisma` — 7 models, 4 enums
- `prisma.config.ts` — Prisma 7 connection config (no `url` in schema)
- `src/lib/prisma.ts` — singleton PrismaClient with `PrismaPg` adapter
- Migration `20260626141645_init` applied

### Phase 1 — Scaffold + Tooling
- Next.js 16 App Router + TypeScript + Tailwind CSS + shadcn/ui
- Full folder structure, `src/types/index.ts`, `vercel.json`

---

## Next: Phase 4 — Billing (Stripe)

### What to do
1. Create a Stripe account, get test API keys
2. Create products/prices in Stripe dashboard (Starter, Pro, Enterprise)
3. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_PRICE_STARTER="price_..."
   STRIPE_PRICE_PRO="price_..."
   STRIPE_PRICE_ENTERPRISE="price_..."
   ```
4. Tell Claude "Phase 4 ready"
