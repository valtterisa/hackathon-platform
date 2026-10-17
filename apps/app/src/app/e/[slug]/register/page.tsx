import { Button, Field, Form, Input, Notice, PageHeader } from "@hackhost/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { registerForHackathon } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";
import { getSession } from "@/lib/session";
import { marketingUrl } from "@/lib/urls";

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
    <div className="mx-auto min-h-screen w-full max-w-xl px-[var(--margin)] pb-20">
      <header className="flex h-16 items-center justify-between gap-4">
        <Link
          href={`/e/${slug}`}
          className="min-w-0 truncate text-base font-medium text-ink hover:underline"
        >
          ← {event.title}
        </Link>
        <a href={marketingUrl("/")} className="shrink-0 text-ink">
          <Wordmark />
        </a>
      </header>

      <PageHeader
        className="mt-12"
        title="Register"
        description={
          <span className="capitalize">
            Join mode: {event.joinMode}
            {event.capacity ? ` · capacity ${event.capacity}` : ""}
          </span>
        }
      />

      {status === "pending" ? (
        <Notice>Application submitted. Organisers will review it.</Notice>
      ) : null}
      {status === "waitlisted" ? (
        <Notice className="bg-warn">
          You are on the waitlist. We will notify you if a spot opens.
        </Notice>
      ) : null}

      {!status ? (
        <Form action={action}>
          <Field label="Display name" htmlFor="nickname">
            <Input
              id="nickname"
              name="nickname"
              defaultValue={session.user.name}
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            {event.joinMode === "apply"
              ? "Submit application"
              : "Complete registration"}
          </Button>
        </Form>
      ) : null}
    </div>
  );
}
