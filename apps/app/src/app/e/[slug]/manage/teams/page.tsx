import { db } from "@hackhost/db";
import { teamMembers, teams, user } from "@hackhost/db/schema";
import { EmptyState, List, ListItem, PageHeader } from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageTeamsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();

  const eventTeams = await db.query.teams.findMany({
    where: eq(teams.hackathonId, event.id),
  });

  return (
    <>
      <PageHeader
        title="Teams"
        description={`${eventTeams.length} ${eventTeams.length === 1 ? "team" : "teams"} formed so far.`}
      />
      {eventTeams.length === 0 ? (
        <EmptyState title="No teams yet">
          Teams show up here once participants create them.
        </EmptyState>
      ) : (
        <List>
          {await Promise.all(
            eventTeams.map(async (team) => {
              const members = await db
                .select({ name: user.name, role: teamMembers.role })
                .from(teamMembers)
                .innerJoin(user, eq(teamMembers.userId, user.id))
                .where(eq(teamMembers.teamId, team.id));
              return (
                <ListItem
                  key={team.id}
                  title={team.name}
                  meta={`${members.length} ${members.length === 1 ? "member" : "members"}`}
                >
                  {members.map((m) => `${m.name} (${m.role})`).join(", ")}
                </ListItem>
              );
            }),
          )}
        </List>
      )}
    </>
  );
}
