import { db } from "@hackhost/db";
import { challenges } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { createChallenge } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageChallengesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();
  const list = await db.query.challenges.findMany({
    where: eq(challenges.hackathonId, event.id),
  });
  const create = createChallenge.bind(null, slug);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Challenges</h1>
      <form action={create} className="mt-6 max-w-lg space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="sponsorName">Sponsor</Label>
          <Input id="sponsorName" name="sponsorName" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <div>
          <Label htmlFor="attachmentUrl">Attachment URL</Label>
          <Input id="attachmentUrl" name="attachmentUrl" />
        </div>
        <Button type="submit">Add challenge</Button>
      </form>
      <ul className="mt-8 space-y-3">
        {list.map((ch) => (
          <li key={ch.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="font-medium">{ch.title}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{ch.sponsorName}</p>
            <p className="mt-2 text-sm whitespace-pre-wrap">{ch.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
