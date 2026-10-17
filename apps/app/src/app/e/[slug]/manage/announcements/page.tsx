import { db } from "@hackhost/db";
import { announcements } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { createAnnouncement } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageAnnouncementsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();
  const list = await db.query.announcements.findMany({
    where: eq(announcements.hackathonId, event.id),
    orderBy: [desc(announcements.createdAt)],
  });
  const create = createAnnouncement.bind(null, slug);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Announcements</h1>
      <form action={create} className="mt-6 max-w-lg space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="body">Body</Label>
          <Textarea id="body" name="body" required />
        </div>
        <Button type="submit">Publish</Button>
      </form>
      <ul className="mt-8 space-y-3">
        {list.map((a) => (
          <li key={a.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="font-medium">{a.title}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{a.body}</p>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {a.createdAt.toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
