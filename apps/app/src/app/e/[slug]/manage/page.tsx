import { db } from "@hackhost/db";
import { hackathonMemberships, submissions, teams } from "@hackhost/db/schema";
import { and, eq, sql } from "drizzle-orm";
import {
  List,
  ListLink,
  PageHeader,
  Section,
  Stat,
  StatGrid,
  Tag,
  statusTone,
} from "@hackhost/ui";
import { ButtonLink } from "@/components/button-link";
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
      <PageHeader
        title="Overview"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Tag tone={statusTone(hackathon.status)}>{hackathon.status}</Tag>
            <Tag>Join: {hackathon.joinMode.replace("_", " ")}</Tag>
          </span>
        }
        actions={
          <>
            <ButtonLink href={`/e/${slug}`} variant="secondary">
              View public page
            </ButtonLink>
            <ButtonLink href={`/e/${slug}/manage/page`}>Edit page</ButtonLink>
          </>
        }
      />

      <StatGrid>
        {stats.map((stat) => (
          <Stat
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.label === "Pending" && stat.value > 0 ? "accent" : "plain"}
          />
        ))}
      </StatGrid>

      <Section title="Shortcuts">
        <List>
          <ListLink
            href={`/e/${slug}/manage/people`}
            title="Review registrations"
            meta={`${pending?.count ?? 0} pending`}
          />
          <ListLink href={`/e/${slug}/manage/teams`} title="Teams" />
          <ListLink href={`/e/${slug}/manage/submissions`} title="Submissions" />
          <ListLink
            href={`/e/${slug}/manage/announcements`}
            title="Post an announcement"
          />
        </List>
      </Section>
    </>
  );
}
