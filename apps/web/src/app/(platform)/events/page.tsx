import { db } from "@hackhost/db";
import { hackathons } from "@hackhost/db/schema";
import { Button, Display, Input } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Band, BandInner } from "@/components/marketing";

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
    <Band field="bg" className="min-h-[80vh] py-12">
      <BandInner className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Display as="h1" className="text-[clamp(2.5rem,8vw,6rem)]">
            Events
          </Display>
          <Link href="/events/new">
            <Button>Create event</Button>
          </Link>
        </div>

        <form className="max-w-md">
          <Input
            name="q"
            placeholder="Search name or location"
            defaultValue={q}
          />
        </form>

        <ul className="divide-y-0">
          {filtered.map((event) => (
            <li key={event.id}>
              <Link
                href={`/e/${event.slug}`}
                className="grid gap-2 py-8 transition hover:bg-[var(--surface)] md:grid-cols-[1fr_auto] md:items-end md:px-4"
              >
                <div>
                  <p className="font-display text-[clamp(1.75rem,4vw,3rem)] uppercase leading-[0.9]">
                    {event.title}
                  </p>
                  {event.tagline ? (
                    <p className="mt-2 max-w-[50ch] text-[var(--step-body)]">
                      {event.tagline}
                    </p>
                  ) : null}
                </div>
                <p className="text-[var(--step-body)] text-[var(--muted)]">
                  {event.location ?? event.mode}
                  {event.startsAt
                    ? ` · ${event.startsAt.toLocaleDateString()}`
                    : ""}
                </p>
              </Link>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="py-10 text-[var(--muted)]">No published events yet.</li>
          ) : null}
        </ul>
      </BandInner>
    </Band>
  );
}
