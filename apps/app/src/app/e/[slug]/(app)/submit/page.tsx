import { db } from "@hackhost/db";
import { submissions, teamMembers, teams } from "@hackhost/db/schema";
import {
  Button,
  EmptyState,
  Field,
  Form,
  Input,
  PageHeader,
  Tag,
  Textarea,
} from "@hackhost/ui";
import { and, eq } from "drizzle-orm";
import { ButtonLink } from "@/components/button-link";
import {
  assertCanAccessEventApp,
  upsertSubmission,
} from "@/lib/actions/hackathons";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hackathon, session } = await assertCanAccessEventApp(slug);

  const myTeams = await db
    .select({ team: teams })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.userId, session.user.id),
        eq(teams.hackathonId, hackathon.id),
      ),
    );
  const team = myTeams[0]?.team;
  const existing = team
    ? await db.query.submissions.findFirst({
        where: and(
          eq(submissions.hackathonId, hackathon.id),
          eq(submissions.teamId, team.id),
        ),
      })
    : null;

  const action = upsertSubmission.bind(null, slug);

  return (
    <>
      <PageHeader
        title="Submit"
        description={team ? `Submitting as ${team.name}` : undefined}
        actions={existing ? <Tag tone="ok">Submitted</Tag> : null}
      />
      {!team ? (
        <EmptyState
          title="You need a team first"
          action={<ButtonLink href={`/e/${slug}/team`}>Go to teams</ButtonLink>}
        >
          Create or join a team before submitting.
        </EmptyState>
      ) : (
        <Form action={action}>
          <Field label="Project title" htmlFor="title">
            <Input id="title" name="title" defaultValue={existing?.title ?? ""} required />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              defaultValue={existing?.description ?? ""}
            />
          </Field>
          <Field label="Repo URL" htmlFor="repoUrl">
            <Input id="repoUrl" name="repoUrl" defaultValue={existing?.repoUrl ?? ""} />
          </Field>
          <Field label="Demo URL" htmlFor="demoUrl">
            <Input id="demoUrl" name="demoUrl" defaultValue={existing?.demoUrl ?? ""} />
          </Field>
          <Field label="Video URL" htmlFor="videoUrl">
            <Input id="videoUrl" name="videoUrl" defaultValue={existing?.videoUrl ?? ""} />
          </Field>
          <div>
            <Button type="submit">{existing ? "Update submission" : "Submit"}</Button>
          </div>
        </Form>
      )}
    </>
  );
}
