import { db } from "@hackhost/db";
import {
  announcements,
  challengeSelections,
  challenges,
  channels,
  checkIns,
  conversationParticipants,
  conversations,
  hackathonMemberships,
  hackathons,
  inviteTokens,
  judgingScores,
  matchProfiles,
  messages,
  profiles,
  scheduleItems,
  submissions,
  teamMembers,
  teams,
  user as usersTable,
} from "@hackhost/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { createId } from "@/lib/ids";
import {
  requireActiveEventMember,
  requireEventAccessBySlug,
  requireHackathonBySlug,
  requireJudgeOrOrganizerBySlug,
  requireOrganizerBySlug,
  requireParticipantOrOrganizerBySlug,
  requireReadableHackathonBySlug,
} from "@/lib/services/access";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

// ─── Organizer reads ────────────────────────────────────────────────────────

export async function getEventOverview(userId: string, slug: string) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  const [people, teamCount, submissionCount, checkInCount] = await Promise.all([
    db
      .select({
        role: hackathonMemberships.role,
        status: hackathonMemberships.status,
        count: sql<number>`count(*)::int`,
      })
      .from(hackathonMemberships)
      .where(eq(hackathonMemberships.hackathonId, hackathon.id))
      .groupBy(hackathonMemberships.role, hackathonMemberships.status),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(teams)
      .where(eq(teams.hackathonId, hackathon.id)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(submissions)
      .where(eq(submissions.hackathonId, hackathon.id)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(checkIns)
      .where(eq(checkIns.hackathonId, hackathon.id)),
  ]);
  return {
    hackathon,
    membershipBreakdown: people,
    teamCount: teamCount[0]?.count ?? 0,
    submissionCount: submissionCount[0]?.count ?? 0,
    checkInCount: checkInCount[0]?.count ?? 0,
  };
}

export async function listPeople(userId: string, slug: string) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  return db
    .select({
      membershipId: hackathonMemberships.id,
      userId: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: hackathonMemberships.role,
      status: hackathonMemberships.status,
      createdAt: hackathonMemberships.createdAt,
    })
    .from(hackathonMemberships)
    .innerJoin(usersTable, eq(hackathonMemberships.userId, usersTable.id))
    .where(eq(hackathonMemberships.hackathonId, hackathon.id));
}

export async function updateMembershipStatusForOrganizer(
  userId: string,
  slug: string,
  membershipId: string,
  status: "active" | "rejected" | "waitlisted",
) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  const row = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.id, membershipId),
      eq(hackathonMemberships.hackathonId, hackathon.id),
    ),
  });
  if (!row) throw new Error("Membership not found");
  await db
    .update(hackathonMemberships)
    .set({ status, updatedAt: new Date() })
    .where(eq(hackathonMemberships.id, membershipId));
  return { membershipId, status };
}

export async function exportPeopleCsvForOrganizer(userId: string, slug: string) {
  const rows = await listPeople(userId, slug);
  const header = "email,name,role,status\n";
  const body = rows
    .map((r) => `${r.email},${r.name},${r.role},${r.status}`)
    .join("\n");
  return header + body;
}

export async function listChannels(userId: string, slug: string) {
  const { hackathon } = await requireEventAccessBySlug(slug, userId);
  return db.query.channels.findMany({
    where: eq(channels.hackathonId, hackathon.id),
  });
}

export async function addChannelForOrganizer(
  userId: string,
  slug: string,
  input: { label: string; url: string },
) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  const id = createId("ch");
  await db.insert(channels).values({
    id,
    hackathonId: hackathon.id,
    label: input.label.trim() || "Channel",
    url: input.url.trim(),
  });
  return { id, label: input.label, url: input.url };
}

export async function listAnnouncements(userId: string, slug: string) {
  const { hackathon } = await requireEventAccessBySlug(slug, userId);
  return db.query.announcements.findMany({
    where: eq(announcements.hackathonId, hackathon.id),
    orderBy: [desc(announcements.createdAt)],
  });
}

export async function createAnnouncementForOrganizer(
  userId: string,
  slug: string,
  input: { title: string; body: string },
) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  const id = createId("ann");
  await db.insert(announcements).values({
    id,
    hackathonId: hackathon.id,
    title: input.title.trim() || "Announcement",
    body: input.body,
    createdBy: userId,
  });
  return { id, title: input.title, body: input.body };
}

export async function createChallengeForOrganizer(
  userId: string,
  slug: string,
  input: {
    title: string;
    description?: string | null;
    sponsorName?: string | null;
    attachmentUrl?: string | null;
  },
) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  const id = createId("ch");
  await db.insert(challenges).values({
    id,
    hackathonId: hackathon.id,
    title: input.title.trim() || "Challenge",
    description: input.description?.trim() || null,
    sponsorName: input.sponsorName?.trim() || null,
    attachmentUrl: input.attachmentUrl?.trim() || null,
  });
  return { id, ...input };
}

export async function addScheduleItemForOrganizer(
  userId: string,
  slug: string,
  input: {
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: string | Date;
    endsAt?: string | Date | null;
  },
) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  const id = createId("sch");
  const startsAt = toDate(input.startsAt);
  if (!startsAt) throw new Error("startsAt required");
  await db.insert(scheduleItems).values({
    id,
    hackathonId: hackathon.id,
    title: input.title.trim() || "Session",
    description: input.description?.trim() || null,
    location: input.location?.trim() || null,
    startsAt,
    endsAt: toDate(input.endsAt),
  });
  return { id, title: input.title, startsAt };
}

export async function createInviteForUser(
  userId: string,
  slug: string,
  type: "co_organizer" | "team" | "judge" | "mentor",
  teamId?: string | null,
) {
  if (type !== "team") {
    const { hackathon } = await requireOrganizerBySlug(slug, userId);
    return createInviteRow(userId, hackathon.id, type, null);
  }

  const { hackathon, isOrganizer } = await requireEventAccessBySlug(
    slug,
    userId,
  );
  if (!teamId) throw new Error("teamId required for team invites");
  const team = await db.query.teams.findFirst({
    where: and(eq(teams.id, teamId), eq(teams.hackathonId, hackathon.id)),
  });
  if (!team) throw new Error("Team not found");
  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
  });
  if (!member && team.createdBy !== userId && !isOrganizer) {
    throw new Error("FORBIDDEN: not a team member");
  }
  return createInviteRow(userId, hackathon.id, type, teamId);
}

async function createInviteRow(
  userId: string,
  hackathonId: string,
  type: "co_organizer" | "team" | "judge" | "mentor",
  teamId: string | null,
) {
  const token = createId("inv");
  await db.insert(inviteTokens).values({
    id: createId("invrow"),
    token,
    type,
    hackathonId,
    teamId,
    createdBy: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return {
    token,
    type,
    url: `${appUrl()}/invites/${token}`,
    expiresInDays: 7,
  };
}

export async function listTeamsForEvent(userId: string, slug: string) {
  const { hackathon } = await requireEventAccessBySlug(slug, userId);
  const teamRows = await db.query.teams.findMany({
    where: eq(teams.hackathonId, hackathon.id),
  });
  const result = [];
  for (const team of teamRows) {
    const members = await db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: teamMembers.role,
      })
      .from(teamMembers)
      .innerJoin(usersTable, eq(teamMembers.userId, usersTable.id))
      .where(eq(teamMembers.teamId, team.id));
    result.push({ ...team, members });
  }
  return result;
}

export async function listSubmissionsForEvent(userId: string, slug: string) {
  const { hackathon, isOrganizer, isJudge } = await requireEventAccessBySlug(
    slug,
    userId,
  );
  if (!isOrganizer && !isJudge) {
    // Participants see their own team submission only
    const myTeam = await getMyTeam(userId, hackathon.id);
    if (!myTeam) return [];
    const mine = await db.query.submissions.findFirst({
      where: and(
        eq(submissions.hackathonId, hackathon.id),
        eq(submissions.teamId, myTeam.id),
      ),
    });
    return mine ? [mine] : [];
  }
  return db.query.submissions.findMany({
    where: eq(submissions.hackathonId, hackathon.id),
  });
}

export async function checkInUserForOrganizer(
  userId: string,
  slug: string,
  targetUserId: string,
) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  await db
    .insert(checkIns)
    .values({
      id: createId("chk"),
      hackathonId: hackathon.id,
      userId: targetUserId.trim(),
      method: "code",
    })
    .onConflictDoNothing();
  return { hackathonId: hackathon.id, userId: targetUserId.trim() };
}

export async function listCheckIns(userId: string, slug: string) {
  const { hackathon } = await requireOrganizerBySlug(slug, userId);
  return db
    .select({
      id: checkIns.id,
      userId: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      checkedInAt: checkIns.checkedInAt,
      method: checkIns.method,
    })
    .from(checkIns)
    .innerJoin(usersTable, eq(checkIns.userId, usersTable.id))
    .where(eq(checkIns.hackathonId, hackathon.id));
}

export async function scoreSubmissionForJudge(
  userId: string,
  slug: string,
  submissionId: string,
  score: number,
  feedback?: string | null,
) {
  const { hackathon } = await requireJudgeOrOrganizerBySlug(slug, userId);
  if (score < 0 || score > 100) throw new Error("score must be 0–100");
  const submission = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.id, submissionId),
      eq(submissions.hackathonId, hackathon.id),
    ),
  });
  if (!submission) throw new Error("Submission not found");

  const existing = await db.query.judgingScores.findFirst({
    where: and(
      eq(judgingScores.submissionId, submissionId),
      eq(judgingScores.judgeId, userId),
    ),
  });
  if (existing) {
    await db
      .update(judgingScores)
      .set({ score, feedback: feedback ?? null })
      .where(eq(judgingScores.id, existing.id));
    return { id: existing.id, submissionId, score, feedback: feedback ?? null };
  }
  const id = createId("js");
  await db.insert(judgingScores).values({
    id,
    submissionId,
    judgeId: userId,
    score,
    feedback: feedback ?? null,
  });
  return { id, submissionId, score, feedback: feedback ?? null };
}

export async function listJudgingScores(userId: string, slug: string) {
  const { hackathon } = await requireJudgeOrOrganizerBySlug(slug, userId);
  const subs = await db.query.submissions.findMany({
    where: eq(submissions.hackathonId, hackathon.id),
  });
  if (!subs.length) return { submissions: [], scores: [] };
  const allScores = await db
    .select()
    .from(judgingScores)
    .innerJoin(submissions, eq(judgingScores.submissionId, submissions.id))
    .where(eq(submissions.hackathonId, hackathon.id));
  return {
    submissions: subs,
    scores: allScores.map((r) => r.judging_scores),
  };
}

// ─── Participant ────────────────────────────────────────────────────────────

export async function registerForEvent(
  userId: string,
  slug: string,
  input?: { nickname?: string | null },
) {
  const hackathon = await requireHackathonBySlug(slug);
  if (hackathon.status !== "published") throw new Error("Event not open");

  const existing = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathon.id),
      eq(hackathonMemberships.userId, userId),
      eq(hackathonMemberships.role, "participant"),
    ),
  });
  if (existing?.status === "active") {
    return { status: "active" as const, membershipId: existing.id, slug };
  }

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
  if (hackathon.capacity && count >= hackathon.capacity && hackathon.joinMode === "open") {
    status = "waitlisted";
  }

  let membershipId = existing?.id;
  if (existing) {
    await db
      .update(hackathonMemberships)
      .set({ status, updatedAt: new Date() })
      .where(eq(hackathonMemberships.id, existing.id));
  } else {
    membershipId = createId("mem");
    await db.insert(hackathonMemberships).values({
      id: membershipId,
      hackathonId: hackathon.id,
      userId,
      role: "participant",
      status,
    });
  }

  const nickname = input?.nickname?.trim();
  if (nickname) {
    await db
      .insert(profiles)
      .values({ userId, nickname })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { nickname, updatedAt: new Date() },
      });
  }

  return { status, membershipId, slug };
}

export async function acceptInviteToken(userId: string, token: string) {
  const invite = await db.query.inviteTokens.findFirst({
    where: eq(inviteTokens.token, token),
  });
  if (!invite || invite.usedAt) throw new Error("Invalid invite");
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new Error("Expired");
  }

  if (invite.type === "team" && invite.teamId) {
    if (!invite.hackathonId) throw new Error("Invalid invite");
    // Team invites only for active event members (or auto-register open events).
    const existing = await db.query.hackathonMemberships.findFirst({
      where: and(
        eq(hackathonMemberships.hackathonId, invite.hackathonId),
        eq(hackathonMemberships.userId, userId),
        eq(hackathonMemberships.status, "active"),
      ),
    });
    if (!existing) {
      throw new Error("FORBIDDEN: register for the event before joining a team");
    }
    await db.insert(teamMembers).values({
      id: createId("tm"),
      teamId: invite.teamId,
      userId,
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
      userId,
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

  return {
    type: invite.type,
    slug: hackathon?.slug ?? null,
    teamId: invite.teamId,
  };
}

async function getMyTeam(userId: string, hackathonId: string) {
  const rows = await db
    .select({ team: teams })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(eq(teamMembers.userId, userId), eq(teams.hackathonId, hackathonId)),
    );
  return rows[0]?.team ?? null;
}

export async function createTeamForUser(
  userId: string,
  slug: string,
  input: {
    name: string;
    description?: string | null;
    maxMembers?: number;
    lookingForMembers?: boolean;
  },
) {
  const { hackathon } = await requireParticipantOrOrganizerBySlug(slug, userId);
  const name = input.name.trim();
  if (!name) throw new Error("Name required");
  const teamId = createId("team");
  await db.insert(teams).values({
    id: teamId,
    hackathonId: hackathon.id,
    name,
    description: input.description?.trim() || null,
    maxMembers: input.maxMembers ?? 4,
    lookingForMembers: input.lookingForMembers ?? true,
    createdBy: userId,
  });
  await db.insert(teamMembers).values({
    id: createId("tm"),
    teamId,
    userId,
    role: "leader",
  });
  return { id: teamId, name, slug };
}

export async function upsertMatchProfileForUser(
  userId: string,
  slug: string,
  input: {
    roles?: string[];
    skills?: string[];
    goals?: string | null;
    lookingFor?: string | null;
  },
) {
  const { hackathon } = await requireParticipantOrOrganizerBySlug(slug, userId);
  const existing = await db.query.matchProfiles.findFirst({
    where: and(
      eq(matchProfiles.hackathonId, hackathon.id),
      eq(matchProfiles.userId, userId),
    ),
  });
  const data = {
    roles: input.roles ?? [],
    skills: input.skills ?? [],
    goals: input.goals ?? null,
    lookingFor: input.lookingFor ?? null,
    updatedAt: new Date(),
  };
  if (existing) {
    await db
      .update(matchProfiles)
      .set(data)
      .where(eq(matchProfiles.id, existing.id));
    return { id: existing.id, ...data };
  }
  const id = createId("match");
  await db.insert(matchProfiles).values({
    id,
    hackathonId: hackathon.id,
    userId,
    ...data,
  });
  return { id, ...data };
}

export async function listMatchProfilesForEvent(userId: string, slug: string) {
  const { hackathon } = await requireEventAccessBySlug(slug, userId);
  const mine = await db.query.matchProfiles.findFirst({
    where: and(
      eq(matchProfiles.hackathonId, hackathon.id),
      eq(matchProfiles.userId, userId),
    ),
  });
  const others = await db
    .select({
      id: matchProfiles.id,
      userId: usersTable.id,
      name: usersTable.name,
      roles: matchProfiles.roles,
      skills: matchProfiles.skills,
      goals: matchProfiles.goals,
      lookingFor: matchProfiles.lookingFor,
    })
    .from(matchProfiles)
    .innerJoin(usersTable, eq(matchProfiles.userId, usersTable.id))
    .where(eq(matchProfiles.hackathonId, hackathon.id));

  const mySkills = new Set(mine?.skills ?? []);
  const ranked = others
    .map((row) => {
      const skills = row.skills ?? [];
      const overlap = skills.filter((s) => mySkills.has(s)).length;
      return { ...row, skillOverlap: overlap };
    })
    .sort((a, b) => b.skillOverlap - a.skillOverlap);

  return { mine, matches: ranked };
}

export async function selectChallengeForTeam(
  userId: string,
  slug: string,
  challengeId: string,
) {
  const { hackathon } = await requireParticipantOrOrganizerBySlug(slug, userId);
  const team = await getMyTeam(userId, hackathon.id);
  if (!team) throw new Error("Join a team first");
  const challenge = await db.query.challenges.findFirst({
    where: and(
      eq(challenges.id, challengeId),
      eq(challenges.hackathonId, hackathon.id),
    ),
  });
  if (!challenge) throw new Error("Challenge not found");
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
  return { teamId: team.id, challengeId };
}

export async function upsertSubmissionForTeam(
  userId: string,
  slug: string,
  input: {
    title: string;
    description?: string | null;
    repoUrl?: string | null;
    demoUrl?: string | null;
    videoUrl?: string | null;
  },
) {
  const { hackathon } = await requireParticipantOrOrganizerBySlug(slug, userId);
  const team = await getMyTeam(userId, hackathon.id);
  if (!team) throw new Error("Join a team first");

  const existing = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.hackathonId, hackathon.id),
      eq(submissions.teamId, team.id),
    ),
  });
  const payload = {
    title: input.title.trim() || "Untitled",
    description: input.description?.trim() || null,
    repoUrl: input.repoUrl?.trim() || null,
    demoUrl: input.demoUrl?.trim() || null,
    videoUrl: input.videoUrl?.trim() || null,
    updatedAt: new Date(),
  };
  if (existing) {
    await db
      .update(submissions)
      .set(payload)
      .where(eq(submissions.id, existing.id));
    return { id: existing.id, teamId: team.id, ...payload };
  }
  const id = createId("sub");
  await db.insert(submissions).values({
    id,
    hackathonId: hackathon.id,
    teamId: team.id,
    ...payload,
  });
  return { id, teamId: team.id, ...payload };
}

export async function getEventHome(userId: string, slug: string) {
  const { hackathon, memberships, isOrganizer } =
    await requireEventAccessBySlug(slug, userId);
  const [anns, chans, myTeam] = await Promise.all([
    db.query.announcements.findMany({
      where: eq(announcements.hackathonId, hackathon.id),
      orderBy: [desc(announcements.createdAt)],
    }),
    db.query.channels.findMany({
      where: eq(channels.hackathonId, hackathon.id),
    }),
    getMyTeam(userId, hackathon.id),
  ]);
  return {
    hackathon: {
      id: hackathon.id,
      slug: hackathon.slug,
      title: hackathon.title,
      status: hackathon.status,
    },
    memberships,
    isOrganizer,
    announcements: anns,
    channels: chans,
    myTeam,
  };
}

export async function sendDirectMessage(
  userId: string,
  slug: string,
  input: {
    recipientId: string;
    body: string;
    conversationId?: string | null;
  },
) {
  const { hackathon } = await requireEventAccessBySlug(slug, userId);
  const body = input.body.trim();
  if (!body) throw new Error("body required");

  let convId = input.conversationId ?? null;
  if (convId) {
    const conv = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, convId),
        eq(conversations.hackathonId, hackathon.id),
      ),
    });
    if (!conv) throw new Error("Conversation not found");
    const part = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, convId),
        eq(conversationParticipants.userId, userId),
      ),
    });
    if (!part) throw new Error("FORBIDDEN: not a conversation participant");
  } else {
    if (input.recipientId === userId) {
      throw new Error("Cannot message yourself");
    }
    await requireActiveEventMember(hackathon.id, input.recipientId);
    convId = createId("conv");
    await db.insert(conversations).values({
      id: convId,
      hackathonId: hackathon.id,
    });
    await db.insert(conversationParticipants).values([
      { id: createId("cp"), conversationId: convId, userId },
      {
        id: createId("cp"),
        conversationId: convId,
        userId: input.recipientId,
      },
    ]);
  }

  const msgId = createId("msg");
  await db.insert(messages).values({
    id: msgId,
    conversationId: convId,
    senderId: userId,
    body,
  });
  return { conversationId: convId, messageId: msgId };
}

export async function listMyConversations(userId: string, slug?: string) {
  const parts = await db.query.conversationParticipants.findMany({
    where: eq(conversationParticipants.userId, userId),
  });
  const result = [];
  for (const part of parts) {
    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, part.conversationId),
    });
    if (!conv) continue;
    if (slug) {
      const hackathon = await requireHackathonBySlug(slug);
      if (conv.hackathonId !== hackathon.id) continue;
    }
    const latest = await db.query.messages.findFirst({
      where: eq(messages.conversationId, conv.id),
      orderBy: [desc(messages.createdAt)],
    });
    const peers = await db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      })
      .from(conversationParticipants)
      .innerJoin(
        usersTable,
        eq(conversationParticipants.userId, usersTable.id),
      )
      .where(eq(conversationParticipants.conversationId, conv.id));
    result.push({
      conversationId: conv.id,
      hackathonId: conv.hackathonId,
      participants: peers,
      latestMessage: latest,
    });
  }
  return result;
}

export async function getConversationMessages(
  userId: string,
  conversationId: string,
) {
  const part = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId),
    ),
  });
  if (!part) throw new Error("FORBIDDEN");
  return db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [desc(messages.createdAt)],
  });
}

// ─── Profile / discovery ────────────────────────────────────────────────────

export async function getMyProfile(userId: string) {
  const user = await db.query.user.findFirst({
    where: eq(usersTable.id, userId),
  });
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  return { user, profile };
}

export async function updateMyProfile(
  userId: string,
  input: {
    name?: string;
    nickname?: string | null;
    bio?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    lookingForTeam?: boolean;
    skills?: string[];
    interests?: string[];
    preferredRoles?: string[];
    experienceLevel?: string | null;
  },
) {
  if (input.name?.trim()) {
    await db
      .update(usersTable)
      .set({ name: input.name.trim(), updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
  }
  const profileData = {
    nickname: input.nickname ?? null,
    bio: input.bio ?? null,
    githubUrl: input.githubUrl ?? null,
    linkedinUrl: input.linkedinUrl ?? null,
    lookingForTeam: input.lookingForTeam ?? false,
    skills: input.skills ?? [],
    interests: input.interests ?? [],
    preferredRoles: input.preferredRoles ?? [],
    experienceLevel: input.experienceLevel ?? null,
    updatedAt: new Date(),
  };
  await db
    .insert(profiles)
    .values({ userId, ...profileData })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: profileData,
    });
  return getMyProfile(userId);
}

export async function listPublishedEvents(query?: string) {
  if (query?.trim()) {
    return db.query.hackathons.findMany({
      where: and(
        eq(hackathons.status, "published"),
        or(
          ilike(hackathons.title, `%${query.trim()}%`),
          ilike(hackathons.tagline, `%${query.trim()}%`),
        ),
      ),
    });
  }
  return db.query.hackathons.findMany({
    where: eq(hackathons.status, "published"),
  });
}
