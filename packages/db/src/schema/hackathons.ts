import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const hackathonStatusEnum = pgEnum("hackathon_status", [
  "draft",
  "published",
  "archived",
]);

export const joinModeEnum = pgEnum("join_mode", [
  "open",
  "apply",
  "invite_only",
]);

export const eventModeEnum = pgEnum("event_mode", [
  "in_person",
  "online",
  "hybrid",
]);

export const membershipRoleEnum = pgEnum("membership_role", [
  "organizer",
  "participant",
  "judge",
  "mentor",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "invited",
  "pending",
  "active",
  "waitlisted",
  "rejected",
]);

export const inviteTypeEnum = pgEnum("invite_type", [
  "co_organizer",
  "team",
  "judge",
  "mentor",
]);

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  nickname: text("nickname"),
  bio: text("bio"),
  skills: jsonb("skills").$type<string[]>().default([]),
  interests: jsonb("interests").$type<string[]>().default([]),
  preferredRoles: jsonb("preferred_roles").$type<string[]>().default([]),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  lookingForTeam: boolean("looking_for_team").notNull().default(false),
  experienceLevel: text("experience_level"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const hackathons = pgTable(
  "hackathons",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    coverUrl: text("cover_url"),
    mode: eventModeEnum("mode").notNull().default("in_person"),
    location: text("location"),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    status: hackathonStatusEnum("status").notNull().default("draft"),
    joinMode: joinModeEnum("join_mode").notNull().default("open"),
    capacity: integer("capacity"),
    codeOfConduct: text("code_of_conduct"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("hackathons_slug_idx").on(t.slug)],
);

export const hackathonMemberships = pgTable(
  "hackathon_memberships",
  {
    id: text("id").primaryKey(),
    hackathonId: text("hackathon_id")
      .notNull()
      .references(() => hackathons.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull().default("participant"),
    status: membershipStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("membership_hackathon_user_role_idx").on(
      t.hackathonId,
      t.userId,
      t.role,
    ),
  ],
);

export const hackathonPageBlocks = pgTable("hackathon_page_blocks", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sponsors = pgTable("sponsors", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  url: text("url"),
  tier: text("tier").default("partner"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const prizes = pgTable("prizes", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  value: text("value"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tracks = pgTable("tracks", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const registrationQuestions = pgTable("registration_questions", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull().default("text"),
  required: boolean("required").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const registrationAnswers = pgTable("registration_answers", {
  id: text("id").primaryKey(),
  membershipId: text("membership_id")
    .notNull()
    .references(() => hackathonMemberships.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => registrationQuestions.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
});

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  lookingForMembers: boolean("looking_for_members").notNull().default(true),
  maxMembers: integer("max_members").notNull().default(4),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("team_member_unique").on(t.teamId, t.userId)],
);

export const inviteTokens = pgTable("invite_tokens", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  type: inviteTypeEnum("type").notNull(),
  hackathonId: text("hackathon_id").references(() => hackathons.id, {
    onDelete: "cascade",
  }),
  teamId: text("team_id").references(() => teams.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sponsorName: text("sponsor_name"),
  attachmentUrl: text("attachment_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const challengeSelections = pgTable(
  "challenge_selections",
  {
    id: text("id").primaryKey(),
    challengeId: text("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("challenge_team_unique").on(t.challengeId, t.teamId)],
);

export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  videoUrl: text("video_url"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scheduleItems = pgTable("schedule_items", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const channels = pgTable("channels", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const checkIns = pgTable(
  "check_ins",
  {
    id: text("id").primaryKey(),
    hackathonId: text("hackathon_id")
      .notNull()
      .references(() => hackathons.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    checkedInAt: timestamp("checked_in_at").notNull().defaultNow(),
    method: text("method").notNull().default("code"),
  },
  (t) => [uniqueIndex("checkin_unique").on(t.hackathonId, t.userId)],
);

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id").references(() => hackathons.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("conversation_participant_unique").on(
      t.conversationId,
      t.userId,
    ),
  ],
);

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const matchProfiles = pgTable("match_profiles", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  roles: jsonb("roles").$type<string[]>().default([]),
  skills: jsonb("skills").$type<string[]>().default([]),
  goals: text("goals"),
  lookingFor: text("looking_for"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const judgingScores = pgTable(
  "judging_scores",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    judgeId: text("judge_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    feedback: text("feedback"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("judge_submission_unique").on(t.submissionId, t.judgeId)],
);

export const rateLimits = pgTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start").notNull().defaultNow(),
});
