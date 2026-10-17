import { Button } from "@hackhost/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getHackathonBySlug, isActiveMember, isOrganizer } from "@/lib/rbac";
import { getSession } from "@/lib/session";

export default async function EventLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { slug } = await params;
  const { next } = await searchParams;
  const event = await getHackathonBySlug(slug);
  if (!event || event.status === "draft") redirect("/events");

  const session = await getSession();
  if (session) {
    const member = await isActiveMember(event.id, session.user.id);
    const org = await isOrganizer(event.id, session.user.id);
    if (member || org) {
      redirect(next ?? `/e/${slug}/home`);
    }
    redirect(`/e/${slug}/register`);
  }

  const callbackUrl = next ?? `/e/${slug}/home`;

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

      <div className="mx-auto max-w-md px-4 py-12">
        <p className="text-sm uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
          Participant login
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          Sign in to {event.title}
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Only registered participants can open this event&apos;s dashboard.
        </p>

        <div className="mt-8">
          <AuthForm
            mode="login"
            callbackUrl={callbackUrl}
            loginHref={`/e/${slug}/login`}
            signupHref={`/e/${slug}/signup`}
          />
        </div>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
          <p className="text-[var(--muted-foreground)]">New here?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={`/e/${slug}/signup`}>
              <Button variant="outline" size="sm">
                Create account
              </Button>
            </Link>
            <Link href={`/e/${slug}`}>
              <Button variant="ghost" size="sm">
                Back to event page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
