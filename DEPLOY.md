# Managed / self-host deploy

## Self-host

1. Provision Postgres 16+
2. Set env from `.env.example`:
   - `DATABASE_URL`, `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` → product app origin
   - `NEXT_PUBLIC_MARKETING_URL` → marketing site origin
3. `pnpm db:push && pnpm build`
4. Start both apps:
   - `pnpm --filter @hackhost/marketing start` (landing)
   - `pnpm --filter @hackhost/app start` (dashboard + API)
5. Optional: `GOOGLE_CLIENT_*`, `RESEND_API_KEY`

Docker Compose includes Postgres only; run the Next apps on the host or add your own services.

## Managed SaaS checklist

- Multi-tenant single product deployment (data scoped by `hackathon_id`)
- Platform admin at `/admin` (`user.is_platform_admin`)
- Rate limiting helper: `apps/app/src/lib/rate-limit.ts`
- Custom domains (Phase 4): map hostname → `hackathons.slug` (not implemented yet)
- Stripe (optional later): bill orgs for custom domains / capacity

## Abuse controls

- Organizer RBAC on all `/manage` mutations
- Rate limit keys by IP + route for public register / auth
- Admin can review events and users
