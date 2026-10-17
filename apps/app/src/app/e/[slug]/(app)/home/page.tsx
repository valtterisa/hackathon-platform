import { db } from "@hackhost/db";
import { announcements, channels } from "@hackhost/db/schema";
import { List, ListItem, ListLink, PageHeader, Section } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import { ButtonLink } from "@/components/button-link";
import { assertCanAccessEventApp } from "@/lib/actions/hackathons";

export default async function EventHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hackathon, isOrganizer } = await assertCanAccessEventApp(slug);

  const [anns, chans] = await Promise.all([
    db.query.announcements.findMany({
      where: eq(announcements.hackathonId, hackathon.id),
      orderBy: [desc(announcements.createdAt)],
      limit: 5,
    }),
    db.query.channels.findMany({
      where: eq(channels.hackathonId, hackathon.id),
    }),
  ]);

  const links = [
    [`/e/${slug}/team`, "Find or create a team"],
    [`/e/${slug}/match`, "Match with teammates"],
    [`/e/${slug}/challenges`, "Pick a challenge"],
    [`/e/${slug}/submit`, "Submit your project"],
    [`/e/${slug}/schedule`, "View the schedule"],
  ] as const;

  return (
    <>
      <PageHeader
        title="Home"
        description={`Next steps for ${hackathon.title}`}
        actions={
          isOrganizer ? (
            <ButtonLink href={`/e/${slug}/manage`} variant="secondary">
              Organiser tools
            </ButtonLink>
          ) : null
        }
      />

      <Section>
        <List>
          {links.map(([href, label]) => (
            <ListLink key={href} href={href} title={label} />
          ))}
        </List>
      </Section>

      {anns.length > 0 ? (
        <Section title="Announcements">
          <List>
            {anns.map((a) => (
              <ListItem
                key={a.id}
                title={a.title}
                meta={a.createdAt.toLocaleDateString()}
              >
                {a.body}
              </ListItem>
            ))}
          </List>
        </Section>
      ) : null}

      {chans.length > 0 ? (
        <Section title="Channels">
          <List>
            {chans.map((c) => (
              <li key={c.id}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between py-4 font-medium underline-offset-4 hover:underline"
                >
                  {c.label}
                  <span aria-hidden className="text-muted">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </List>
        </Section>
      ) : null}
    </>
  );
}
