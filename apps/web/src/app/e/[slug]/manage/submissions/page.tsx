import { db } from "@hackhost/db";
import { submissions, teams } from "@hackhost/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageSubmissionsPage({
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
      <h1 className="font-display text-3xl font-semibold">Submissions</h1>
      <ul className="mt-6 space-y-3">
        {rows.map(({ submission, team }) => (
          <li
            key={submission.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="font-medium">{submission.title}</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Team: {team.name}
            </p>
            <p className="mt-2 text-sm">{submission.description}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--primary)]">
              {submission.repoUrl ? (
                <a href={submission.repoUrl} target="_blank" rel="noreferrer">
                  Repo
                </a>
              ) : null}
              {submission.demoUrl ? (
                <a href={submission.demoUrl} target="_blank" rel="noreferrer">
                  Demo
                </a>
              ) : null}
              {submission.videoUrl ? (
                <a href={submission.videoUrl} target="_blank" rel="noreferrer">
                  Video
                </a>
              ) : null}
            </div>
          </li>
        ))}
        {rows.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No submissions yet.</p>
        ) : null}
      </ul>
    </div>
  );
}
