import { db } from "@hackhost/db";
import { hackathons } from "@hackhost/db/schema";
import { Input } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { Frame, Shell, ShellInner } from "@/components/marketing";

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
    <Shell>
      <ShellInner className="space-y-8 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Events
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Published hackathons on hackhost
            </p>
          </div>
          <ButtonLink href="/events/new">Create event</ButtonLink>
        </div>

        <form className="max-w-md">
          <Input
            name="q"
            placeholder="Search name or location"
            defaultValue={q}
            aria-label="Search events"
          />
        </form>

        <Frame>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-zinc-500">No published events yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {filtered.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/e/${event.slug}`}
                    className="block cursor-pointer px-4 py-4 hover:bg-zinc-50 sm:flex sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <div>
                      <p className="font-semibold tracking-tight text-zinc-900">
                        {event.title}
                      </p>
                      {event.tagline ? (
                        <p className="mt-1 text-sm text-zinc-600">
                          {event.tagline}
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-2 shrink-0 text-sm text-zinc-500 sm:mt-0">
                      {event.location ?? event.mode}
                      {event.startsAt
                        ? ` · ${event.startsAt.toLocaleDateString()}`
                        : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Frame>
      </ShellInner>
    </Shell>
  );
}
