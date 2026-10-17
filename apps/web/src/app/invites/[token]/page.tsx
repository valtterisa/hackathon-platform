import { Button } from "@hackhost/ui";
import { redirect } from "next/navigation";
import { acceptInvite } from "@/lib/actions/hackathons";
import { getSession } from "@/lib/session";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/invites/${token}`);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-display text-3xl font-semibold">Accept invite</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        You were invited to join a hackathon role or team on Hackhost.
      </p>
      <form
        action={async () => {
          "use server";
          await acceptInvite(token);
        }}
        className="mt-6"
      >
        <Button type="submit" className="w-full">
          Accept
        </Button>
      </form>
    </div>
  );
}
