import { auth } from "@hackhost/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * MCP plugin serves RFC 9728 metadata via auth `onRequest`.
 * Forward root well-known URLs so discovery works outside `/api/auth/*`.
 */
async function handle(request: Request) {
  const response = await auth.handler(request);
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function HEAD(request: Request) {
  return handle(request);
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
