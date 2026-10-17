"use client";

import { Button } from "@hackhost/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TeamInviteForm({
  slug,
  teamId,
}: {
  slug: string;
  teamId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      size="sm"
      variant="soft"
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const res = await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, type: "team", teamId }),
        });
        const data = (await res.json()) as { token?: string };
        if (data.token) {
          router.push(`/e/${slug}/team?invite=${data.token}`);
          router.refresh();
        }
        setLoading(false);
      }}
    >
      Create invite
    </Button>
  );
}
