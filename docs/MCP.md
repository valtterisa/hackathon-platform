# Hackhost MCP

Hackhost exposes a **remote MCP server** so **any MCP-capable AI client** (Cursor, Claude, ChatGPT apps, custom agents, etc.) can run the full organizer and participant dashboard over OAuth — create events, upload images, manage people, teams, submissions, judging, invites, messaging, and profiles.

The client LLM writes the copy. Tools persist data with the same RBAC as the web dashboard.

## Architecture

Domain logic lives once in `apps/web/src/lib/services/*` (access, event-ops, hackathons).  
MCP tools and Next server actions are thin adapters over that layer.

```
Dashboard (server actions) ──┐
                             ├──► lib/services/* ──► Postgres
MCP client (OAuth tools) ────┘

Any MCP client
        │  OAuth 2.1 + PKCE (+ CIMD or DCR)
        ▼
Better Auth  (/api/auth/oauth2/*, /jwks, /.well-known/*)
        │  resource-bound access token (aud = MCP_RESOURCE_URL)
        ▼
POST /api/mcp   ← requireMcpAuth + MCP 2026-07-28 (stateless)
        │
        └─ same services as the web dashboard (organizer + participant)
```

## Env

```bash
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
MCP_RESOURCE_URL=http://localhost:3000/api/mcp
# Optional: where uploaded images are stored (default: apps/web/.data/uploads)
UPLOAD_DIR=
```

```bash
pnpm db:push
```

## Connect any MCP client

1. Sign up / sign in on Hackhost.
2. Point the client at: `https://your-host/api/mcp` (local: `http://localhost:3000/api/mcp`).
3. Client discovers:
   - `/.well-known/oauth-protected-resource/api/mcp`
   - `/.well-known/oauth-authorization-server/api/auth`
4. User completes `/login` → `/consent` (`hackhost` scope).
5. Client calls tools with the audience-bound bearer token.

### Cursor `mcp.json`

```json
{
  "mcpServers": {
    "hackhost": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

DCR is enabled for clients that still need it (`infer` application type). Prefer CIMD (`metadataProfile: "mcp-2026-07-28"`) when available.

## Tools

### Marketing & lifecycle

| Tool | Who | Notes |
|------|-----|-------|
| `upload_image` | auth | Base64 / data-URL → `/api/uploads/...`; optional `slug` sets `coverUrl` |
| `create_hackathon` | organizer | Draft + full marketing package |
| `update_hackathon` | organizer | Patch settings / marketing |
| `publish_hackathon` / `set_hackathon_status` | organizer | Lifecycle |
| `list_my_hackathons` | member | Active memberships |
| `get_hackathon` | public* | Full bundle; `requireOrganizer` optional |
| `list_published_events` | auth | Discovery / search |

### Organizer dashboard

| Tool | Notes |
|------|-------|
| `get_event_overview` | Counts + membership breakdown |
| `list_people` / `update_membership_status` / `export_people_csv` | Roster & applications |
| `list_channels` / `add_channel` | Community links |
| `list_announcements` / `create_announcement` | Broadcasts |
| `create_challenge` / `add_schedule_item` | Program |
| `create_invite` | `co_organizer` \| `judge` \| `mentor` \| `team` |
| `list_teams` / `list_submissions` | Ops views |
| `check_in_user` / `list_check_ins` | Day-of |
| `score_submission` / `list_judging_scores` | Judge or organizer |

### Participant dashboard

| Tool | Notes |
|------|-------|
| `register_for_event` | Open / apply modes |
| `accept_invite` | Join via invite token |
| `get_event_home` | Announcements, channels, my team |
| `create_team` | Become team leader |
| `upsert_match_profile` / `list_match_profiles` | Teammate matching |
| `select_challenge` | Pick a challenge for your team |
| `upsert_submission` | Project submit / update |
| `send_direct_message` / `list_conversations` / `get_conversation_messages` | DMs |
| `get_my_profile` / `update_my_profile` | Account profile |

RBAC matches the web app: organizer-only tools throw `FORBIDDEN: organizer required`; event tools require an active membership.

### Image upload

```json
{
  "dataBase64": "<raw base64 or data:image/png;base64,...>",
  "mimeType": "image/png",
  "filename": "cover.png",
  "slug": "optional-owned-event"
}
```

Allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif` (max 8MB).

## Suggested agent flows

**Organizer — launch an event**

1. Author title, tagline, description, tracks, prizes, schedule in the client  
2. `upload_image` → get `url`  
3. `create_hackathon` with that `coverUrl`  
4. `add_channel`, `create_announcement`, `create_challenge`, `add_schedule_item` as needed  
5. `create_invite` for judges / co-organizers  
6. `publish_hackathon` when ready  
7. During the event: `list_people`, `update_membership_status`, `check_in_user`, `list_submissions`, `score_submission`

**Participant — join and ship**

1. `list_published_events` → `register_for_event` (or `accept_invite`)  
2. `update_my_profile` / `upsert_match_profile` → `list_match_profiles`  
3. `create_team` or join via team invite  
4. `select_challenge` → `upsert_submission`  
5. `send_direct_message` for teammate coordination  

## Auth notes

- `mcp()` **is** the OAuth provider — do not also register `oauthProvider()`.
- `jwt()` required for JWKS + resource-bound access tokens.
- MCP route exports **only `POST`** with `legacy: "reject"`.
