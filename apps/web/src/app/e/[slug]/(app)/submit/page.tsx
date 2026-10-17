import { db } from "@hackhost/db";
import { submissions, teamMembers, teams } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { and, eq } from "drizzle-orm";
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
    <div>
      <h1 className="font-display text-3xl font-semibold">Submit</h1>
      {!team ? (
        <p className="mt-4 text-[var(--muted-foreground)]">
          Create or join a team before submitting.
        </p>
      ) : (
        <form action={action} className="mt-8 max-w-lg space-y-3">
          <div>
            <Label htmlFor="title">Project title</Label>
            <Input id="title" name="title" defaultValue={existing?.title ?? ""} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={existing?.description ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="repoUrl">Repo URL</Label>
            <Input id="repoUrl" name="repoUrl" defaultValue={existing?.repoUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="demoUrl">Demo URL</Label>
            <Input id="demoUrl" name="demoUrl" defaultValue={existing?.demoUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input id="videoUrl" name="videoUrl" defaultValue={existing?.videoUrl ?? ""} />
          </div>
          <Button type="submit">{existing ? "Update submission" : "Submit"}</Button>
        </form>
      )}
    </div>
  );
}
