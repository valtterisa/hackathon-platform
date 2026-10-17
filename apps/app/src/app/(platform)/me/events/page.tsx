import { db } from "@hackhost/db";
import { hackathonMemberships, hackathons } from "@hackhost/db/schema";
import {
  EmptyState,
  List,
  ListLink,
  PageHeader,
  Tag,
  statusTone,
} from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { getSession } from "@/lib/session";

export default async function MyEventsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/me/events");

  const rows = await db
    .select({
      role: hackathonMemberships.role,
      status: hackathonMemberships.status,
      hackathon: hackathons,
    })
    .from(hackathonMemberships)
    .innerJoin(hackathons, eq(hackathonMemberships.hackathonId, hackathons.id))
    .where(eq(hackathonMemberships.userId, session.user.id));

  return (
    <>
      <PageHeader
        title="My events"
        description="Hackathons you organise or take part in."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No events yet"
          action={<ButtonLink href="/events">Browse events</ButtonLink>}
        >
          Register for a hackathon or create your own.
        </EmptyState>
      ) : (
        <List>
          {rows.map((row) => (
            <ListLink
              key={`${row.hackathon.id}-${row.role}`}
              href={
                row.role === "organizer"
                  ? `/e/${row.hackathon.slug}/manage`
                  : `/e/${row.hackathon.slug}/home`
              }
              title={row.hackathon.title}
              aside={
                <>
                  <Tag tone={row.role === "organizer" ? "ink" : "neutral"}>
                    {row.role}
                  </Tag>
                  <Tag tone={statusTone(row.status)}>
                    {row.status.replace("_", " ")}
                  </Tag>
                </>
              }
            />
          ))}
        </List>
      )}
    </>
  );
}
