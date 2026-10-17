import { db } from "@hackhost/db";
import { announcements } from "@hackhost/db/schema";
import {
  Button,
  EmptyState,
  Field,
  Form,
  Input,
  List,
  ListItem,
  PageHeader,
  Panel,
  Section,
  Textarea,
} from "@hackhost/ui";
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
    <>
      <PageHeader
        title="Announcements"
        description="Updates posted to every participant's home page."
      />

      <Section title="New announcement">
        <Panel>
          <Form action={create}>
            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" required />
            </Field>
            <Field label="Body" htmlFor="body">
              <Textarea id="body" name="body" required />
            </Field>
            <div>
              <Button type="submit">Publish</Button>
            </div>
          </Form>
        </Panel>
      </Section>

      <Section title="Posted">
        {list.length === 0 ? (
          <EmptyState title="No announcements yet" />
        ) : (
          <List>
            {list.map((a) => (
              <ListItem
                key={a.id}
                title={a.title}
                meta={a.createdAt.toLocaleString()}
              >
                {a.body}
              </ListItem>
            ))}
          </List>
        )}
      </Section>
    </>
  );
}
