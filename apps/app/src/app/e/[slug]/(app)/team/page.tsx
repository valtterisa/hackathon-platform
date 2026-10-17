import { db } from "@hackhost/db";
import { teamMembers, teams, user } from "@hackhost/db/schema";
import {
  Button,
  EmptyState,
  Field,
  Form,
  Input,
  List,
  ListItem,
  Notice,
  PageHeader,
  Panel,
  Section,
  Textarea,
} from "@hackhost/ui";
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
    <>
      <PageHeader
        title="Team"
        description="Create a team or join via invite link."
      />

      {invite ? (
        <Notice className="mb-10">
          Invite link:{" "}
          <code className="break-all font-mono">{`/invites/${invite}`}</code>
        </Notice>
      ) : null}

      <Section title="Create team">
        <Panel>
          <Form action={create}>
            <Field label="Name" htmlFor="name">
              <Input id="name" name="name" required />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" />
            </Field>
            <Field label="Max members" htmlFor="maxMembers">
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                defaultValue={4}
                className="max-w-32"
              />
            </Field>
            <div>
              <Button type="submit">Create</Button>
            </div>
          </Form>
        </Panel>
      </Section>

      <Section title="Teams">
        {membersByTeam.length === 0 ? (
          <EmptyState title="No teams yet">
            Be the first to create one above.
          </EmptyState>
        ) : (
          <List>
            {membersByTeam.map(({ team, members }) => {
              const isMember = members.some(
                (m) => m.user.id === session.user.id,
              );
              return (
                <ListItem
                  key={team.id}
                  title={team.name}
                  meta={`${members.length}/${team.maxMembers} members`}
                  aside={
                    isMember ? (
                      <TeamInviteForm slug={slug} teamId={team.id} />
                    ) : null
                  }
                >
                  {team.description ? <p>{team.description}</p> : null}
                  {members.length > 0 ? (
                    <p className="text-sm text-muted">
                      {members.map((m) => m.user.name).join(", ")}
                    </p>
                  ) : null}
                </ListItem>
              );
            })}
          </List>
        )}
      </Section>
    </>
  );
}
