import { db } from "@hackhost/db";
import { announcements, channels } from "@hackhost/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Frame } from "@/components/marketing";
import { PageHeading } from "@/components/page-heading";
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
    [`/e/${slug}/schedule`, "View schedule"],
  ] as const;

  return (
    <>
      <PageHeading title="Home">
        <p>Next steps for {hackathon.title}</p>
      </PageHeading>

      <Frame>
        <ul className="divide-y divide-zinc-100">
          {links.map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                className="block cursor-pointer px-4 py-3 text-zinc-900 hover:bg-zinc-50"
              >
                {label}
              </Link>
            </li>
          ))}
          {isOrganizer ? (
            <li>
              <Link
                href={`/e/${slug}/manage`}
                className="block cursor-pointer bg-zinc-900 px-4 py-3 text-white hover:bg-zinc-700"
              >
                Open organiser tools
              </Link>
            </li>
          ) : null}
        </ul>
      </Frame>

      {chans.length > 0 ? (
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Channels
          </h2>
          <ul className="space-y-2 text-sm">
            {chans.map((c) => (
              <li key={c.id}>
                <a
                  href={c.url}
                  className="text-zinc-700 underline hover:text-zinc-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {anns.length > 0 ? (
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Announcements
          </h2>
          <Frame>
            <ul className="divide-y divide-zinc-100">
              {anns.map((a) => (
                <li key={a.id} className="px-4 py-4">
                  <p className="font-medium text-zinc-900">{a.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{a.body}</p>
                </li>
              ))}
            </ul>
          </Frame>
        </section>
      ) : null}
    </>
  );
}
