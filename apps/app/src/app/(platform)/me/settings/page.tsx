import { PageHeader, Panel } from "@hackhost/ui";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/me/settings");

  return (
    <>
      <PageHeader
        title="Account & security"
        description={`Signed in as ${session.user.email}.`}
      />
      <Panel className="max-w-xl text-muted">
        Password and linked accounts are managed via Better Auth. Google OAuth
        appears on login when configured.
      </Panel>
    </>
  );
}
