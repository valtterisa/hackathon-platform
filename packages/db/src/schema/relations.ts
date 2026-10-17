import { relations } from "drizzle-orm";
import { account, session, user } from "./auth";
import {
  challengeSelections,
  challenges,
  conversationParticipants,
  conversations,
  hackathonMemberships,
  hackathonPageBlocks,
  hackathons,
  inviteTokens,
  judgingScores,
  matchProfiles,
  messages,
  prizes,
  profiles,
  scheduleItems,
  sponsors,
  submissions,
  teamMembers,
  teams,
  tracks,
} from "./hackathons";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(profiles),
  memberships: many(hackathonMemberships),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(user, { fields: [profiles.userId], references: [user.id] }),
}));

export const hackathonsRelations = relations(hackathons, ({ many, one }) => ({
  creator: one(user, { fields: [hackathons.createdBy], references: [user.id] }),
  memberships: many(hackathonMemberships),
  blocks: many(hackathonPageBlocks),
  sponsors: many(sponsors),
  prizes: many(prizes),
  tracks: many(tracks),
  teams: many(teams),
  challenges: many(challenges),
  scheduleItems: many(scheduleItems),
  submissions: many(submissions),
}));

export const hackathonMembershipsRelations = relations(
  hackathonMemberships,
  ({ one }) => ({
    hackathon: one(hackathons, {
      fields: [hackathonMemberships.hackathonId],
      references: [hackathons.id],
    }),
    user: one(user, {
      fields: [hackathonMemberships.userId],
      references: [user.id],
    }),
  }),
);

export const teamsRelations = relations(teams, ({ many, one }) => ({
  hackathon: one(hackathons, {
    fields: [teams.hackathonId],
    references: [hackathons.id],
  }),
  members: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(user, { fields: [teamMembers.userId], references: [user.id] }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(user, {
      fields: [conversationParticipants.userId],
      references: [user.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(user, { fields: [messages.senderId], references: [user.id] }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  selections: many(challengeSelections),
}));

export const challengeSelectionsRelations = relations(
  challengeSelections,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeSelections.challengeId],
      references: [challenges.id],
    }),
    team: one(teams, {
      fields: [challengeSelections.teamId],
      references: [teams.id],
    }),
  }),
);

export const submissionsRelations = relations(submissions, ({ many, one }) => ({
  team: one(teams, { fields: [submissions.teamId], references: [teams.id] }),
  scores: many(judgingScores),
}));

export const inviteTokensRelations = relations(inviteTokens, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [inviteTokens.hackathonId],
    references: [hackathons.id],
  }),
  team: one(teams, { fields: [inviteTokens.teamId], references: [teams.id] }),
}));

export const matchProfilesRelations = relations(matchProfiles, ({ one }) => ({
  user: one(user, { fields: [matchProfiles.userId], references: [user.id] }),
  hackathon: one(hackathons, {
    fields: [matchProfiles.hackathonId],
    references: [hackathons.id],
  }),
}));
