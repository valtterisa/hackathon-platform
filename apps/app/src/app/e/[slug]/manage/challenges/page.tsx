import { db } from "@hackhost/db";
import { challenges } from "@hackhost/db/schema";
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
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { createChallenge } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageChallengesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();
  const list = await db.query.challenges.findMany({
    where: eq(challenges.hackathonId, event.id),
  });
  const create = createChallenge.bind(null, slug);

  return (
    <>
      <PageHeader
        title="Challenges"
        description="Sponsor and track challenges participants can pick."
      />

      <Section title="Add a challenge">
        <Panel>
          <Form action={create}>
            <FieldRow>
              <Field label="Title" htmlFor="title">
                <Input id="title" name="title" required />
              </Field>
              <Field label="Sponsor" htmlFor="sponsorName">
                <Input id="sponsorName" name="sponsorName" />
              </Field>
            </FieldRow>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" />
            </Field>
            <Field label="Attachment URL" htmlFor="attachmentUrl">
              <Input id="attachmentUrl" name="attachmentUrl" />
            </Field>
            <div>
              <Button type="submit">Add challenge</Button>
            </div>
          </Form>
        </Panel>
      </Section>

      <Section title="All challenges">
        {list.length === 0 ? (
          <EmptyState title="No challenges yet">
            Add one above and it will appear on the participant challenges page.
          </EmptyState>
        ) : (
          <List>
            {list.map((ch) => (
              <ListItem key={ch.id} title={ch.title} meta={ch.sponsorName}>
                <span className="whitespace-pre-wrap">{ch.description}</span>
              </ListItem>
            ))}
          </List>
        )}
      </Section>
    </>
  );
}
