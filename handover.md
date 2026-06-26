# Shifty — Handover

## Last completed: Phase 2 — Database (Supabase + Prisma)

### What was done
- Installed Prisma 7 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `@types/pg`)
- Wrote `prisma/schema.prisma` — 7 models, 4 enums (no `url` in schema — Prisma 7 breaking change)
- Created `prisma.config.ts` — loads `.env.local` via dotenv, provides `DIRECT_URL` for migrations
- Ran `prisma migrate dev --name init` — migration `20260626141645_init` applied to Supabase
- Ran `prisma generate` — client types generated
- Created `src/lib/prisma.ts` — global PrismaClient singleton using `PrismaPg` adapter + `DATABASE_URL`
- Created `prisma/seed.ts` — seeds leader user, org, and member user
- Build passes cleanly

### Key files
- `prisma/schema.prisma` — full data model
- `prisma.config.ts` — Prisma 7 config (replaces `url`/`directUrl` in schema)
- `prisma/migrations/20260626141645_init/migration.sql` — initial DDL
- `src/lib/prisma.ts` — import this everywhere you need DB access
- `prisma/seed.ts` — run with `npx tsx prisma/seed.ts`

### Prisma 7 gotcha
Prisma 7 removed `url`/`directUrl` from `schema.prisma`. Connection config now lives in `prisma.config.ts`. The client requires an explicit adapter (`PrismaPg`) passed to `new PrismaClient({ adapter })`.

---

## Next: Phase 3 — Auth + Onboarding (Kinde)

### What the user needs to do first
1. Create a Kinde account at https://kinde.com
2. Create an application (type: Back-end web, framework: Next.js)
3. Set allowed callback URLs: `http://localhost:3000/api/auth/kinde_callback`
4. Set allowed logout URLs: `http://localhost:3000`
5. Add to `.env.local`:
   ```
   KINDE_CLIENT_ID="..."
   KINDE_CLIENT_SECRET="..."
   KINDE_ISSUER_URL="https://yourapp.kinde.com"
   KINDE_SITE_URL="http://localhost:3000"
   KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
   KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/dashboard"
   ```
6. Tell Claude "Phase 3 ready"

### What Claude will do in Phase 3
- Install `@kinde-oss/kinde-auth-nextjs`
- Create `src/app/api/auth/[kindeAuth]/route.ts` — Kinde catch-all route
- Create `src/lib/auth.ts` — `getUser()` / `requireUser()` server helpers
- Create `src/middleware.ts` — protect `(app)` routes
- Create onboarding page: first-login Org Leaders prompted to create their org (writes to DB)
- Sync Kinde user → `User` row on first login
