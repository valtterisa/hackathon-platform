import { db } from "@hackhost/db";
import { hackathonMemberships, hackathons } from "@hackhost/db/schema";
import { and, eq, or } from "drizzle-orm";

export async function getHackathonBySlug(slug: string) {
  return db.query.hackathons.findFirst({
    where: eq(hackathons.slug, slug),
  });
}

export async function requireHackathonBySlug(slug: string) {
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Hackathon not found");
  return hackathon;
}

export async function requireOrganizerBySlug(slug: string, userId: string) {
  const hackathon = await requireHackathonBySlug(slug);
  const membership = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathon.id),
      eq(hackathonMemberships.userId, userId),
      eq(hackathonMemberships.role, "organizer"),
      eq(hackathonMemberships.status, "active"),
    ),
  });
  if (!membership) throw new Error("FORBIDDEN: organizer required");
  return { hackathon, membership };
}

/** Active participant, organizer, judge, or mentor — same as event app gate. */
export async function requireEventAccessBySlug(slug: string, userId: string) {
  const hackathon = await requireHackathonBySlug(slug);
  const memberships = await db.query.hackathonMemberships.findMany({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathon.id),
      eq(hackathonMemberships.userId, userId),
      eq(hackathonMemberships.status, "active"),
    ),
  });
  if (!memberships.length) {
    throw new Error("FORBIDDEN: active event membership required");
  }
  return {
    hackathon,
    memberships,
    isOrganizer: memberships.some((m) => m.role === "organizer"),
    isParticipant: memberships.some((m) => m.role === "participant"),
    isJudge: memberships.some((m) => m.role === "judge"),
    isMentor: memberships.some((m) => m.role === "mentor"),
  };
}

/** Participant or organizer (team/submit/match flows). */
export async function requireParticipantOrOrganizerBySlug(
  slug: string,
  userId: string,
) {
  const access = await requireEventAccessBySlug(slug, userId);
  if (!access.isParticipant && !access.isOrganizer) {
    throw new Error("FORBIDDEN: participant or organizer required");
  }
  return access;
}

export async function requireJudgeOrOrganizerBySlug(
  slug: string,
  userId: string,
) {
  const hackathon = await requireHackathonBySlug(slug);
  const membership = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathon.id),
      eq(hackathonMemberships.userId, userId),
      eq(hackathonMemberships.status, "active"),
      or(
        eq(hackathonMemberships.role, "judge"),
        eq(hackathonMemberships.role, "organizer"),
      ),
    ),
  });
  if (!membership) throw new Error("FORBIDDEN: judge or organizer required");
  return { hackathon, membership };
}

/** Published events are readable; drafts/archived need organizer. */
export async function requireReadableHackathonBySlug(
  slug: string,
  userId: string,
) {
  const hackathon = await requireHackathonBySlug(slug);
  if (hackathon.status === "published") {
    return { hackathon, mode: "public" as const };
  }
  await requireOrganizerBySlug(slug, userId);
  return { hackathon, mode: "organizer" as const };
}

export async function requireActiveEventMember(
  hackathonId: string,
  userId: string,
) {
  const membership = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathonId),
      eq(hackathonMemberships.userId, userId),
      eq(hackathonMemberships.status, "active"),
    ),
  });
  if (!membership) {
    throw new Error("FORBIDDEN: recipient is not an active event member");
  }
  return membership;
}
