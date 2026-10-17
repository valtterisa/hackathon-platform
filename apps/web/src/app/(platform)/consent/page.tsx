import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";
import { auth } from "@hackhost/auth";
import { redirect } from "next/navigation";
import { OAuthConsentForm } from "@/components/oauth-consent-form";
import { getSession } from "@/lib/session";

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const next = `/consent?${query.toString()}`;
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);

  const { secret } = await auth.$context;
  const valid = await verifyOAuthQueryParams(query.toString(), secret);
  if (!valid) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl font-semibold">Invalid consent</h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          This authorization request is expired or was tampered with. Restart
          the connect flow from your MCP client.
        </p>
      </div>
    );
  }

  const clientId = query.get("client_id") ?? "unknown-client";
  const scope = query.get("scope") ?? "openid profile email hackhost";
  const claims = query.get("claims");
  const clientName = query.get("client_name");

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl font-semibold">Authorize access</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        An MCP client wants to create and manage hackathons on your behalf.
      </p>
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <OAuthConsentForm
          clientId={clientId}
          clientName={clientName}
          scope={scope}
          claims={claims}
        />
      </div>
    </div>
  );
}
