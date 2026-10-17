import { db } from "@hackhost/db";
import { hackathonMemberships, submissions, teams } from "@hackhost/db/schema";
import { and, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Frame } from "@/components/marketing";
import { PageHeading } from "@/components/page-heading";
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

  const stats = [
    { label: "Participants", value: participants?.count ?? 0 },
    { label: "Pending", value: pending?.count ?? 0 },
    { label: "Teams", value: teamCount?.count ?? 0 },
    { label: "Submissions", value: subCount?.count ?? 0 },
  ];

  return (
    <>
      <PageHeading title="Overview">
        <p>
          Status: <strong>{hackathon.status}</strong> · Join: {hackathon.joinMode}
        </p>
      </PageHeading>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Frame className="mt-8">
        <ul className="divide-y divide-zinc-100 text-sm">
          <li>
            <Link
              href={`/e/${slug}/manage/page`}
              className="block px-4 py-3 text-zinc-900 hover:bg-zinc-50"
            >
              Edit marketing page
            </Link>
          </li>
          <li>
            <Link
              href={`/e/${slug}`}
              className="block px-4 py-3 text-zinc-900 hover:bg-zinc-50"
            >
              View public page
            </Link>
          </li>
          <li>
            <Link
              href={`/e/${slug}/manage/people`}
              className="block px-4 py-3 text-zinc-900 hover:bg-zinc-50"
            >
              Manage people
            </Link>
          </li>
        </ul>
      </Frame>
    </>
  );
}
