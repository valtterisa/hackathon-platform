import { db } from "@hackhost/db";
import { hackathons } from "@hackhost/db/schema";
import { EmptyState, Input, List, ListLink, PageHeader } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import { ButtonLink } from "@/components/button-link";

const MODE_LABEL = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
} as const;

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
  const needle = q?.toLowerCase();
  const filtered = needle
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(needle) ||
          e.location?.toLowerCase().includes(needle),
      )
    : events;

  return (
    <>
      <PageHeader
        title="Events"
        description="Published hackathons you can register for."
        actions={<ButtonLink href="/events/new">Create event</ButtonLink>}
      />

      <form className="mb-8 max-w-md">
        <Input
          name="q"
          type="search"
          placeholder="Search by name or city"
          defaultValue={q}
          aria-label="Search events"
        />
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          title={q ? `Nothing matches “${q}”` : "No published events yet"}
          action={<ButtonLink href="/events/new">Create the first one</ButtonLink>}
        >
          Anyone signed in can publish a hackathon. No approval queue.
        </EmptyState>
      ) : (
        <List>
          {filtered.map((event) => (
            <ListLink
              key={event.id}
              href={`/e/${event.slug}`}
              title={event.title}
              meta={[
                event.location ?? MODE_LABEL[event.mode],
                event.startsAt?.toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              ]
                .filter(Boolean)
                .join(" · ")}
            >
              {event.tagline}
            </ListLink>
          ))}
        </List>
      )}
    </>
  );
}
