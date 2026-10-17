import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getHackathonBySlug, isActiveMember, isOrganizer } from "@/lib/rbac";
import { getSession } from "@/lib/session";

export default async function EventSignupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event || event.status === "draft") redirect("/events");

  const session = await getSession();
  if (session) {
    const member = await isActiveMember(event.id, session.user.id);
    const org = await isOrganizer(event.id, session.user.id);
    if (member || org) redirect(`/e/${slug}/home`);
    redirect(`/e/${slug}/register`);
  }

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
          Join {event.title}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          Create your account
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Then complete registration to unlock the participant dashboard.
        </p>

        <div className="mt-8">
          <AuthForm
            mode="signup"
            callbackUrl={`/e/${slug}/register`}
            loginHref={`/e/${slug}/login`}
            signupHref={`/e/${slug}/signup`}
          />
        </div>
      </div>
    </div>
  );
}
