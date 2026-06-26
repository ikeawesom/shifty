# Shifty — Handover

## Last completed: Phase 4 — Billing (Stripe)

### What was done
- Created `src/lib/stripe.ts` — singleton Stripe client + `PLAN_TO_PRICE` / `PRICE_TO_PLAN` maps
- Created `src/app/api/webhooks/stripe/route.ts`:
  - Verifies Stripe signature via `stripe.webhooks.constructEvent`
  - `checkout.session.completed` → updates `stripeCustomerId`, `stripeSubscriptionId`, `plan` on User
  - `customer.subscription.updated` → syncs plan change from price ID
  - `customer.subscription.deleted` → resets to `FREE`, clears `stripeSubscriptionId`
- Created `src/app/api/billing/checkout/route.ts` — creates Stripe Hosted Checkout Session (subscription mode)
- Created `src/app/api/billing/portal/route.ts` — creates Stripe Customer Portal session
- Created `src/components/billing/PricingCards.tsx` — client component: 3 tier cards, upgrade/portal buttons
- Created `src/app/(app)/settings/billing/page.tsx` — shows current plan + PricingCards
- Build passes cleanly

### Billing flow
1. User visits `/settings/billing` → sees current plan badge + 3 pricing cards (Starter / Pro / Enterprise)
2. Clicks "Upgrade" → POST `/api/billing/checkout` → Stripe Hosted Checkout redirect
3. Pays → Stripe fires `checkout.session.completed` → webhook updates User plan in DB
4. User redirected back to `/settings/billing?success=1`
5. Existing subscribers click "Manage Billing" → POST `/api/billing/portal` → Stripe portal (cancel/downgrade)
6. Cancel → Stripe fires `customer.subscription.deleted` → plan resets to FREE

### Testing
```
# terminal 1
npm run dev

# terminal 2
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# test card: 4242 4242 4242 4242, any future expiry, any CVC
```

### Key files
- `src/lib/stripe.ts` — Stripe singleton + plan↔price maps
- `src/app/api/webhooks/stripe/route.ts` — subscription sync
- `src/app/api/billing/checkout/route.ts` — checkout
- `src/app/api/billing/portal/route.ts` — portal
- `src/components/billing/PricingCards.tsx` — billing UI
- `src/app/(app)/settings/billing/page.tsx` — billing page

---

## Previous phases

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

## Next: Phase 5 — Members + Invite Flow

### What to build
- Invite member by email: generate signed token, store `Invitation` row, send email
- Accept invite route: validate token → create `OrgMember` (role: MEMBER)
- Member dashboard: same `/dashboard` but no billing link
- Enforce tier member limits on invite send (check against `Plan` limits)
- Email via Nodemailer + Gmail SMTP (env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
