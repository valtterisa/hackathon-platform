import { Button, PageHeader } from "@hackhost/ui";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { acceptInvite } from "@/lib/actions/hackathons";
import { getSession } from "@/lib/session";
import { marketingUrl } from "@/lib/urls";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/invites/${token}`);

  return (
    <div className="mx-auto min-h-screen w-full max-w-xl px-[var(--margin)] pb-20">
      <header className="flex h-16 items-center">
        <a href={marketingUrl("/")} className="text-ink">
          <Wordmark />
        </a>
      </header>
      <PageHeader
        className="mt-16"
        title="Accept invite"
        description="You were invited to join a hackathon role or team on Hackhost."
      />
      <form
        action={async () => {
          "use server";
          await acceptInvite(token);
        }}
      >
        <Button type="submit" size="lg" className="w-full">
          Accept invite
        </Button>
      </form>
    </div>
  );
}
