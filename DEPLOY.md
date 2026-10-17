# Managed / self-host deploy

## Self-host

1. Provision Postgres 16+
2. Set env from `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`)
3. `pnpm db:push && pnpm build && pnpm --filter @hackhost/web start`
4. Optional: `GOOGLE_CLIENT_*`, `RESEND_API_KEY`

Docker Compose includes Postgres only; run the Next app on the host or add your own web service.

## Managed SaaS checklist

- Multi-tenant single deployment (already: data scoped by `hackathon_id`)
- Platform admin at `/admin` (`user.is_platform_admin`)
- Rate limiting helper: `apps/web/src/lib/rate-limit.ts`
- Custom domains (Phase 4): map hostname → `hackathons.slug` (not implemented yet — stub for later)
- Stripe (optional later): bill orgs for custom domains / capacity

## Abuse controls

- Organizer RBAC on all `/manage` mutations
- Rate limit keys by IP + route for public register / auth
- Admin can review events and users
