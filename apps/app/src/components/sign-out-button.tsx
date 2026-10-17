"use client";

import { authClient } from "@hackhost/auth/client";
import { Button } from "@hackhost/ui";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      size="sm"
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
