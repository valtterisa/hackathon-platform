"use client";

import { Button } from "@hackhost/ui";
import { useMemo, useState, useTransition } from "react";

export function OAuthConsentForm({
  scope,
  claims,
  clientId,
  clientName,
}: {
  scope: string;
  claims: string | null;
  clientId: string;
  clientName?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scopes = useMemo(() => scope.split(/\s+/).filter(Boolean), [scope]);

  function decide(accept: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const requestedClaims = claims ? JSON.parse(claims) : undefined;
        const res = await fetch("/api/auth/oauth2/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            accept,
            scope,
            claims: requestedClaims,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          redirectURI?: string;
          url?: string;
          error?: string | { message?: string };
          message?: string;
        };
        if (!res.ok) {
          const message =
            typeof data.error === "string"
              ? data.error
              : data.error?.message || data.message || "Consent failed";
          setError(message);
          return;
        }
        const redirectTo = data.redirectURI ?? data.url;
        if (redirectTo) {
          window.location.href = redirectTo;
          return;
        }
        setError("Consent succeeded but no redirect was returned.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Consent failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--muted-foreground)]">Client</p>
        <p className="font-medium">{clientName || clientId}</p>
      </div>
      <div>
        <p className="text-sm text-[var(--muted-foreground)]">Requested access</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {scopes.map((item) => (
            <li key={item}>
              <code>{item}</code>
            </li>
          ))}
        </ul>
      </div>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1"
          disabled={pending}
          onClick={() => decide(true)}
        >
          Allow
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={pending}
          onClick={() => decide(false)}
        >
          Deny
        </Button>
      </div>
    </div>
  );
}
