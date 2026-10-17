import { db } from "@hackhost/db";
import { submissions, teams } from "@hackhost/db/schema";
import { EmptyState, List, ListItem, PageHeader } from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getHackathonBySlug } from "@/lib/rbac";

const linkClass = "font-medium text-ink underline underline-offset-4";

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
    <>
      <PageHeader
        title="Submissions"
        description="Projects submitted by teams for this event."
      />
      {rows.length === 0 ? (
        <EmptyState title="No submissions yet">
          Teams can submit their projects from the participant app.
        </EmptyState>
      ) : (
        <List>
          {rows.map(({ submission, team }) => (
            <ListItem
              key={submission.id}
              title={submission.title}
              meta={`Team: ${team.name}`}
            >
              <p>{submission.description}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {submission.repoUrl ? (
                  <a
                    href={submission.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    Repo
                  </a>
                ) : null}
                {submission.demoUrl ? (
                  <a
                    href={submission.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    Demo
                  </a>
                ) : null}
                {submission.videoUrl ? (
                  <a
                    href={submission.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    Video
                  </a>
                ) : null}
              </div>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
