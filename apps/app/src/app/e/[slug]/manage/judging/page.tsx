import { db } from "@hackhost/db";
import { submissions, teams } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { scoreSubmission } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageJudgingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();

  const rows = await db
    .select({ submission: submissions, team: teams })
    .from(submissions)
    .innerJoin(teams, eq(submissions.teamId, teams.id))
    .where(eq(submissions.hackathonId, event.id));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Judging</h1>
      <ul className="mt-6 space-y-6">
        {rows.map(({ submission, team }) => (
          <li
            key={submission.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="font-medium">{submission.title}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{team.name}</p>
            <form
              action={async (formData) => {
                "use server";
                await scoreSubmission(
                  slug,
                  submission.id,
                  Number(formData.get("score") ?? 0),
                  String(formData.get("feedback") ?? ""),
                );
              }}
              className="mt-3 grid max-w-sm gap-2"
            >
              <div>
                <Label htmlFor={`score-${submission.id}`}>Score (0–100)</Label>
                <Input
                  id={`score-${submission.id}`}
                  name="score"
                  type="number"
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`fb-${submission.id}`}>Feedback</Label>
                <Textarea id={`fb-${submission.id}`} name="feedback" />
              </div>
              <Button type="submit" size="sm">
                Save score
              </Button>
            </form>
          </li>
        ))}
        {rows.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No submissions to judge.</p>
        ) : null}
      </ul>
    </div>
  );
}
