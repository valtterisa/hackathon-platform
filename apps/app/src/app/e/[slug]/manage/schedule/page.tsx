import { db } from "@hackhost/db";
import { scheduleItems } from "@hackhost/db/schema";
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
  Textarea,
} from "@hackhost/ui";
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
    <>
      <PageHeader
        title="Schedule"
        description="Sessions, deadlines and meals shown on the participant schedule."
      />

      <Section title="Add an item">
        <Panel>
          <Form action={add}>
            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" required />
            </Field>
            <FieldRow>
              <Field label="Starts" htmlFor="startsAt">
                <Input id="startsAt" name="startsAt" type="datetime-local" required />
              </Field>
              <Field label="Ends" htmlFor="endsAt">
                <Input id="endsAt" name="endsAt" type="datetime-local" />
              </Field>
            </FieldRow>
            <Field label="Location" htmlFor="location">
              <Input id="location" name="location" />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" />
            </Field>
            <div>
              <Button type="submit">Add item</Button>
            </div>
          </Form>
        </Panel>
      </Section>

      <Section title="Timeline">
        {items.length === 0 ? (
          <EmptyState title="Nothing scheduled yet" />
        ) : (
          <List>
            {items.map((item) => (
              <ListItem
                key={item.id}
                title={item.title}
                meta={[item.startsAt.toLocaleString(), item.location]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </List>
        )}
      </Section>
    </>
  );
}
