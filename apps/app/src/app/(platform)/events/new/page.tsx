import {
  Button,
  Field,
  FieldRow,
  Form,
  Input,
  PageHeader,
  Section,
  Select,
  Textarea,
} from "@hackhost/ui";
import { redirect } from "next/navigation";
import { createHackathon } from "@/lib/actions/hackathons";
import { getSession } from "@/lib/session";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>;
}) {
  const { title } = await searchParams;
  const session = await getSession();
  if (!session) {
    const next = title ? `/events/new?title=${encodeURIComponent(title)}` : "/events/new";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <>
      <PageHeader
        title="Create a hackathon"
        description="No approval gate. You become the organiser instantly."
      />

      <Form action={createHackathon} className="gap-0">
        <Section title="Basics">
          <div className="flex flex-col gap-5">
            <Field label="Title" htmlFor="title">
              <Input
                id="title"
                name="title"
                required
                defaultValue={title?.slice(0, 120)}
                placeholder="Nordic Builders Hackathon"
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="slug"
              hint="Optional. Generated from the title if left blank."
            >
              <Input id="slug" name="slug" placeholder="nordic-builders" />
            </Field>
            <Field label="Tagline" htmlFor="tagline">
              <Input id="tagline" name="tagline" placeholder="48 hours to ship" />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" />
            </Field>
            <Field label="Cover image URL" htmlFor="coverUrl">
              <Input id="coverUrl" name="coverUrl" placeholder="https://…" />
            </Field>
          </div>
        </Section>

        <Section title="When & where">
          <div className="flex flex-col gap-5">
            <FieldRow>
              <Field label="Starts" htmlFor="startsAt">
                <Input id="startsAt" name="startsAt" type="datetime-local" />
              </Field>
              <Field label="Ends" htmlFor="endsAt">
                <Input id="endsAt" name="endsAt" type="datetime-local" />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Mode" htmlFor="mode">
                <Select id="mode" name="mode" defaultValue="hybrid">
                  <option value="in_person">In person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </Field>
              <Field label="Location" htmlFor="location">
                <Input
                  id="location"
                  name="location"
                  placeholder="Helsinki + Online"
                />
              </Field>
            </FieldRow>
          </div>
        </Section>

        <Section title="Registration">
          <FieldRow>
            <Field label="Join mode" htmlFor="joinMode">
              <Select id="joinMode" name="joinMode" defaultValue="open">
                <option value="open">Open</option>
                <option value="apply">Apply</option>
                <option value="invite_only">Invite only</option>
              </Select>
            </Field>
            <Field label="Capacity" htmlFor="capacity" hint="Optional">
              <Input id="capacity" name="capacity" type="number" min={1} />
            </Field>
          </FieldRow>
        </Section>

        <div className="mt-12">
          <Button type="submit" size="lg">
            Create & edit marketing page
          </Button>
        </div>
      </Form>
    </>
  );
}
