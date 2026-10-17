import { db } from "@hackhost/db";
import { submissions, teams } from "@hackhost/db/schema";
import {
  Button,
  EmptyState,
  Field,
  Form,
  Input,
  PageHeader,
  Panel,
  Textarea,
} from "@hackhost/ui";
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
    <>
      <PageHeader
        title="Judging"
        description="Score each submission from 0 to 100 and leave feedback for the team."
      />
      {rows.length === 0 ? (
        <EmptyState title="No submissions to judge">
          Submissions appear here once teams submit their projects.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-6">
          {rows.map(({ submission, team }) => (
            <li key={submission.id}>
              <Panel>
                <p className="font-medium text-ink">{submission.title}</p>
                <p className="text-sm text-muted">{team.name}</p>
                <Form
                  action={async (formData) => {
                    "use server";
                    await scoreSubmission(
                      slug,
                      submission.id,
                      Number(formData.get("score") ?? 0),
                      String(formData.get("feedback") ?? ""),
                    );
                  }}
                  className="mt-5"
                >
                  <Field
                    label="Score (0–100)"
                    htmlFor={`score-${submission.id}`}
                    className="max-w-40"
                  >
                    <Input
                      id={`score-${submission.id}`}
                      name="score"
                      type="number"
                      min={0}
                      max={100}
                      required
                    />
                  </Field>
                  <Field label="Feedback" htmlFor={`fb-${submission.id}`}>
                    <Textarea id={`fb-${submission.id}`} name="feedback" />
                  </Field>
                  <div>
                    <Button type="submit" size="sm">
                      Save score
                    </Button>
                  </div>
                </Form>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
