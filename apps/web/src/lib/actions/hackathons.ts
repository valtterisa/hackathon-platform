"use server";

/**
 * Next.js adapter: session + FormData parsing + revalidate/redirect.
 * All business logic and RBAC live in `@/lib/services/*`.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getEventAppAccess } from "@/lib/services/access";
import {
  createHackathonForUser,
  updateHackathonMarketingForUser,
} from "@/lib/services/hackathons";
import * as ops from "@/lib/services/event-ops";

async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

function splitLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitCsv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createHackathon(formData: FormData) {
  const user = await requireUser();
  const created = await createHackathonForUser(user.id, {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "") || null,
    tagline: String(formData.get("tagline") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    coverUrl: String(formData.get("coverUrl") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    mode: (String(formData.get("mode") ?? "in_person") as
      | "in_person"
      | "online"
      | "hybrid") || "in_person",
    joinMode: (String(formData.get("joinMode") ?? "open") as
      | "open"
      | "apply"
      | "invite_only") || "open",
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : null,
    startsAt: formData.get("startsAt")
      ? new Date(String(formData.get("startsAt")))
      : null,
    endsAt: formData.get("endsAt")
      ? new Date(String(formData.get("endsAt")))
      : null,
  });
  redirect(`/e/${created.slug}/manage/page`);
}

export async function updateHackathonSettings(slug: string, formData: FormData) {
  const user = await requireUser();
  await updateHackathonMarketingForUser(user.id, slug, {
    title: String(formData.get("title") ?? ""),
    tagline: String(formData.get("tagline") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    coverUrl: String(formData.get("coverUrl") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    mode: String(formData.get("mode") ?? "hybrid") as
      | "in_person"
      | "online"
      | "hybrid",
    joinMode: String(formData.get("joinMode") ?? "open") as
      | "open"
      | "apply"
      | "invite_only",
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : null,
    status: String(formData.get("status") ?? "draft") as
      | "draft"
      | "published"
      | "archived",
    codeOfConduct: String(formData.get("codeOfConduct") ?? "") || null,
    ...(formData.get("startsAt")
      ? { startsAt: new Date(String(formData.get("startsAt"))) }
      : {}),
    ...(formData.get("endsAt")
      ? { endsAt: new Date(String(formData.get("endsAt"))) }
      : {}),
  });
  revalidatePath(`/e/${slug}`);
  revalidatePath(`/e/${slug}/manage/settings`);
}

export async function updateMarketingPage(slug: string, formData: FormData) {
  const user = await requireUser();
  const highlights = splitLines(formData.get("highlights"));
  const faq = splitLines(formData.get("faq")).map((line) => {
    const [q, ...rest] = line.split("|");
    return { q: q?.trim() ?? "", a: rest.join("|").trim() };
  });
  const prizes = splitLines(formData.get("prizes")).flatMap((line) => {
    const [title, value, description] = line.split("|").map((s) => s.trim());
    return title ? [{ title, value, description }] : [];
  });
  const sponsors = splitLines(formData.get("sponsors")).flatMap((line) => {
    const [name, tier, url] = line.split("|").map((s) => s.trim());
    return name ? [{ name, tier, url }] : [];
  });
  const tracks = splitLines(formData.get("tracks")).flatMap((line) => {
    const [name, description] = line.split("|").map((s) => s.trim());
    return name ? [{ name, description }] : [];
  });

  await updateHackathonMarketingForUser(user.id, slug, {
    highlights,
    faq,
    prizes,
    sponsors,
    tracks,
  });
  revalidatePath(`/e/${slug}`);
  revalidatePath(`/e/${slug}/manage/page`);
}

export async function registerForHackathon(slug: string, formData: FormData) {
  const user = await requireUser();
  const result = await ops.registerForEvent(user.id, slug, {
    nickname: String(formData.get("nickname") ?? "").trim() || null,
  });
  revalidatePath(`/e/${slug}`);
  if (result.status === "active") redirect(`/e/${slug}/home`);
  redirect(`/e/${slug}/register?status=${result.status}`);
}

export async function updateMembershipStatus(
  slug: string,
  membershipId: string,
  status: "active" | "rejected" | "waitlisted",
) {
  const user = await requireUser();
  await ops.updateMembershipStatusForOrganizer(
    user.id,
    slug,
    membershipId,
    status,
  );
  revalidatePath(`/e/${slug}/manage/people`);
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await ops.updateMyProfile(user.id, {
    name: String(formData.get("name") ?? "").trim() || undefined,
    nickname: String(formData.get("nickname") ?? "") || null,
    bio: String(formData.get("bio") ?? "") || null,
    githubUrl: String(formData.get("githubUrl") ?? "") || null,
    linkedinUrl: String(formData.get("linkedinUrl") ?? "") || null,
    lookingForTeam: formData.get("lookingForTeam") === "on",
    skills: splitCsv(formData.get("skills")),
    interests: splitCsv(formData.get("interests")),
    preferredRoles: splitCsv(formData.get("preferredRoles")),
    experienceLevel: String(formData.get("experienceLevel") ?? "") || null,
  });
  revalidatePath("/me");
}

export async function createTeam(slug: string, formData: FormData) {
  const user = await requireUser();
  await ops.createTeamForUser(user.id, slug, {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "") || null,
    maxMembers: Number(formData.get("maxMembers") ?? 4),
  });
  revalidatePath(`/e/${slug}/team`);
  revalidatePath(`/e/${slug}/manage/teams`);
}

export async function createInvite(
  slug: string,
  type: "co_organizer" | "team" | "judge" | "mentor",
  teamId?: string,
) {
  const user = await requireUser();
  const invite = await ops.createInviteForUser(user.id, slug, type, teamId);
  return invite.token;
}

export async function acceptInvite(token: string) {
  const user = await requireUser();
  const result = await ops.acceptInviteToken(user.id, token);
  if (result.slug) redirect(`/e/${result.slug}/home`);
  redirect("/events");
}

export async function upsertMatchProfile(slug: string, formData: FormData) {
  const user = await requireUser();
  await ops.upsertMatchProfileForUser(user.id, slug, {
    roles: splitCsv(formData.get("roles")),
    skills: splitCsv(formData.get("skills")),
    goals: String(formData.get("goals") ?? "") || null,
    lookingFor: String(formData.get("lookingFor") ?? "") || null,
  });
  revalidatePath(`/e/${slug}/match`);
}

export async function sendMessage(
  conversationId: string | null,
  recipientId: string,
  slug: string,
  body: string,
) {
  const user = await requireUser();
  await ops.sendDirectMessage(user.id, slug, {
    recipientId,
    body,
    conversationId,
  });
  revalidatePath("/messages");
  revalidatePath(`/e/${slug}/match`);
}

export async function createChallenge(slug: string, formData: FormData) {
  const user = await requireUser();
  await ops.createChallengeForOrganizer(user.id, slug, {
    title: String(formData.get("title") ?? "Challenge"),
    description: String(formData.get("description") ?? "") || null,
    sponsorName: String(formData.get("sponsorName") ?? "") || null,
    attachmentUrl: String(formData.get("attachmentUrl") ?? "") || null,
  });
  revalidatePath(`/e/${slug}/manage/challenges`);
  revalidatePath(`/e/${slug}/challenges`);
}

export async function selectChallenge(slug: string, challengeId: string) {
  const user = await requireUser();
  await ops.selectChallengeForTeam(user.id, slug, challengeId);
  revalidatePath(`/e/${slug}/challenges`);
}

export async function upsertSubmission(slug: string, formData: FormData) {
  const user = await requireUser();
  await ops.upsertSubmissionForTeam(user.id, slug, {
    title: String(formData.get("title") ?? "Untitled"),
    description: String(formData.get("description") ?? "") || null,
    repoUrl: String(formData.get("repoUrl") ?? "") || null,
    demoUrl: String(formData.get("demoUrl") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
  });
  revalidatePath(`/e/${slug}/submit`);
  revalidatePath(`/e/${slug}/manage/submissions`);
}

export async function addScheduleItem(slug: string, formData: FormData) {
  const user = await requireUser();
  await ops.addScheduleItemForOrganizer(user.id, slug, {
    title: String(formData.get("title") ?? "Session"),
    description: String(formData.get("description") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    startsAt: String(formData.get("startsAt")),
    endsAt: formData.get("endsAt")
      ? String(formData.get("endsAt"))
      : null,
  });
  revalidatePath(`/e/${slug}/schedule`);
  revalidatePath(`/e/${slug}/manage/schedule`);
}

export async function createAnnouncement(slug: string, formData: FormData) {
  const user = await requireUser();
  await ops.createAnnouncementForOrganizer(user.id, slug, {
    title: String(formData.get("title") ?? "Announcement"),
    body: String(formData.get("body") ?? ""),
  });
  revalidatePath(`/e/${slug}/manage/announcements`);
  revalidatePath(`/e/${slug}/home`);
}

export async function checkInUser(slug: string, codeOrUserId: string) {
  const user = await requireUser();
  await ops.checkInUserForOrganizer(user.id, slug, codeOrUserId);
  revalidatePath(`/e/${slug}/manage/check-in`);
}

export async function scoreSubmission(
  slug: string,
  submissionId: string,
  score: number,
  feedback?: string,
) {
  const user = await requireUser();
  await ops.scoreSubmissionForJudge(
    user.id,
    slug,
    submissionId,
    score,
    feedback,
  );
  revalidatePath(`/e/${slug}/manage/judging`);
}

export async function addChannel(slug: string, formData: FormData) {
  const user = await requireUser();
  await ops.addChannelForOrganizer(user.id, slug, {
    label: String(formData.get("label") ?? "Discord"),
    url: String(formData.get("url") ?? ""),
  });
  revalidatePath(`/e/${slug}/manage/settings`);
  revalidatePath(`/e/${slug}/home`);
}

export async function exportPeopleCsv(slug: string) {
  const user = await requireUser();
  return ops.exportPeopleCsvForOrganizer(user.id, slug);
}

/** Layout gate: redirects are Next-specific; membership check is shared. */
export async function assertCanAccessEventApp(slug: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/e/${slug}/home`);
  const access = await getEventAppAccess(slug, session.user.id);
  if (!access) redirect("/events");
  if (!access.hasAccess) redirect(`/e/${slug}/register`);
  return {
    session,
    hackathon: access.hackathon,
    isOrganizer: access.isOrganizer,
    memberships: access.memberships,
  };
}
