import { Button, Input, Label } from "@hackhost/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="min-h-screen bg-[var(--background)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
        <Link href={`/e/${slug}`} className="font-display text-lg font-semibold">
          {event.title}
        </Link>
        <Link href="/" className="text-sm text-[var(--muted-foreground)]">
          Hackhost
        </Link>
      </header>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">Register</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Join mode: {event.joinMode}
          {event.capacity ? ` · capacity ${event.capacity}` : ""}
        </p>

        {status === "pending" ? (
          <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            Application submitted. Organizers will review it.
          </p>
        ) : null}
        {status === "waitlisted" ? (
          <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            You are on the waitlist. We will notify you if a spot opens.
          </p>
        ) : null}

        {!status ? (
          <form action={action} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="nickname">Display name</Label>
              <Input
                id="nickname"
                name="nickname"
                defaultValue={session.user.name}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              {event.joinMode === "apply" ? "Submit application" : "Complete registration"}
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
