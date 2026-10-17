import { db } from "@hackhost/db";
import { hackathonMemberships, submissions, teams } from "@hackhost/db/schema";
import { and, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) return null;

  const [participants] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hackathonMemberships)
    .where(
      and(
        eq(hackathonMemberships.hackathonId, hackathon.id),
        eq(hackathonMemberships.role, "participant"),
        eq(hackathonMemberships.status, "active"),
      ),
    );
  const [pending] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hackathonMemberships)
    .where(
      and(
        eq(hackathonMemberships.hackathonId, hackathon.id),
        eq(hackathonMemberships.status, "pending"),
      ),
    );
  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teams)
    .where(eq(teams.hackathonId, hackathon.id));
  const [subCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(submissions)
    .where(eq(submissions.hackathonId, hackathon.id));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Organizer overview</h1>
      <p className="mt-1 text-[var(--muted-foreground)]">
        Status: <strong>{hackathon.status}</strong> · Join: {hackathon.joinMode}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Participants", value: participants?.count ?? 0 },
          { label: "Pending", value: pending?.count ?? 0 },
          { label: "Teams", value: teamCount?.count ?? 0 },
          { label: "Submissions", value: subCount?.count ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            <p className="font-display text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href={`/e/${slug}/manage/page`} className="text-[var(--primary)] underline">
          Edit marketing page
        </Link>
        <Link href={`/e/${slug}`} className="text-[var(--primary)] underline">
          View public page
        </Link>
        <Link href={`/e/${slug}/manage/people`} className="text-[var(--primary)] underline">
          Manage people
        </Link>
      </div>
    </div>
  );
}
