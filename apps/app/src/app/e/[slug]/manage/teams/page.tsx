import { db } from "@hackhost/db";
import { teamMembers, teams, user } from "@hackhost/db/schema";
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
    <div>
      <h1 className="font-display text-3xl font-semibold">Teams</h1>
      <ul className="mt-6 space-y-3">
        {await Promise.all(
          eventTeams.map(async (team) => {
            const members = await db
              .select({ name: user.name, role: teamMembers.role })
              .from(teamMembers)
              .innerJoin(user, eq(teamMembers.userId, user.id))
              .where(eq(teamMembers.teamId, team.id));
            return (
              <li
                key={team.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {members.map((m) => `${m.name} (${m.role})`).join(", ")}
                </p>
              </li>
            );
          }),
        )}
      </ul>
    </div>
  );
}
