# Hackhost MCP + AI hackathon creation

Cutting-edge stack: **Better Auth MCP OAuth 2.1** (RFC 9728 / CIMD / optional DCR) + **MCP 2026-07-28** (stateless `POST` only) + **Next.js App Router** tools that create full hackathons with ChatGPT + images.

## Architecture

```
MCP client (ChatGPT / Cursor / Claude)
        │  OAuth 2.1 + PKCE (+ CIMD or DCR)
        ▼
Better Auth  (/api/auth/oauth2/*, /jwks, /.well-known/*)
        │  resource-bound access token (aud = MCP_RESOURCE_URL)
        ▼
POST /api/mcp   ← requireMcpAuth + @modelcontextprotocol/server
        │
        ├─ generate_hackathon_brief  → OpenAI chat
        ├─ generate_cover_image      → OpenAI images
        ├─ create_hackathon          → Postgres (Drizzle)
        ├─ update_hackathon / publish_hackathon
        └─ list_my_hackathons / get_hackathon
```

Same domain services also power cookie-session API routes:

| Route | Purpose |
|-------|---------|
| `POST /api/ai/hackathon/generate` | Draft brief JSON (session auth) |
| `POST /api/ai/hackathon/cover` | Cover image (session auth) |
| `POST /api/ai/hackathon/create` | Brief + optional cover + create draft |
| `POST /api/mcp` | OAuth-protected MCP tools |

## Env

```bash
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Defaults to ${BETTER_AUTH_URL}/api/mcp
MCP_RESOURCE_URL=http://localhost:3000/api/mcp
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1
OPENAI_IMAGE_MODEL=gpt-image-1
```

After pulling schema changes:

```bash
pnpm db:push
```

## Connect an MCP client

1. Sign up / sign in on Hackhost.
2. Point the client at the MCP resource: `http://localhost:3000/api/mcp` (or your prod URL).
3. Client discovers:
   - `/.well-known/oauth-protected-resource/api/mcp`
   - authorization server metadata under `/.well-known/oauth-authorization-server/api/auth`
4. User lands on `/login` then `/consent` (scopes include `hackhost`).
5. Client calls tools with the audience-bound bearer token.

### Cursor `mcp.json` sketch

```json
{
  "mcpServers": {
    "hackhost": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

Cursor/Claude that still use Dynamic Client Registration are supported (`allowDynamicClientRegistration` + `infer` application type). Prefer CIMD (`metadataProfile: "mcp-2026-07-28"`) when the client supports it.

## Tools

| Tool | Notes |
|------|-------|
| `generate_hackathon_brief` | ChatGPT package: copy, FAQ, tracks, prizes, schedule, cover prompt |
| `generate_cover_image` | Image model; optional `slug` to persist `coverUrl` |
| `create_hackathon` | Manual fields and/or `withAi: true` + `idea` (+ `generateCover`) |
| `update_hackathon` | Organizer-only marketing/settings patch |
| `publish_hackathon` / `set_hackathon_status` | Lifecycle |
| `list_my_hackathons` | Memberships for the token subject |
| `get_hackathon` | Full bundle; `requireOrganizer` optional |

## Auth notes (Better Auth docs)

- `mcp()` **is** the OAuth provider — do **not** also register `oauthProvider()`.
- `jwt()` is required for JWKS + resource-bound access tokens.
- Compose `cimd({ metadataProfile: "mcp-2026-07-28" })` for modern client identity.
- MCP route exports **only `POST`** with `legacy: "reject"` (2026-07-28 profile).
- Consent query params are verified with `verifyOAuthQueryParams` before rendering `/consent`.

## Suggested agent flow

1. `generate_hackathon_brief` with the organizer’s one-liner  
2. `generate_cover_image` with `coverPrompt`  
3. `create_hackathon` with the brief + `coverUrl`  
4. `publish_hackathon` when ready  
