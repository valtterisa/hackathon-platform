import { db } from "@hackhost/db";
import {
  challenges,
  hackathonMemberships,
  hackathonPageBlocks,
  hackathons,
  prizes,
  scheduleItems,
  sponsors,
  tracks,
} from "@hackhost/db/schema";
import { and, eq } from "drizzle-orm";
import { createId, slugify } from "@/lib/ids";

export type EventMode = "in_person" | "online" | "hybrid";
export type JoinMode = "open" | "apply" | "invite_only";
export type HackathonStatus = "draft" | "published" | "archived";

export type CreateHackathonInput = {
  title: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  mode?: EventMode;
  joinMode?: JoinMode;
  capacity?: number | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  status?: HackathonStatus;
  codeOfConduct?: string | null;
  highlights?: string[];
  faq?: Array<{ q: string; a: string }>;
  prizes?: Array<{ title: string; value?: string | null; description?: string | null }>;
  sponsors?: Array<{
    name: string;
    tier?: string | null;
    url?: string | null;
    logoUrl?: string | null;
  }>;
  tracks?: Array<{ name: string; description?: string | null }>;
  challenges?: Array<{
    title: string;
    description?: string | null;
    sponsorName?: string | null;
  }>;
  schedule?: Array<{
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: string | Date;
    endsAt?: string | Date | null;
  }>;
};

function toDate(value: string | Date | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

async function uniqueSlug(preferred: string) {
  let slug = slugify(preferred);
  if (!slug) slug = createId("event");
  const existing = await db.query.hackathons.findFirst({
    where: eq(hackathons.slug, slug),
  });
  if (!existing) return slug;
  return `${slug}-${createId("x").slice(-4)}`;
}

export async function createHackathonForUser(
  userId: string,
  input: CreateHackathonInput,
) {
  const title = input.title.trim();
  if (!title) throw new Error("Title required");

  const slug = await uniqueSlug(input.slug?.trim() || title);
  const id = createId("hack");

  await db.insert(hackathons).values({
    id,
    slug,
    title,
    tagline: input.tagline?.trim() || null,
    description: input.description?.trim() || null,
    coverUrl: input.coverUrl?.trim() || null,
    location: input.location?.trim() || null,
    mode: input.mode ?? "hybrid",
    joinMode: input.joinMode ?? "open",
    capacity: input.capacity ?? null,
    startsAt: toDate(input.startsAt),
    endsAt: toDate(input.endsAt),
    status: input.status ?? "draft",
    codeOfConduct: input.codeOfConduct?.trim() || null,
    createdBy: userId,
  });

  await db.insert(hackathonMemberships).values({
    id: createId("mem"),
    hackathonId: id,
    userId,
    role: "organizer",
    status: "active",
  });

  const highlights =
    input.highlights?.filter(Boolean) ??
    ["Build with friends", "Ship in a weekend"];
  const faq =
    input.faq?.filter((item) => item.q && item.a) ??
    [{ q: "Who can join?", a: "Anyone who wants to build." }];

  await db.insert(hackathonPageBlocks).values([
    {
      id: createId("blk"),
      hackathonId: id,
      type: "highlights",
      sortOrder: 0,
      content: { items: highlights },
    },
    {
      id: createId("blk"),
      hackathonId: id,
      type: "faq",
      sortOrder: 1,
      content: { items: faq },
    },
  ]);

  if (input.prizes?.length) {
    await db.insert(prizes).values(
      input.prizes.map((prize, i) => ({
        id: createId("prz"),
        hackathonId: id,
        title: prize.title,
        value: prize.value ?? null,
        description: prize.description ?? null,
        sortOrder: i,
      })),
    );
  }

  if (input.sponsors?.length) {
    await db.insert(sponsors).values(
      input.sponsors.map((sponsor, i) => ({
        id: createId("spn"),
        hackathonId: id,
        name: sponsor.name,
        tier: sponsor.tier ?? "partner",
        url: sponsor.url ?? null,
        logoUrl: sponsor.logoUrl ?? null,
        sortOrder: i,
      })),
    );
  }

  if (input.tracks?.length) {
    await db.insert(tracks).values(
      input.tracks.map((track, i) => ({
        id: createId("trk"),
        hackathonId: id,
        name: track.name,
        description: track.description ?? null,
        sortOrder: i,
      })),
    );
  }

  if (input.challenges?.length) {
    await db.insert(challenges).values(
      input.challenges.map((challenge, i) => ({
        id: createId("ch"),
        hackathonId: id,
        title: challenge.title,
        description: challenge.description ?? null,
        sponsorName: challenge.sponsorName ?? null,
        sortOrder: i,
      })),
    );
  }

  if (input.schedule?.length) {
    await db.insert(scheduleItems).values(
      input.schedule.map((item, i) => ({
        id: createId("sch"),
        hackathonId: id,
        title: item.title,
        description: item.description ?? null,
        location: item.location ?? null,
        startsAt: toDate(item.startsAt)!,
        endsAt: toDate(item.endsAt),
        sortOrder: i,
      })),
    );
  }

  return { id, slug, title, status: input.status ?? "draft" };
}

export async function requireOrganizerAccess(
  hackathonId: string,
  userId: string,
) {
  const membership = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathonId),
      eq(hackathonMemberships.userId, userId),
      eq(hackathonMemberships.role, "organizer"),
      eq(hackathonMemberships.status, "active"),
    ),
  });
  if (!membership) throw new Error("FORBIDDEN");
  return membership;
}

export async function getHackathonOwnedByUser(slug: string, userId: string) {
  const hackathon = await db.query.hackathons.findFirst({
    where: eq(hackathons.slug, slug),
  });
  if (!hackathon) return null;
  await requireOrganizerAccess(hackathon.id, userId);
  return hackathon;
}

export async function updateHackathonMarketingForUser(
  userId: string,
  slug: string,
  input: {
    title?: string;
    tagline?: string | null;
    description?: string | null;
    coverUrl?: string | null;
    location?: string | null;
    mode?: EventMode;
    joinMode?: JoinMode;
    capacity?: number | null;
    status?: HackathonStatus;
    codeOfConduct?: string | null;
    startsAt?: string | Date | null;
    endsAt?: string | Date | null;
    highlights?: string[];
    faq?: Array<{ q: string; a: string }>;
    prizes?: Array<{ title: string; value?: string | null; description?: string | null }>;
    sponsors?: Array<{ name: string; tier?: string | null; url?: string | null }>;
    tracks?: Array<{ name: string; description?: string | null }>;
  },
) {
  const hackathon = await getHackathonOwnedByUser(slug, userId);
  if (!hackathon) throw new Error("Not found");

  await db
    .update(hackathons)
    .set({
      title: input.title?.trim() || hackathon.title,
      tagline:
        input.tagline !== undefined
          ? input.tagline?.trim() || null
          : hackathon.tagline,
      description:
        input.description !== undefined
          ? input.description?.trim() || null
          : hackathon.description,
      coverUrl:
        input.coverUrl !== undefined
          ? input.coverUrl?.trim() || null
          : hackathon.coverUrl,
      location:
        input.location !== undefined
          ? input.location?.trim() || null
          : hackathon.location,
      mode: input.mode ?? hackathon.mode,
      joinMode: input.joinMode ?? hackathon.joinMode,
      capacity:
        input.capacity !== undefined ? input.capacity : hackathon.capacity,
      status: input.status ?? hackathon.status,
      codeOfConduct:
        input.codeOfConduct !== undefined
          ? input.codeOfConduct?.trim() || null
          : hackathon.codeOfConduct,
      startsAt:
        input.startsAt !== undefined
          ? toDate(input.startsAt)
          : hackathon.startsAt,
      endsAt:
        input.endsAt !== undefined ? toDate(input.endsAt) : hackathon.endsAt,
      updatedAt: new Date(),
    })
    .where(eq(hackathons.id, hackathon.id));

  if (input.highlights || input.faq) {
    const blocks = await db.query.hackathonPageBlocks.findMany({
      where: eq(hackathonPageBlocks.hackathonId, hackathon.id),
    });

    if (input.highlights) {
      const highlightsBlock = blocks.find((b) => b.type === "highlights");
      if (highlightsBlock) {
        await db
          .update(hackathonPageBlocks)
          .set({
            content: { items: input.highlights },
            updatedAt: new Date(),
          })
          .where(eq(hackathonPageBlocks.id, highlightsBlock.id));
      } else {
        await db.insert(hackathonPageBlocks).values({
          id: createId("blk"),
          hackathonId: hackathon.id,
          type: "highlights",
          sortOrder: 0,
          content: { items: input.highlights },
        });
      }
    }

    if (input.faq) {
      const faqBlock = blocks.find((b) => b.type === "faq");
      if (faqBlock) {
        await db
          .update(hackathonPageBlocks)
          .set({ content: { items: input.faq }, updatedAt: new Date() })
          .where(eq(hackathonPageBlocks.id, faqBlock.id));
      } else {
        await db.insert(hackathonPageBlocks).values({
          id: createId("blk"),
          hackathonId: hackathon.id,
          type: "faq",
          sortOrder: 1,
          content: { items: input.faq },
        });
      }
    }
  }

  if (input.prizes) {
    await db.delete(prizes).where(eq(prizes.hackathonId, hackathon.id));
    if (input.prizes.length) {
      await db.insert(prizes).values(
        input.prizes.map((prize, i) => ({
          id: createId("prz"),
          hackathonId: hackathon.id,
          title: prize.title,
          value: prize.value ?? null,
          description: prize.description ?? null,
          sortOrder: i,
        })),
      );
    }
  }

  if (input.sponsors) {
    await db.delete(sponsors).where(eq(sponsors.hackathonId, hackathon.id));
    if (input.sponsors.length) {
      await db.insert(sponsors).values(
        input.sponsors.map((sponsor, i) => ({
          id: createId("spn"),
          hackathonId: hackathon.id,
          name: sponsor.name,
          tier: sponsor.tier ?? "partner",
          url: sponsor.url ?? null,
          sortOrder: i,
        })),
      );
    }
  }

  if (input.tracks) {
    await db.delete(tracks).where(eq(tracks.hackathonId, hackathon.id));
    if (input.tracks.length) {
      await db.insert(tracks).values(
        input.tracks.map((track, i) => ({
          id: createId("trk"),
          hackathonId: hackathon.id,
          name: track.name,
          description: track.description ?? null,
          sortOrder: i,
        })),
      );
    }
  }

  return { slug: hackathon.slug, id: hackathon.id };
}

export async function listHackathonsForUser(userId: string) {
  const rows = await db
    .select({
      id: hackathons.id,
      slug: hackathons.slug,
      title: hackathons.title,
      status: hackathons.status,
      mode: hackathons.mode,
      startsAt: hackathons.startsAt,
      endsAt: hackathons.endsAt,
      role: hackathonMemberships.role,
    })
    .from(hackathonMemberships)
    .innerJoin(hackathons, eq(hackathonMemberships.hackathonId, hackathons.id))
    .where(
      and(
        eq(hackathonMemberships.userId, userId),
        eq(hackathonMemberships.status, "active"),
      ),
    );

  return rows;
}

export async function getHackathonBundle(slug: string) {
  const hackathon = await db.query.hackathons.findFirst({
    where: eq(hackathons.slug, slug),
  });
  if (!hackathon) return null;

  const [pageBlocks, prizeRows, sponsorRows, trackRows, challengeRows, scheduleRows] =
    await Promise.all([
      db.query.hackathonPageBlocks.findMany({
        where: eq(hackathonPageBlocks.hackathonId, hackathon.id),
      }),
      db.query.prizes.findMany({ where: eq(prizes.hackathonId, hackathon.id) }),
      db.query.sponsors.findMany({
        where: eq(sponsors.hackathonId, hackathon.id),
      }),
      db.query.tracks.findMany({ where: eq(tracks.hackathonId, hackathon.id) }),
      db.query.challenges.findMany({
        where: eq(challenges.hackathonId, hackathon.id),
      }),
      db.query.scheduleItems.findMany({
        where: eq(scheduleItems.hackathonId, hackathon.id),
      }),
    ]);

  return {
    hackathon,
    pageBlocks,
    prizes: prizeRows,
    sponsors: sponsorRows,
    tracks: trackRows,
    challenges: challengeRows,
    schedule: scheduleRows,
  };
}
