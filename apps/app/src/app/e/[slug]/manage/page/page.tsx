import { db } from "@hackhost/db";
import {
  hackathonPageBlocks,
  prizes,
  sponsors,
  tracks,
} from "@hackhost/db/schema";
import { Button, Field, Form, PageHeader, Panel, Textarea } from "@hackhost/ui";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
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
    <>
      <PageHeader
        title="Marketing page"
        description={`Public landing: /e/${slug}`}
        actions={
          <ButtonLink href={`/e/${slug}`} variant="secondary">
            View public page
          </ButtonLink>
        }
      />
      <Panel>
        <Form action={save} className="max-w-2xl">
          <Field label="Highlights" htmlFor="highlights" hint="One per line.">
            <Textarea
              id="highlights"
              name="highlights"
              defaultValue={highlights.join("\n")}
              rows={4}
            />
          </Field>
          <Field label="Tracks" htmlFor="tracks" hint="name|description per line.">
            <Textarea
              id="tracks"
              name="tracks"
              defaultValue={eventTracks
                .map((t) => `${t.name}|${t.description ?? ""}`)
                .join("\n")}
              rows={4}
            />
          </Field>
          <Field
            label="Prizes"
            htmlFor="prizes"
            hint="title|value|description per line."
          >
            <Textarea
              id="prizes"
              name="prizes"
              defaultValue={eventPrizes
                .map((p) => `${p.title}|${p.value ?? ""}|${p.description ?? ""}`)
                .join("\n")}
              rows={4}
            />
          </Field>
          <Field label="Sponsors" htmlFor="sponsors" hint="name|tier|url per line.">
            <Textarea
              id="sponsors"
              name="sponsors"
              defaultValue={eventSponsors
                .map((s) => `${s.name}|${s.tier ?? ""}|${s.url ?? ""}`)
                .join("\n")}
              rows={4}
            />
          </Field>
          <Field label="FAQ" htmlFor="faq" hint="question|answer per line.">
            <Textarea
              id="faq"
              name="faq"
              defaultValue={faq.map((f) => `${f.q}|${f.a}`).join("\n")}
              rows={5}
            />
          </Field>
          <div>
            <Button type="submit">Save marketing content</Button>
          </div>
        </Form>
      </Panel>
    </>
  );
}
