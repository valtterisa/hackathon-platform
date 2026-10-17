import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { auth } from "@hackhost/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = oauthProviderAuthServerMetadata(auth, {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
});

export async function GET(request: Request) {
  return handler(request);
}

export async function HEAD(request: Request) {
  return handler(request);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
