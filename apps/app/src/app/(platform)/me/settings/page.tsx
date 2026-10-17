import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/me/settings");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Account & security</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Signed in as {session.user.email}. Password and linked accounts are managed
        via Better Auth. Google OAuth appears on login when configured.
      </p>
    </div>
  );
}
