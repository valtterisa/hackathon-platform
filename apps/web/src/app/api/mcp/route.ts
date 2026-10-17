import { requireMcpAuth } from "@better-auth/mcp";
import { auth, getMcpResourceUrl } from "@hackhost/auth";
import { createHackhostMcpHandler } from "@/lib/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resource = getMcpResourceUrl();

function resolveUserId(claims: { sub?: unknown }) {
  const sub = typeof claims.sub === "string" ? claims.sub : null;
  if (!sub) throw new Error("Access token missing sub claim");
  return sub;
}

export const POST = requireMcpAuth(
  auth,
  async (request, claims) => {
    const userId = resolveUserId(claims);
    const handler = createHackhostMcpHandler(() => userId);
    return handler.fetch(request, {
      authInfo: {
        token:
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "",
        clientId:
          typeof claims.client_id === "string"
            ? claims.client_id
            : typeof claims.azp === "string"
              ? claims.azp
              : "mcp-client",
        scopes:
          typeof claims.scope === "string"
            ? claims.scope.split(/\s+/).filter(Boolean)
            : [],
        extra: { userId, claims },
      },
    });
  },
  {
    resource,
    requiredScopes: ["hackhost"],
    challengeScopes: [
      "openid",
      "profile",
      "email",
      "offline_access",
      "hackhost",
      "hackhost:ai",
    ],
  },
);
