/**
 * Canonical MCP protected-resource identifier (RFC 8707 / RFC 9728).
 * Must match `mcp({ resource })` and `requireMcpAuth({ resource })`.
 */
export function getMcpResourceUrl() {
  const explicit = process.env.MCP_RESOURCE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const base =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/mcp`;
}

export const MCP_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "hackhost",
  "hackhost:ai",
] as const;

export type McpScope = (typeof MCP_SCOPES)[number];
