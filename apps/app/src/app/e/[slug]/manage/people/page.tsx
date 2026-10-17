import { db } from "@hackhost/db";
import { hackathonMemberships, user } from "@hackhost/db/schema";
import {
  Button,
  EmptyState,
  List,
  ListItem,
  PageHeader,
  Tag,
  statusTone,
} from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateMembershipStatus } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";
import { ExportCsvButton } from "@/components/export-csv-button";

export default async function ManagePeoplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();

  const rows = await db
    .select({
      membership: hackathonMemberships,
      user,
    })
    .from(hackathonMemberships)
    .innerJoin(user, eq(hackathonMemberships.userId, user.id))
    .where(eq(hackathonMemberships.hackathonId, event.id));

  return (
    <>
      <PageHeader
        title="People"
        description="Everyone registered for this event. Approve or reject pending registrations."
        actions={<ExportCsvButton slug={slug} />}
      />
      {rows.length === 0 ? (
        <EmptyState title="No registrations yet">
          People appear here as soon as they register.
        </EmptyState>
      ) : (
        <List>
          {rows.map(({ membership, user: u }) => (
            <ListItem
              key={membership.id}
              title={u.name}
              meta={`${u.email} · ${membership.role}`}
              className="flex-wrap"
              aside={
                <>
                  <Tag tone={statusTone(membership.status)}>
                    {membership.status}
                  </Tag>
                  {membership.status === "pending" ||
                  membership.status === "waitlisted" ? (
                    <>
                      <form
                        action={async () => {
                          "use server";
                          await updateMembershipStatus(
                            slug,
                            membership.id,
                            "active",
                          );
                        }}
                      >
                        <Button size="sm" type="submit">
                          Approve
                        </Button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await updateMembershipStatus(
                            slug,
                            membership.id,
                            "rejected",
                          );
                        }}
                      >
                        <Button size="sm" variant="secondary" type="submit">
                          Reject
                        </Button>
                      </form>
                    </>
                  ) : null}
                </>
              }
            />
          ))}
        </List>
      )}
    </>
  );
}
