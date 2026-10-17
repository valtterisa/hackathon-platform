"use server";

import { db } from "@hackhost/db";
import {
  announcements,
  challenges,
  challengeSelections,
  channels,
  checkIns,
  hackathonMemberships,
  hackathonPageBlocks,
  hackathons,
  inviteTokens,
  judgingScores,
  matchProfiles,
  messages,
  conversationParticipants,
  conversations,
  prizes,
  profiles,
  scheduleItems,
  sponsors,
  submissions,
  teamMembers,
  teams,
  tracks,
  user as usersTable,
} from "@hackhost/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createId } from "@/lib/ids";
import {
  getHackathonBySlug,
  isOrganizer,
  requireOrganizer,
} from "@/lib/rbac";
import { getSession } from "@/lib/session";

async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

export async function createHackathon(formData: FormData) {
  const currentUser = await requireUser();
  const { createHackathonForUser } = await import("@/lib/services/hackathons");
  const created = await createHackathonForUser(currentUser.id, {
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
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  await db
    .update(hackathons)
    .set({
      title: String(formData.get("title") ?? hackathon.title),
      tagline: String(formData.get("tagline") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      coverUrl: String(formData.get("coverUrl") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      mode: String(formData.get("mode") ?? hackathon.mode) as typeof hackathon.mode,
      joinMode: String(formData.get("joinMode") ?? hackathon.joinMode) as typeof hackathon.joinMode,
      capacity: formData.get("capacity")
        ? Number(formData.get("capacity"))
        : null,
      status: String(formData.get("status") ?? hackathon.status) as typeof hackathon.status,
      codeOfConduct: String(formData.get("codeOfConduct") ?? "") || null,
      startsAt: formData.get("startsAt")
        ? new Date(String(formData.get("startsAt")))
        : hackathon.startsAt,
      endsAt: formData.get("endsAt")
        ? new Date(String(formData.get("endsAt")))
        : hackathon.endsAt,
      updatedAt: new Date(),
    })
    .where(eq(hackathons.id, hackathon.id));

  revalidatePath(`/e/${slug}`);
  revalidatePath(`/e/${slug}/manage/settings`);
}

export async function updateMarketingPage(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const faqRaw = String(formData.get("faq") ?? "");
  const faqItems = faqRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [q, ...rest] = line.split("|");
      return { q: q?.trim() ?? "", a: rest.join("|").trim() };
    });

  const blocks = await db.query.hackathonPageBlocks.findMany({
    where: eq(hackathonPageBlocks.hackathonId, hackathon.id),
  });

  const highlightsBlock = blocks.find((b) => b.type === "highlights");
  const faqBlock = blocks.find((b) => b.type === "faq");

  if (highlightsBlock) {
    await db
      .update(hackathonPageBlocks)
      .set({ content: { items: highlights }, updatedAt: new Date() })
      .where(eq(hackathonPageBlocks.id, highlightsBlock.id));
  } else {
    await db.insert(hackathonPageBlocks).values({
      id: createId("blk"),
      hackathonId: hackathon.id,
      type: "highlights",
      sortOrder: 0,
      content: { items: highlights },
    });
  }

  if (faqBlock) {
    await db
      .update(hackathonPageBlocks)
      .set({ content: { items: faqItems }, updatedAt: new Date() })
      .where(eq(hackathonPageBlocks.id, faqBlock.id));
  } else {
    await db.insert(hackathonPageBlocks).values({
      id: createId("blk"),
      hackathonId: hackathon.id,
      type: "faq",
      sortOrder: 1,
      content: { items: faqItems },
    });
  }

  await db.delete(prizes).where(eq(prizes.hackathonId, hackathon.id));
  const prizeLines = String(formData.get("prizes") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const [i, line] of prizeLines.entries()) {
    const [title, value, description] = line.split("|").map((s) => s.trim());
    if (!title) continue;
    await db.insert(prizes).values({
      id: createId("prz"),
      hackathonId: hackathon.id,
      title,
      value: value || null,
      description: description || null,
      sortOrder: i,
    });
  }

  await db.delete(sponsors).where(eq(sponsors.hackathonId, hackathon.id));
  const sponsorLines = String(formData.get("sponsors") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const [i, line] of sponsorLines.entries()) {
    const [name, tier, url] = line.split("|").map((s) => s.trim());
    if (!name) continue;
    await db.insert(sponsors).values({
      id: createId("spn"),
      hackathonId: hackathon.id,
      name,
      tier: tier || "partner",
      url: url || null,
      sortOrder: i,
    });
  }

  await db.delete(tracks).where(eq(tracks.hackathonId, hackathon.id));
  const trackLines = String(formData.get("tracks") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const [i, line] of trackLines.entries()) {
    const [name, description] = line.split("|").map((s) => s.trim());
    if (!name) continue;
    await db.insert(tracks).values({
      id: createId("trk"),
      hackathonId: hackathon.id,
      name,
      description: description || null,
      sortOrder: i,
    });
  }

  revalidatePath(`/e/${slug}`);
  revalidatePath(`/e/${slug}/manage/page`);
}

export async function registerForHackathon(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  if (hackathon.status !== "published") throw new Error("Not open");

  const existing = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathon.id),
      eq(hackathonMemberships.userId, user.id),
      eq(hackathonMemberships.role, "participant"),
    ),
  });
  if (existing?.status === "active") redirect(`/e/${slug}/home`);

  const activeCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hackathonMemberships)
    .where(
      and(
        eq(hackathonMemberships.hackathonId, hackathon.id),
        eq(hackathonMemberships.role, "participant"),
        eq(hackathonMemberships.status, "active"),
      ),
    );

  const count = activeCount[0]?.count ?? 0;
  let status: "active" | "pending" | "waitlisted" = "active";
  if (hackathon.joinMode === "apply") status = "pending";
  if (hackathon.joinMode === "invite_only") throw new Error("Invite only");
  if (
    hackathon.capacity &&
    count >= hackathon.capacity &&
    hackathon.joinMode === "open"
  ) {
    status = "waitlisted";
  }

  if (existing) {
    await db
      .update(hackathonMemberships)
      .set({ status, updatedAt: new Date() })
      .where(eq(hackathonMemberships.id, existing.id));
  } else {
    await db.insert(hackathonMemberships).values({
      id: createId("mem"),
      hackathonId: hackathon.id,
      userId: user.id,
      role: "participant",
      status,
    });
  }

  const nickname = String(formData.get("nickname") ?? "").trim();
  if (nickname) {
    await db
      .insert(profiles)
      .values({ userId: user.id, nickname })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { nickname, updatedAt: new Date() },
      });
  }

  revalidatePath(`/e/${slug}`);
  if (status === "active") redirect(`/e/${slug}/home`);
  redirect(`/e/${slug}/register?status=${status}`);
}

export async function updateMembershipStatus(
  slug: string,
  membershipId: string,
  status: "active" | "rejected" | "waitlisted",
) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  await db
    .update(hackathonMemberships)
    .set({ status, updatedAt: new Date() })
    .where(eq(hackathonMemberships.id, membershipId));

  revalidatePath(`/e/${slug}/manage/people`);
}

export async function updateProfile(formData: FormData) {
  const sessionUser = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name) {
    await db
      .update(usersTable)
      .set({ name, updatedAt: new Date() })
      .where(eq(usersTable.id, sessionUser.id));
  }

  await db
    .insert(profiles)
    .values({
      userId: sessionUser.id,
      nickname: String(formData.get("nickname") ?? "") || null,
      bio: String(formData.get("bio") ?? "") || null,
      githubUrl: String(formData.get("githubUrl") ?? "") || null,
      linkedinUrl: String(formData.get("linkedinUrl") ?? "") || null,
      lookingForTeam: formData.get("lookingForTeam") === "on",
      skills: String(formData.get("skills") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      interests: String(formData.get("interests") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      preferredRoles: String(formData.get("preferredRoles") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experienceLevel: String(formData.get("experienceLevel") ?? "") || null,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        nickname: String(formData.get("nickname") ?? "") || null,
        bio: String(formData.get("bio") ?? "") || null,
        githubUrl: String(formData.get("githubUrl") ?? "") || null,
        linkedinUrl: String(formData.get("linkedinUrl") ?? "") || null,
        lookingForTeam: formData.get("lookingForTeam") === "on",
        skills: String(formData.get("skills") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        interests: String(formData.get("interests") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        preferredRoles: String(formData.get("preferredRoles") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experienceLevel: String(formData.get("experienceLevel") ?? "") || null,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/me");
}

export async function createTeam(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");

  const teamId = createId("team");
  await db.insert(teams).values({
    id: teamId,
    hackathonId: hackathon.id,
    name,
    description: String(formData.get("description") ?? "") || null,
    maxMembers: Number(formData.get("maxMembers") ?? 4),
    createdBy: user.id,
  });
  await db.insert(teamMembers).values({
    id: createId("tm"),
    teamId,
    userId: user.id,
    role: "leader",
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
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  if (type !== "team") await requireOrganizer(hackathon.id, user.id);

  const token = createId("inv");
  await db.insert(inviteTokens).values({
    id: createId("invrow"),
    token,
    type,
    hackathonId: hackathon.id,
    teamId: teamId ?? null,
    createdBy: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return token;
}

export async function acceptInvite(token: string) {
  const user = await requireUser();
  const invite = await db.query.inviteTokens.findFirst({
    where: eq(inviteTokens.token, token),
  });
  if (!invite || invite.usedAt) throw new Error("Invalid invite");
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new Error("Expired");
  }

  if (invite.type === "team" && invite.teamId) {
    await db.insert(teamMembers).values({
      id: createId("tm"),
      teamId: invite.teamId,
      userId: user.id,
      role: "member",
    });
  } else if (invite.hackathonId) {
    const role =
      invite.type === "co_organizer"
        ? "organizer"
        : invite.type === "judge"
          ? "judge"
          : "mentor";
    await db.insert(hackathonMemberships).values({
      id: createId("mem"),
      hackathonId: invite.hackathonId,
      userId: user.id,
      role,
      status: "active",
    });
  }

  await db
    .update(inviteTokens)
    .set({ usedAt: new Date() })
    .where(eq(inviteTokens.id, invite.id));

  const hackathon = invite.hackathonId
    ? await db.query.hackathons.findFirst({
        where: eq(hackathons.id, invite.hackathonId),
      })
    : null;

  if (hackathon) redirect(`/e/${hackathon.slug}/home`);
  redirect("/events");
}

export async function upsertMatchProfile(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");

  const existing = await db.query.matchProfiles.findFirst({
    where: and(
      eq(matchProfiles.hackathonId, hackathon.id),
      eq(matchProfiles.userId, user.id),
    ),
  });

  const data = {
    roles: String(formData.get("roles") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    skills: String(formData.get("skills") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    goals: String(formData.get("goals") ?? "") || null,
    lookingFor: String(formData.get("lookingFor") ?? "") || null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(matchProfiles)
      .set(data)
      .where(eq(matchProfiles.id, existing.id));
  } else {
    await db.insert(matchProfiles).values({
      id: createId("match"),
      hackathonId: hackathon.id,
      userId: user.id,
      ...data,
    });
  }

  revalidatePath(`/e/${slug}/match`);
}

export async function sendMessage(
  conversationId: string | null,
  recipientId: string,
  slug: string,
  body: string,
) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");

  let convId = conversationId;
  if (!convId) {
    convId = createId("conv");
    await db.insert(conversations).values({
      id: convId,
      hackathonId: hackathon.id,
    });
    await db.insert(conversationParticipants).values([
      {
        id: createId("cp"),
        conversationId: convId,
        userId: user.id,
      },
      {
        id: createId("cp"),
        conversationId: convId,
        userId: recipientId,
      },
    ]);
  }

  await db.insert(messages).values({
    id: createId("msg"),
    conversationId: convId,
    senderId: user.id,
    body,
  });

  revalidatePath("/messages");
  revalidatePath(`/e/${slug}/match`);
}

export async function createChallenge(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  await db.insert(challenges).values({
    id: createId("ch"),
    hackathonId: hackathon.id,
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
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");

  const myTeams = await db
    .select({ team: teams })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.userId, user.id),
        eq(teams.hackathonId, hackathon.id),
      ),
    );

  const team = myTeams[0]?.team;
  if (!team) throw new Error("Join a team first");

  const already = await db.query.challengeSelections.findFirst({
    where: and(
      eq(challengeSelections.challengeId, challengeId),
      eq(challengeSelections.teamId, team.id),
    ),
  });
  if (!already) {
    await db.insert(challengeSelections).values({
      id: createId("cs"),
      challengeId,
      teamId: team.id,
    });
  }

  revalidatePath(`/e/${slug}/challenges`);
}

export async function upsertSubmission(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");

  const myTeams = await db
    .select({ team: teams })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.userId, user.id),
        eq(teams.hackathonId, hackathon.id),
      ),
    );
  const team = myTeams[0]?.team;
  if (!team) throw new Error("Join a team first");

  const existing = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.hackathonId, hackathon.id),
      eq(submissions.teamId, team.id),
    ),
  });

  const payload = {
    title: String(formData.get("title") ?? "Untitled"),
    description: String(formData.get("description") ?? "") || null,
    repoUrl: String(formData.get("repoUrl") ?? "") || null,
    demoUrl: String(formData.get("demoUrl") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(submissions)
      .set(payload)
      .where(eq(submissions.id, existing.id));
  } else {
    await db.insert(submissions).values({
      id: createId("sub"),
      hackathonId: hackathon.id,
      teamId: team.id,
      ...payload,
    });
  }

  revalidatePath(`/e/${slug}/submit`);
  revalidatePath(`/e/${slug}/manage/submissions`);
}

export async function addScheduleItem(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  await db.insert(scheduleItems).values({
    id: createId("sch"),
    hackathonId: hackathon.id,
    title: String(formData.get("title") ?? "Session"),
    description: String(formData.get("description") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    startsAt: new Date(String(formData.get("startsAt"))),
    endsAt: formData.get("endsAt")
      ? new Date(String(formData.get("endsAt")))
      : null,
  });

  revalidatePath(`/e/${slug}/schedule`);
  revalidatePath(`/e/${slug}/manage/schedule`);
}

export async function createAnnouncement(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  await db.insert(announcements).values({
    id: createId("ann"),
    hackathonId: hackathon.id,
    title: String(formData.get("title") ?? "Announcement"),
    body: String(formData.get("body") ?? ""),
    createdBy: user.id,
  });

  revalidatePath(`/e/${slug}/manage/announcements`);
  revalidatePath(`/e/${slug}/home`);
}

export async function checkInUser(slug: string, codeOrUserId: string) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  const targetId = codeOrUserId.trim();
  await db
    .insert(checkIns)
    .values({
      id: createId("chk"),
      hackathonId: hackathon.id,
      userId: targetId,
      method: "code",
    })
    .onConflictDoNothing();

  revalidatePath(`/e/${slug}/manage/check-in`);
}

export async function scoreSubmission(
  slug: string,
  submissionId: string,
  score: number,
  feedback?: string,
) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");

  const judge = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathon.id),
      eq(hackathonMemberships.userId, user.id),
      or(
        eq(hackathonMemberships.role, "judge"),
        eq(hackathonMemberships.role, "organizer"),
      ),
    ),
  });
  if (!judge) throw new Error("FORBIDDEN");

  const existing = await db.query.judgingScores.findFirst({
    where: and(
      eq(judgingScores.submissionId, submissionId),
      eq(judgingScores.judgeId, user.id),
    ),
  });

  if (existing) {
    await db
      .update(judgingScores)
      .set({ score, feedback: feedback ?? null })
      .where(eq(judgingScores.id, existing.id));
  } else {
    await db.insert(judgingScores).values({
      id: createId("js"),
      submissionId,
      judgeId: user.id,
      score,
      feedback: feedback ?? null,
    });
  }

  revalidatePath(`/e/${slug}/manage/judging`);
}

export async function addChannel(slug: string, formData: FormData) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  await db.insert(channels).values({
    id: createId("ch"),
    hackathonId: hackathon.id,
    label: String(formData.get("label") ?? "Discord"),
    url: String(formData.get("url") ?? ""),
  });

  revalidatePath(`/e/${slug}/manage/settings`);
  revalidatePath(`/e/${slug}/home`);
}

export async function exportPeopleCsv(slug: string) {
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Not found");
  await requireOrganizer(hackathon.id, user.id);

  const rows = await db
    .select({
      email: usersTable.email,
      name: usersTable.name,
      role: hackathonMemberships.role,
      status: hackathonMemberships.status,
    })
    .from(hackathonMemberships)
    .innerJoin(usersTable, eq(hackathonMemberships.userId, usersTable.id))
    .where(eq(hackathonMemberships.hackathonId, hackathon.id));

  const header = "email,name,role,status\n";
  const body = rows
    .map((r) => `${r.email},${r.name},${r.role},${r.status}`)
    .join("\n");
  return header + body;
}

export async function assertCanAccessEventApp(slug: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/e/${slug}/home`);
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) redirect("/events");
  const org = await isOrganizer(hackathon.id, session.user.id);
  const memberships = await db.query.hackathonMemberships.findMany({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathon.id),
      eq(hackathonMemberships.userId, session.user.id),
    ),
  });
  const active = memberships.some((m) => m.status === "active");
  if (!active && !org) redirect(`/e/${slug}/register`);
  return { session, hackathon, isOrganizer: org, memberships };
}
