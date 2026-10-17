import { db } from "@hackhost/db";
import { scheduleItems } from "@hackhost/db/schema";
import { EmptyState, List, ListItem, PageHeader } from "@hackhost/ui";
import { asc, eq } from "drizzle-orm";
import { assertCanAccessEventApp } from "@/lib/actions/hackathons";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hackathon } = await assertCanAccessEventApp(slug);
  const items = await db.query.scheduleItems.findMany({
    where: eq(scheduleItems.hackathonId, hackathon.id),
    orderBy: [asc(scheduleItems.startsAt)],
  });

  return (
    <>
      <PageHeader title="Schedule" description={hackathon.title} />
      {items.length === 0 ? (
        <EmptyState title="Schedule coming soon">
          Organisers haven&apos;t published the timetable yet.
        </EmptyState>
      ) : (
        <List>
          {items.map((item) => (
            <ListItem
              key={item.id}
              title={item.title}
              meta={[
                item.startsAt.toLocaleString(undefined, {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                item.location,
              ]
                .filter(Boolean)
                .join(" · ")}
            >
              {item.description}
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
