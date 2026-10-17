# Hackhost

Open-source hackathon platform: market each event, register builders, run teams and submissions.

- **Self-host** with Docker Compose + Postgres
- **Managed-ready** same codebase (rate limits, platform admin)
- **Better Auth** (email/password + optional Google)
- **Per-event RBAC** (organizer / participant / judge / mentor)
- **No `/dashboard`** — event apps live under `/e/[slug]/…`

## Quick start

```bash
pnpm install
docker compose up -d
cp .env.example apps/web/.env.local   # or edit the seeded .env.local
# set BETTER_AUTH_SECRET to a long random string
pnpm db:push
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo user after seed: `demo@hackhost.local` / `demo-password-123`  
Demo event: `/e/nordic-builders`

## Monorepo

```
apps/web          Next.js App Router
packages/db       Drizzle schema + client
packages/auth     Better Auth
packages/ui       Shared UI + CSS tokens
packages/config   Shared TypeScript config
```

## Key routes

| Path | Purpose |
|------|---------|
| `/` | Platform marketing |
| `/events` | Discovery |
| `/events/new` | Create hackathon (any signed-in user) |
| `/e/[slug]` | Event marketing landing + register CTA |
| `/e/[slug]/register` | Registration |
| `/e/[slug]/home` | Participant sidebar app |
| `/e/[slug]/manage` | Organizer sidebar app |
| `/invites/[token]` | Co-organizer / team / judge / mentor invites |
| `/admin` | Platform admin (flag on user) |

## License

Apache-2.0
