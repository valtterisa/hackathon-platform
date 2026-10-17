import { db } from "@hackhost/db";
import { checkIns, user } from "@hackhost/db/schema";
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
} from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { checkInUser } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageCheckInPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();

  const rows = await db
    .select({ checkIn: checkIns, user })
    .from(checkIns)
    .innerJoin(user, eq(checkIns.userId, user.id))
    .where(eq(checkIns.hackathonId, event.id))
    .orderBy(desc(checkIns.checkedInAt));

  return (
    <>
      <PageHeader
        title="Check-in"
        description="Enter a participant user id to check them in."
      />

      <Panel>
        <Form
          action={async (formData) => {
            "use server";
            await checkInUser(slug, String(formData.get("userId") ?? ""));
          }}
          className="sm:flex-row sm:items-end"
        >
          <Field label="User ID" htmlFor="userId" className="flex-1">
            <Input id="userId" name="userId" required placeholder="user_…" />
          </Field>
          <div>
            <Button type="submit">Check in</Button>
          </div>
        </Form>
      </Panel>

      <Section title={`Checked in (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState title="Nobody checked in yet" />
        ) : (
          <List>
            {rows.map(({ checkIn, user: u }) => (
              <ListItem
                key={checkIn.id}
                title={u.name}
                meta={checkIn.checkedInAt.toLocaleString()}
              />
            ))}
          </List>
        )}
      </Section>
    </>
  );
}
