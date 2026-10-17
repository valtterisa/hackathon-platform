import { db } from "@hackhost/db";
import { challenges } from "@hackhost/db/schema";
import { Button, EmptyState, List, ListItem, PageHeader } from "@hackhost/ui";
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
    <>
      <PageHeader
        title="Challenges"
        description="Pick the challenge your team will build for."
      />
      {list.length === 0 ? (
        <EmptyState title="No challenges published yet">
          Check back once organisers publish the tracks.
        </EmptyState>
      ) : (
        <List>
          {list.map((ch) => (
            <ListItem
              key={ch.id}
              title={ch.title}
              meta={ch.sponsorName ? `by ${ch.sponsorName}` : undefined}
              aside={
                <form
                  action={async () => {
                    "use server";
                    await selectChallenge(slug, ch.id);
                  }}
                >
                  <Button type="submit" size="sm" variant="secondary">
                    Select for my team
                  </Button>
                </form>
              }
            >
              <p className="whitespace-pre-wrap">{ch.description}</p>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
