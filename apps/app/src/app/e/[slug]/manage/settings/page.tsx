import {
  Button,
  EmptyState,
  Field,
  FieldRow,
  Form,
  Input,
  List,
  ListItem,
  PageHeader,
  Panel,
  Section,
  Select,
  Textarea,
} from "@hackhost/ui";
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
    <>
      <PageHeader
        title="Settings"
        description="Event details, dates, visibility and registration."
      />

      <Section title="Event details">
        <Panel>
          <Form action={save}>
            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" defaultValue={event.title} />
            </Field>
            <Field label="Tagline" htmlFor="tagline">
              <Input id="tagline" name="tagline" defaultValue={event.tagline ?? ""} />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                defaultValue={event.description ?? ""}
              />
            </Field>
            <Field label="Cover URL" htmlFor="coverUrl">
              <Input id="coverUrl" name="coverUrl" defaultValue={event.coverUrl ?? ""} />
            </Field>
            <Field label="Location" htmlFor="location">
              <Input id="location" name="location" defaultValue={event.location ?? ""} />
            </Field>
            <FieldRow>
              <Field label="Starts" htmlFor="startsAt">
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={toLocal(event.startsAt)}
                />
              </Field>
              <Field label="Ends" htmlFor="endsAt">
                <Input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={toLocal(event.endsAt)}
                />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Mode" htmlFor="mode">
                <Select id="mode" name="mode" defaultValue={event.mode}>
                  <option value="in_person">In person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </Field>
              <Field label="Join mode" htmlFor="joinMode">
                <Select id="joinMode" name="joinMode" defaultValue={event.joinMode}>
                  <option value="open">Open</option>
                  <option value="apply">Apply</option>
                  <option value="invite_only">Invite only</option>
                </Select>
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Status" htmlFor="status">
                <Select id="status" name="status" defaultValue={event.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
              <Field label="Capacity" htmlFor="capacity">
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  defaultValue={event.capacity ?? ""}
                />
              </Field>
            </FieldRow>
            <Field label="Code of conduct" htmlFor="codeOfConduct">
              <Textarea
                id="codeOfConduct"
                name="codeOfConduct"
                defaultValue={event.codeOfConduct ?? ""}
              />
            </Field>
            <div>
              <Button type="submit">Save settings</Button>
            </div>
          </Form>
        </Panel>
      </Section>

      <Section
        title="Channels"
        description="Links shown to participants, e.g. Discord or Slack."
      >
        {chans.length === 0 ? (
          <EmptyState title="No channels yet" />
        ) : (
          <List>
            {chans.map((c) => (
              <ListItem key={c.id} title={c.label} meta={c.url} />
            ))}
          </List>
        )}
        <Panel className="mt-6">
          <Form action={addCh}>
            <FieldRow>
              <Field label="Label" htmlFor="channel-label">
                <Input id="channel-label" name="label" placeholder="Discord" required />
              </Field>
              <Field label="URL" htmlFor="channel-url">
                <Input
                  id="channel-url"
                  name="url"
                  placeholder="https://discord.gg/…"
                  required
                />
              </Field>
            </FieldRow>
            <div>
              <Button type="submit">Add channel</Button>
            </div>
          </Form>
        </Panel>
      </Section>
    </>
  );
}
