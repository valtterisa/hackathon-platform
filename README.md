# Hackhost

Open-source hackathon platform: market each event, register builders, run teams and submissions.

- **Self-host** with Docker Compose + Postgres
- **Managed-ready** same codebase (rate limits, platform admin)
- **Better Auth** (email/password + optional Google)
- **Per-event RBAC** (organizer / participant / judge / mentor)
- **Two apps** — marketing site + product dashboard

## Quick start

```bash
pnpm install
docker compose up -d
cp .env.example apps/app/.env.local
cp .env.example apps/marketing/.env.local
# set BETTER_AUTH_SECRET to a long random string
pnpm db:push
pnpm db:seed
pnpm dev
```

- Marketing: [http://localhost:3000](http://localhost:3000)
- App (dashboard): [http://localhost:3001](http://localhost:3001)

Demo user after seed: `demo@hackhost.local` / `demo-password-123`  
Demo event: [http://localhost:3001/e/nordic-builders](http://localhost:3001/e/nordic-builders)

## Monorepo

```
apps/marketing   Landing, FAQ, legal (port 3000)
apps/app         Product: auth, events, /e/[slug] workspaces (port 3001)
packages/db      Drizzle schema + client
packages/auth    Better Auth
packages/ui      Shared UI + CSS tokens
packages/config  Shared TypeScript config
```

## Key routes (app)

| Path | Purpose |
|------|---------|
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
