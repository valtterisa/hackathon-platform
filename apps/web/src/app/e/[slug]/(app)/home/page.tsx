import { db } from "@hackhost/db";
import { announcements, channels } from "@hackhost/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { assertCanAccessEventApp } from "@/lib/actions/hackathons";

export default async function EventHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hackathon, isOrganizer } = await assertCanAccessEventApp(slug);

  const [anns, chans] = await Promise.all([
    db.query.announcements.findMany({
      where: eq(announcements.hackathonId, hackathon.id),
      orderBy: [desc(announcements.createdAt)],
      limit: 5,
    }),
    db.query.channels.findMany({
      where: eq(channels.hackathonId, hackathon.id),
    }),
  ]);

  const links = [
    [`/e/${slug}/team`, "Find or create a team"],
    [`/e/${slug}/match`, "Match with teammates"],
    [`/e/${slug}/challenges`, "Pick a challenge"],
    [`/e/${slug}/submit`, "Submit your project"],
    [`/e/${slug}/schedule`, "View schedule"],
  ] as const;

  return (
    <>
      <PageHeading>
        <PageHeading.Title>Home</PageHeading.Title>
        <PageHeading.Sub>Next steps for {hackathon.title}</PageHeading.Sub>
      </PageHeading>

      <div className="grid gap-2 sm:grid-cols-2">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="bg-[var(--surface)] px-4 py-3 hover:bg-[var(--field-1)]"
          >
            {label}
          </Link>
        ))}
        {isOrganizer ? (
          <Link
            href={`/e/${slug}/manage`}
            className="bg-[var(--accent)] px-4 py-3 text-[var(--accent-ink)]"
          >
            Open organizer tools
          </Link>
        ) : null}
      </div>

      {chans.length > 0 ? (
        <section className="mt-10 space-y-3">
          <h2 className="font-display text-xl uppercase">Channels</h2>
          <ul className="space-y-2">
            {chans.map((c) => (
              <li key={c.id}>
                <a
                  href={c.url}
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {anns.length > 0 ? (
        <section className="mt-10 space-y-3">
          <h2 className="font-display text-xl uppercase">Announcements</h2>
          <ul className="space-y-3">
            {anns.map((a) => (
              <li key={a.id} className="bg-[var(--surface)] p-4">
                <p className="font-medium">{a.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{a.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
