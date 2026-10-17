import { db } from "@hackhost/db";
import { scheduleItems } from "@hackhost/db/schema";
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
    <div>
      <h1 className="font-display text-3xl font-semibold">Schedule</h1>
      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-4 border-b border-[var(--border)] py-3"
          >
            <div className="w-40 shrink-0 text-sm text-[var(--muted-foreground)]">
              {item.startsAt.toLocaleString()}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {item.location}
                {item.description ? ` · ${item.description}` : ""}
              </p>
            </div>
          </li>
        ))}
        {items.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">Schedule coming soon.</p>
        ) : null}
      </ul>
    </div>
  );
}
