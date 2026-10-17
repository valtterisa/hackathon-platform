/**
 * Compatibility shims for Next pages. Prefer `@/lib/services/access` in new code.
 * All checks delegate to the shared access service.
 */
import {
  getHackathonBySlug,
  requireOrganizerByHackathonId,
} from "@/lib/services/access";
import { db } from "@hackhost/db";
import { hackathonMemberships } from "@hackhost/db/schema";
import { and, eq } from "drizzle-orm";

export type EventRole = "organizer" | "participant" | "judge" | "mentor";

export { getHackathonBySlug };

export async function getMembership(
  hackathonId: string,
  userId: string,
  role?: EventRole,
) {
  if (role) {
    return db.query.hackathonMemberships.findFirst({
      where: and(
        eq(hackathonMemberships.hackathonId, hackathonId),
        eq(hackathonMemberships.userId, userId),
        eq(hackathonMemberships.role, role),
      ),
    });
  }
  return db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathonId),
      eq(hackathonMemberships.userId, userId),
    ),
  });
}

export async function listMemberships(hackathonId: string, userId: string) {
  return db.query.hackathonMemberships.findMany({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathonId),
      eq(hackathonMemberships.userId, userId),
    ),
  });
}

export async function requireOrganizer(hackathonId: string, userId: string) {
  return requireOrganizerByHackathonId(hackathonId, userId);
}

export async function requireParticipant(hackathonId: string, userId: string) {
  const membership = await getMembership(hackathonId, userId, "participant");
  if (!membership || membership.status !== "active") {
    throw new Error("FORBIDDEN");
  }
  return membership;
}

export async function isOrganizer(hackathonId: string, userId: string) {
  const m = await getMembership(hackathonId, userId, "organizer");
  return Boolean(m && m.status === "active");
}

export async function isActiveMember(hackathonId: string, userId: string) {
  const memberships = await listMemberships(hackathonId, userId);
  return memberships.some((m) => m.status === "active");
}
