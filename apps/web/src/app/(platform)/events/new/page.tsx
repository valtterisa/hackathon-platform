import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { redirect } from "next/navigation";
import { Frame, Shell, ShellInner } from "@/components/marketing";
import { createHackathon } from "@/lib/actions/hackathons";
import { getSession } from "@/lib/session";

const selectClass =
  "flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 font-sans text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400";

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/events/new");

  return (
    <Shell>
      <ShellInner className="max-w-xl space-y-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create a hackathon
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            No approval gate. You become the organiser instantly.
          </p>
        </div>

        <Frame className="p-5">
          <form action={createHackathon} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Nordic Builders Hackathon"
              />
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
              <Input
                id="location"
                name="location"
                placeholder="Helsinki + Online"
              />
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
                  className={selectClass}
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
                  className={selectClass}
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
        </Frame>
      </ShellInner>
    </Shell>
  );
}
