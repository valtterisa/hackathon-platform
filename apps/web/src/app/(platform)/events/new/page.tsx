import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { redirect } from "next/navigation";
import { AiHackathonCreator } from "@/components/ai-hackathon-creator";
import { createHackathon } from "@/lib/actions/hackathons";
import { getSession } from "@/lib/session";

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/events/new");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Create a hackathon</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        No approval gate. You become the organizer instantly. Or connect an MCP
        client (ChatGPT / Cursor) to{" "}
        <code className="text-xs">/api/mcp</code>.
      </p>
      <div className="mt-8">
        <AiHackathonCreator />
      </div>
      <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        or fill manually
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <form action={createHackathon} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Nordic Builders Hackathon" />
        </div>
        <div>
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input id="slug" name="slug" placeholder="nordic-builders" />
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" placeholder="48 hours to ship" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Helsinki + Online" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startsAt">Starts</Label>
            <Input id="startsAt" name="startsAt" type="datetime-local" />
          </div>
          <div>
            <Label htmlFor="endsAt">Ends</Label>
            <Input id="endsAt" name="endsAt" type="datetime-local" />
          </div>
        </div>
        <div>
          <Label htmlFor="coverUrl">Cover image URL</Label>
          <Input id="coverUrl" name="coverUrl" placeholder="https://…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="mode">Mode</Label>
            <select
              id="mode"
              name="mode"
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
              defaultValue="hybrid"
            >
              <option value="in_person">In person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <Label htmlFor="joinMode">Join mode</Label>
            <select
              id="joinMode"
              name="joinMode"
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
              defaultValue="open"
            >
              <option value="open">Open</option>
              <option value="apply">Apply</option>
              <option value="invite_only">Invite only</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="capacity">Capacity (optional)</Label>
          <Input id="capacity" name="capacity" type="number" min={1} />
        </div>
        <Button type="submit" className="w-full">
          Create & edit marketing page
        </Button>
      </form>
    </div>
  );
}
