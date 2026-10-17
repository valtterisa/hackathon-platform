# Hackhost MCP

Hackhost exposes a **remote MCP server** so **any MCP-capable AI client** (Cursor, Claude, ChatGPT apps, custom agents, etc.) can create and manage hackathons — including **uploading cover images**.

The client LLM writes the copy. Tools only persist data.

## Architecture

```
Any MCP client
        │  OAuth 2.1 + PKCE (+ CIMD or DCR)
        ▼
Better Auth  (/api/auth/oauth2/*, /jwks, /.well-known/*)
        │  resource-bound access token (aud = MCP_RESOURCE_URL)
        ▼
POST /api/mcp   ← requireMcpAuth + MCP 2026-07-28 (stateless)
        │
        ├─ upload_image              → disk + /api/uploads/…
        ├─ create_hackathon          → Postgres
        ├─ update_hackathon / publish_hackathon
        └─ list_my_hackathons / get_hackathon
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

| Tool | Notes |
|------|-------|
| `upload_image` | Base64 / data-URL image → public `/api/uploads/...` URL; optional `slug` sets `coverUrl` |
| `create_hackathon` | Create draft with full marketing package; pass `coverUrl` from `upload_image` |
| `update_hackathon` | Organizer patch (including `coverUrl`) |
| `publish_hackathon` / `set_hackathon_status` | Lifecycle |
| `list_my_hackathons` | Active memberships for the token subject |
| `get_hackathon` | Full bundle; `requireOrganizer` optional |

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

## Suggested agent flow

1. Author title, tagline, description, tracks, prizes, schedule in the client  
2. `upload_image` with the cover bytes → get `url`  
3. `create_hackathon` with that `coverUrl` + the package  
4. `publish_hackathon` when ready  

## Auth notes

- `mcp()` **is** the OAuth provider — do not also register `oauthProvider()`.
- `jwt()` required for JWKS + resource-bound access tokens.
- MCP route exports **only `POST`** with `legacy: "reject"`.
