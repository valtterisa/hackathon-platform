import { db } from "@hackhost/db";
import { announcements, channels } from "@hackhost/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
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

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Home</h1>
      <p className="mt-1 text-[var(--muted-foreground)]">
        Your next steps for {hackathon.title}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          { href: `/e/${slug}/team`, label: "Find or create a team" },
          { href: `/e/${slug}/match`, label: "Match with teammates" },
          { href: `/e/${slug}/challenges`, label: "Pick a challenge" },
          { href: `/e/${slug}/submit`, label: "Submit your project" },
          { href: `/e/${slug}/schedule`, label: "View schedule" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 hover:border-[var(--primary)]"
          >
            {item.label}
          </Link>
        ))}
        {isOrganizer ? (
          <Link
            href={`/e/${slug}/manage`}
            className="rounded-xl border border-[var(--primary)] bg-[var(--card)] px-4 py-3 text-[var(--primary)]"
          >
            Open organizer tools
          </Link>
        ) : null}
      </div>

      {chans.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Channels</h2>
          <ul className="mt-3 space-y-2">
            {chans.map((c) => (
              <li key={c.id}>
                <a
                  href={c.url}
                  className="text-[var(--primary)] underline"
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
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Announcements</h2>
          <ul className="mt-3 space-y-3">
            {anns.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="font-medium">{a.title}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
