import { db } from "@hackhost/db";
import { challenges } from "@hackhost/db/schema";
import { Button } from "@hackhost/ui";
import { eq } from "drizzle-orm";
import {
  assertCanAccessEventApp,
  selectChallenge,
} from "@/lib/actions/hackathons";

export default async function ChallengesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hackathon } = await assertCanAccessEventApp(slug);
  const list = await db.query.challenges.findMany({
    where: eq(challenges.hackathonId, hackathon.id),
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Challenges</h1>
      <ul className="mt-6 space-y-4">
        {list.map((ch) => (
          <li
            key={ch.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="font-medium">{ch.title}</p>
            {ch.sponsorName ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                by {ch.sponsorName}
              </p>
            ) : null}
            <p className="mt-2 text-sm whitespace-pre-wrap">{ch.description}</p>
            <form
              action={async () => {
                "use server";
                await selectChallenge(slug, ch.id);
              }}
              className="mt-3"
            >
              <Button type="submit" size="sm">
                Select for my team
              </Button>
            </form>
          </li>
        ))}
        {list.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">
            No challenges published yet.
          </p>
        ) : null}
      </ul>
    </div>
  );
}
