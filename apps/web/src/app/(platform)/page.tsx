import { db } from "@hackhost/db";
import { hackathons } from "@hackhost/db/schema";
import { Button } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export default async function HomePage() {
  const events = await db.query.hackathons.findMany({
    where: eq(hackathons.status, "published"),
    orderBy: [desc(hackathons.startsAt)],
    limit: 6,
  });

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% -10%, #0b6e4f33, transparent), radial-gradient(ellipse 60% 50% at 90% 10%, #c45d2633, transparent), linear-gradient(180deg, #eef5f0 0%, #f4f7f5 40%, #f4f7f5 100%)",
        }}
      />
      <section className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-20">
        <p className="font-display text-5xl font-semibold tracking-tight text-[var(--primary)] sm:text-7xl">
          Hackhost
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-medium leading-tight text-[var(--foreground)] sm:text-4xl">
          Market your hackathon. Register builders. Run the weekend.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--muted-foreground)]">
          Open-source event OS with per-hackathon landing pages, clear sidebars,
          and organizer tools — self-host or use the managed cloud.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/events/new">
            <Button size="lg">Create a hackathon</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Organizer sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--card)]/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">
                Looking for hackathons?
              </h2>
              <p className="mt-2 max-w-xl text-[var(--muted-foreground)]">
                Browse open events, register on each hackathon&apos;s page, then
                log in for that event&apos;s participant dashboard.
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline">See all events</Button>
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/e/${event.slug}`}
                  className="block h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--primary)]"
                >
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{
                      backgroundImage: event.coverUrl
                        ? `url(${event.coverUrl})`
                        : "linear-gradient(135deg,#0b6e4f,#1c2b22)",
                    }}
                  />
                  <div className="p-4">
                    <p className="font-display text-lg font-semibold">
                      {event.title}
                    </p>
                    {event.tagline ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                        {event.tagline}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                      {event.location ?? event.mode}
                      {event.startsAt
                        ? ` · ${event.startsAt.toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {events.length === 0 ? (
            <p className="mt-8 text-[var(--muted-foreground)]">
              No published hackathons yet. Be the first to{" "}
              <Link href="/events/new" className="text-[var(--primary)] underline">
                create one
              </Link>
              .
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
