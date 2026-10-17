import { Button, Input, Label } from "@hackhost/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Frame, Shell, ShellInner } from "@/components/marketing";
import { registerForHackathon } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";
import { getSession } from "@/lib/session";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/login?next=/e/${slug}/register`);

  const event = await getHackathonBySlug(slug);
  if (!event) redirect("/events");

  const action = registerForHackathon.bind(null, slug);

  return (
    <Shell className="min-h-screen">
      <header className="border-b border-zinc-100">
        <ShellInner className="flex h-12 items-center justify-between text-sm">
          <Link
            href={`/e/${slug}`}
            className="cursor-pointer font-semibold tracking-tight"
          >
            {event.title}
          </Link>
          <Link
            href="/"
            className="text-[var(--muted)] hover:text-[var(--ink)]"
          >
            hackhost
          </Link>
        </ShellInner>
      </header>

      <ShellInner className="mx-auto max-w-lg space-y-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Join mode: {event.joinMode}
            {event.capacity ? ` · capacity ${event.capacity}` : ""}
          </p>
        </div>

        {status === "pending" ? (
          <Frame className="p-4 text-sm">
            Application submitted. Organisers will review it.
          </Frame>
        ) : null}
        {status === "waitlisted" ? (
          <Frame className="p-4 text-sm">
            You are on the waitlist. We will notify you if a spot opens.
          </Frame>
        ) : null}

        {!status ? (
          <Frame className="p-5">
            <form action={action} className="space-y-4">
              <div>
                <Label htmlFor="nickname">Display name</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  defaultValue={session.user.name}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {event.joinMode === "apply"
                  ? "Submit application"
                  : "Complete registration"}
              </Button>
            </form>
          </Frame>
        ) : null}
      </ShellInner>
    </Shell>
  );
}
