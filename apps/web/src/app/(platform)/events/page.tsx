import { db } from "@hackhost/db";
import { hackathons } from "@hackhost/db/schema";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const events = await db.query.hackathons.findMany({
    where: eq(hackathons.status, "published"),
    orderBy: [desc(hackathons.startsAt)],
  });
  const filtered = q
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(q.toLowerCase()) ||
          e.location?.toLowerCase().includes(q.toLowerCase()),
      )
    : events;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Looking for hackathons?
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Open an event page to register, then use participant login for that
            hackathon&apos;s dashboard.
          </p>
        </div>
        <Link href="/events/new">
          <Button>Create event</Button>
        </Link>
      </div>

      <form className="mt-6 max-w-md">
        <Input name="q" placeholder="Search by name or location…" defaultValue={q} />
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <Link key={event.id} href={`/e/${event.slug}`}>
            <Card className="h-full transition hover:border-[var(--primary)]">
              <div
                className="h-36 rounded-t-xl bg-cover bg-center"
                style={{
                  backgroundImage: event.coverUrl
                    ? `url(${event.coverUrl})`
                    : "linear-gradient(135deg,#0b6e4f,#1c2b22)",
                }}
              />
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {event.tagline}
                </p>
              </CardHeader>
              <CardContent className="text-sm text-[var(--muted-foreground)]">
                <p>{event.location ?? event.mode}</p>
                {event.startsAt ? (
                  <p>{event.startsAt.toLocaleDateString()}</p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No published events yet.</p>
        ) : null}
      </div>
    </div>
  );
}
