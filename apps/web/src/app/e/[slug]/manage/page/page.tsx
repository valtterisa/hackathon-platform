import { db } from "@hackhost/db";
import {
  hackathonPageBlocks,
  prizes,
  sponsors,
  tracks,
} from "@hackhost/db/schema";
import { Button, Label, Textarea } from "@hackhost/ui";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateMarketingPage } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();

  const [blocks, eventPrizes, eventSponsors, eventTracks] = await Promise.all([
    db.query.hackathonPageBlocks.findMany({
      where: eq(hackathonPageBlocks.hackathonId, event.id),
    }),
    db.query.prizes.findMany({
      where: eq(prizes.hackathonId, event.id),
      orderBy: [asc(prizes.sortOrder)],
    }),
    db.query.sponsors.findMany({
      where: eq(sponsors.hackathonId, event.id),
      orderBy: [asc(sponsors.sortOrder)],
    }),
    db.query.tracks.findMany({
      where: eq(tracks.hackathonId, event.id),
      orderBy: [asc(tracks.sortOrder)],
    }),
  ]);

  const highlights =
    (
      blocks.find((b) => b.type === "highlights")?.content as {
        items?: string[];
      }
    )?.items ?? [];
  const faq =
    (
      blocks.find((b) => b.type === "faq")?.content as {
        items?: { q: string; a: string }[];
      }
    )?.items ?? [];

  const save = updateMarketingPage.bind(null, slug);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Marketing page</h1>
      <p className="mt-1 text-[var(--muted-foreground)]">
        Public landing: /e/{slug}
      </p>
      <form action={save} className="mt-8 max-w-2xl space-y-4">
        <div>
          <Label htmlFor="highlights">Highlights (one per line)</Label>
          <Textarea
            id="highlights"
            name="highlights"
            defaultValue={highlights.join("\n")}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="tracks">Tracks (name|description per line)</Label>
          <Textarea
            id="tracks"
            name="tracks"
            defaultValue={eventTracks
              .map((t) => `${t.name}|${t.description ?? ""}`)
              .join("\n")}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="prizes">Prizes (title|value|description per line)</Label>
          <Textarea
            id="prizes"
            name="prizes"
            defaultValue={eventPrizes
              .map((p) => `${p.title}|${p.value ?? ""}|${p.description ?? ""}`)
              .join("\n")}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="sponsors">Sponsors (name|tier|url per line)</Label>
          <Textarea
            id="sponsors"
            name="sponsors"
            defaultValue={eventSponsors
              .map((s) => `${s.name}|${s.tier ?? ""}|${s.url ?? ""}`)
              .join("\n")}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="faq">FAQ (question|answer per line)</Label>
          <Textarea
            id="faq"
            name="faq"
            defaultValue={faq.map((f) => `${f.q}|${f.a}`).join("\n")}
            rows={5}
          />
        </div>
        <Button type="submit">Save marketing content</Button>
      </form>
    </div>
  );
}
