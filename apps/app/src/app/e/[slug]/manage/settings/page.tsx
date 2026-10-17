import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { updateHackathonSettings, addChannel } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";
import { db } from "@hackhost/db";
import { channels } from "@hackhost/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function ManageSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();
  const chans = await db.query.channels.findMany({
    where: eq(channels.hackathonId, event.id),
  });

  const save = updateHackathonSettings.bind(null, slug);
  const addCh = addChannel.bind(null, slug);

  function toLocal(d: Date | null) {
    if (!d) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <form action={save} className="mt-8 max-w-xl space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={event.title} />
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" defaultValue={event.tagline ?? ""} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={event.description ?? ""} />
        </div>
        <div>
          <Label htmlFor="coverUrl">Cover URL</Label>
          <Input id="coverUrl" name="coverUrl" defaultValue={event.coverUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={event.location ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startsAt">Starts</Label>
            <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocal(event.startsAt)} />
          </div>
          <div>
            <Label htmlFor="endsAt">Ends</Label>
            <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocal(event.endsAt)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="mode">Mode</Label>
            <select id="mode" name="mode" defaultValue={event.mode} className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
              <option value="in_person">In person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <Label htmlFor="joinMode">Join mode</Label>
            <select id="joinMode" name="joinMode" defaultValue={event.joinMode} className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
              <option value="open">Open</option>
              <option value="apply">Apply</option>
              <option value="invite_only">Invite only</option>
            </select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" defaultValue={event.status} className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" name="capacity" type="number" defaultValue={event.capacity ?? ""} />
        </div>
        <div>
          <Label htmlFor="codeOfConduct">Code of conduct</Label>
          <Textarea id="codeOfConduct" name="codeOfConduct" defaultValue={event.codeOfConduct ?? ""} />
        </div>
        <Button type="submit">Save settings</Button>
      </form>

      <section className="mt-12 max-w-xl">
        <h2 className="font-display text-xl font-semibold">Channels</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {chans.map((c) => (
            <li key={c.id}>
              {c.label}: {c.url}
            </li>
          ))}
        </ul>
        <form action={addCh} className="mt-4 space-y-2">
          <Input name="label" placeholder="Discord" required />
          <Input name="url" placeholder="https://discord.gg/…" required />
          <Button type="submit" size="sm" variant="soft">
            Add channel
          </Button>
        </form>
      </section>
    </div>
  );
}
