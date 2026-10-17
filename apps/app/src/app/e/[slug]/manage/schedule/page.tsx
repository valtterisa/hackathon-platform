import { db } from "@hackhost/db";
import { scheduleItems } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { addScheduleItem } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageSchedulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();
  const items = await db.query.scheduleItems.findMany({
    where: eq(scheduleItems.hackathonId, event.id),
    orderBy: [asc(scheduleItems.startsAt)],
  });
  const add = addScheduleItem.bind(null, slug);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Schedule</h1>
      <form action={add} className="mt-6 max-w-lg space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="startsAt">Starts</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" required />
        </div>
        <div>
          <Label htmlFor="endsAt">Ends</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <Button type="submit">Add item</Button>
      </form>
      <ul className="mt-8 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="border-b border-[var(--border)] py-3 text-sm">
            <strong>{item.title}</strong> · {item.startsAt.toLocaleString()}
            {item.location ? ` · ${item.location}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
