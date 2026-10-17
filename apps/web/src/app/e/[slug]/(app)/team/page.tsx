import { db } from "@hackhost/db";
import { teamMembers, teams, user } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { assertCanAccessEventApp, createInvite, createTeam } from "@/lib/actions/hackathons";
import { TeamInviteForm } from "@/components/team-invite-form";

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { slug } = await params;
  const { invite } = await searchParams;
  const { hackathon, session } = await assertCanAccessEventApp(slug);

  const eventTeams = await db.query.teams.findMany({
    where: eq(teams.hackathonId, hackathon.id),
  });

  const membersByTeam = await Promise.all(
    eventTeams.map(async (team) => {
      const members = await db
        .select({
          role: teamMembers.role,
          user,
        })
        .from(teamMembers)
        .innerJoin(user, eq(teamMembers.userId, user.id))
        .where(eq(teamMembers.teamId, team.id));
      return { team, members };
    }),
  );

  const create = createTeam.bind(null, slug);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Team</h1>
      <p className="mt-1 text-[var(--muted-foreground)]">
        Create a team or join via invite link.
      </p>

      {invite ? (
        <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm">
          Invite link:{" "}
          <code className="break-all">
            {`/invites/${invite}`}
          </code>
        </p>
      ) : null}

      <form
        action={create}
        className="mt-8 max-w-md space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
      >
        <h2 className="font-medium">Create team</h2>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <div>
          <Label htmlFor="maxMembers">Max members</Label>
          <Input id="maxMembers" name="maxMembers" type="number" defaultValue={4} />
        </div>
        <Button type="submit">Create</Button>
      </form>

      <ul className="mt-10 space-y-4">
        {membersByTeam.map(({ team, members }) => {
          const isMember = members.some((m) => m.user.id === session.user.id);
          return (
            <li
              key={team.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {team.description}
                  </p>
                  <p className="mt-2 text-sm">
                    {members.map((m) => m.user.name).join(", ")} ({members.length}/
                    {team.maxMembers})
                  </p>
                </div>
                {isMember ? (
                  <TeamInviteForm slug={slug} teamId={team.id} />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
