import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@hackhost/db";
import { hackathons } from "@hackhost/db/schema";
import { storeImageUpload } from "@/lib/uploads/storage";
import {
  createHackathonForUser,
  getHackathonBundle,
  getHackathonOwnedByUser,
  listHackathonsForUser,
  updateHackathonMarketingForUser,
} from "@/lib/services/hackathons";
import {
  requireOrganizerBySlug,
  requireReadableHackathonBySlug,
} from "@/lib/services/access";
import * as ops from "@/lib/services/event-ops";

function textResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

function wrap<TArgs>(
  fn: (args: TArgs) => Promise<unknown>,
): (args: TArgs) => Promise<ReturnType<typeof textResult> | ReturnType<typeof errorResult>> {
  return async (args) => {
    try {
      return textResult(await fn(args));
    } catch (error) {
      return errorResult(error);
    }
  };
}

/**
 * Hackhost MCP server — dashboard parity for organizers and participants.
 * Any MCP-capable AI client can manage events end-to-end via OAuth.
 */
export function createHackhostMcpHandler(getUserId: () => string) {
  return createMcpHandler(
    () => {
      const server = new McpServer({
        name: "hackhost",
        version: "0.3.0",
      });

      // ── Images & marketing ───────────────────────────────────────────────

      server.registerTool(
        "upload_image",
        {
          description:
            "Upload an image (base64 or data URL) for covers, sponsor logos, or attachments. Returns a public URL. Optionally set coverUrl on an owned hackathon via `slug`.",
          inputSchema: z.object({
            dataBase64: z
              .string()
              .describe("Raw base64 bytes or a data:image/...;base64,... URL"),
            mimeType: z.enum([
              "image/jpeg",
              "image/png",
              "image/webp",
              "image/gif",
            ]),
            filename: z.string().optional(),
            slug: z
              .string()
              .optional()
              .describe("If set, also update this owned hackathon's coverUrl"),
          }),
        },
        wrap(async ({ dataBase64, mimeType, filename, slug }) => {
          const userId = getUserId();
          const stored = await storeImageUpload({
            userId,
            dataBase64,
            mimeType,
            filename,
          });
          if (slug) {
            await updateHackathonMarketingForUser(userId, slug, {
              coverUrl: stored.url,
            });
          }
          return { ...stored, attachedToSlug: slug ?? null };
        }),
      );

      server.registerTool(
        "create_hackathon",
        {
          description:
            "Create a draft hackathon for the authenticated organizer. Upload covers first with upload_image, then pass coverUrl.",
          inputSchema: z.object({
            title: z.string(),
            slug: z.string().optional(),
            tagline: z.string().optional(),
            description: z.string().optional(),
            coverUrl: z.string().optional(),
            location: z.string().optional(),
            mode: z.enum(["in_person", "online", "hybrid"]).optional(),
            joinMode: z.enum(["open", "apply", "invite_only"]).optional(),
            capacity: z.number().int().positive().optional(),
            startsAt: z.string().optional(),
            endsAt: z.string().optional(),
            status: z.enum(["draft", "published", "archived"]).optional(),
            codeOfConduct: z.string().optional(),
            highlights: z.array(z.string()).optional(),
            faq: z
              .array(z.object({ q: z.string(), a: z.string() }))
              .optional(),
            prizes: z
              .array(
                z.object({
                  title: z.string(),
                  value: z.string().optional(),
                  description: z.string().optional(),
                }),
              )
              .optional(),
            sponsors: z
              .array(
                z.object({
                  name: z.string(),
                  tier: z.string().optional(),
                  url: z.string().optional(),
                  logoUrl: z.string().optional(),
                }),
              )
              .optional(),
            tracks: z
              .array(
                z.object({
                  name: z.string(),
                  description: z.string().optional(),
                }),
              )
              .optional(),
            challenges: z
              .array(
                z.object({
                  title: z.string(),
                  description: z.string().optional(),
                  sponsorName: z.string().optional(),
                }),
              )
              .optional(),
            schedule: z
              .array(
                z.object({
                  title: z.string(),
                  description: z.string().optional(),
                  location: z.string().optional(),
                  startsAt: z.string(),
                  endsAt: z.string().optional(),
                }),
              )
              .optional(),
          }),
        },
        wrap(async (args) => {
          const created = await createHackathonForUser(getUserId(), {
            ...args,
            status: args.status ?? "draft",
          });
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
          return {
            ...created,
            urls: {
              landing: `${appUrl}/e/${created.slug}`,
              manage: `${appUrl}/e/${created.slug}/manage`,
              marketing: `${appUrl}/e/${created.slug}/manage/page`,
            },
          };
        }),
      );

      server.registerTool(
        "update_hackathon",
        {
          description:
            "Update marketing/settings for a hackathon you organize. Use upload_image first when changing covers.",
          inputSchema: z.object({
            slug: z.string(),
            title: z.string().optional(),
            tagline: z.string().optional(),
            description: z.string().optional(),
            coverUrl: z.string().optional(),
            location: z.string().optional(),
            mode: z.enum(["in_person", "online", "hybrid"]).optional(),
            joinMode: z.enum(["open", "apply", "invite_only"]).optional(),
            capacity: z.number().int().positive().nullable().optional(),
            status: z.enum(["draft", "published", "archived"]).optional(),
            codeOfConduct: z.string().optional(),
            startsAt: z.string().nullable().optional(),
            endsAt: z.string().nullable().optional(),
            highlights: z.array(z.string()).optional(),
            faq: z
              .array(z.object({ q: z.string(), a: z.string() }))
              .optional(),
            prizes: z
              .array(
                z.object({
                  title: z.string(),
                  value: z.string().optional(),
                  description: z.string().optional(),
                }),
              )
              .optional(),
            sponsors: z
              .array(
                z.object({
                  name: z.string(),
                  tier: z.string().optional(),
                  url: z.string().optional(),
                }),
              )
              .optional(),
            tracks: z
              .array(
                z.object({
                  name: z.string(),
                  description: z.string().optional(),
                }),
              )
              .optional(),
          }),
        },
        wrap(async (args) => {
          const { slug, ...rest } = args;
          return updateHackathonMarketingForUser(getUserId(), slug, rest);
        }),
      );

      server.registerTool(
        "publish_hackathon",
        {
          description: "Set a hackathon status to published.",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) =>
          updateHackathonMarketingForUser(getUserId(), slug, {
            status: "published",
          }),
        ),
      );

      server.registerTool(
        "set_hackathon_status",
        {
          description: "Set draft | published | archived on an owned event.",
          inputSchema: z.object({
            slug: z.string(),
            status: z.enum(["draft", "published", "archived"]),
          }),
        },
        wrap(async ({ slug, status }) => {
          const hackathon = await getHackathonOwnedByUser(slug, getUserId());
          if (!hackathon) throw new Error("Not found");
          await db
            .update(hackathons)
            .set({ status, updatedAt: new Date() })
            .where(eq(hackathons.id, hackathon.id));
          return { slug, status };
        }),
      );

      server.registerTool(
        "list_my_hackathons",
        {
          description:
            "List hackathons where the authenticated user is an active member (organizer, participant, judge, mentor).",
          inputSchema: z.object({}),
        },
        wrap(async () => listHackathonsForUser(getUserId())),
      );

      server.registerTool(
        "get_hackathon",
        {
          description:
            "Fetch a hackathon bundle (page blocks, prizes, sponsors, tracks, challenges, schedule). Published events are readable by any auth user; drafts/archived require organizer. Set requireOrganizer to force organizer check.",
          inputSchema: z.object({
            slug: z.string(),
            requireOrganizer: z.boolean().optional(),
          }),
        },
        wrap(async ({ slug, requireOrganizer }) => {
          const userId = getUserId();
          if (requireOrganizer) {
            await requireOrganizerBySlug(slug, userId);
          } else {
            await requireReadableHackathonBySlug(slug, userId);
          }
          const bundle = await getHackathonBundle(slug);
          if (!bundle) throw new Error("Not found");
          return bundle;
        }),
      );

      server.registerTool(
        "list_published_events",
        {
          description:
            "Discover published hackathons (participant discovery). Optional search query.",
          inputSchema: z.object({
            query: z.string().optional(),
          }),
        },
        wrap(async ({ query }) => ops.listPublishedEvents(query)),
      );

      // ── Organizer: overview & people ─────────────────────────────────────

      server.registerTool(
        "get_event_overview",
        {
          description:
            "Organizer dashboard overview: membership breakdown, team/submission/check-in counts.",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.getEventOverview(getUserId(), slug)),
      );

      server.registerTool(
        "list_people",
        {
          description: "List all memberships (people) for an event you organize.",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.listPeople(getUserId(), slug)),
      );

      server.registerTool(
        "update_membership_status",
        {
          description:
            "Approve/reject/waitlist a membership (organizer). Use after applications.",
          inputSchema: z.object({
            slug: z.string(),
            membershipId: z.string(),
            status: z.enum(["active", "rejected", "waitlisted"]),
          }),
        },
        wrap(async ({ slug, membershipId, status }) =>
          ops.updateMembershipStatusForOrganizer(
            getUserId(),
            slug,
            membershipId,
            status,
          ),
        ),
      );

      server.registerTool(
        "export_people_csv",
        {
          description: "Export people roster as CSV text (organizer).",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.exportPeopleCsvForOrganizer(getUserId(), slug)),
      );

      // ── Channels, announcements, challenges, schedule ────────────────────

      server.registerTool(
        "list_channels",
        {
          description: "List community channels for an event (members).",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.listChannels(getUserId(), slug)),
      );

      server.registerTool(
        "add_channel",
        {
          description: "Add a Slack/Discord/etc. channel link (organizer).",
          inputSchema: z.object({
            slug: z.string(),
            label: z.string(),
            url: z.string(),
          }),
        },
        wrap(async ({ slug, label, url }) =>
          ops.addChannelForOrganizer(getUserId(), slug, { label, url }),
        ),
      );

      server.registerTool(
        "list_announcements",
        {
          description: "List announcements for an event (members).",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.listAnnouncements(getUserId(), slug)),
      );

      server.registerTool(
        "create_announcement",
        {
          description: "Post an announcement (organizer).",
          inputSchema: z.object({
            slug: z.string(),
            title: z.string(),
            body: z.string(),
          }),
        },
        wrap(async ({ slug, title, body }) =>
          ops.createAnnouncementForOrganizer(getUserId(), slug, { title, body }),
        ),
      );

      server.registerTool(
        "create_challenge",
        {
          description: "Create a sponsor/track challenge (organizer).",
          inputSchema: z.object({
            slug: z.string(),
            title: z.string(),
            description: z.string().optional(),
            sponsorName: z.string().optional(),
            attachmentUrl: z.string().optional(),
          }),
        },
        wrap(async ({ slug, ...input }) =>
          ops.createChallengeForOrganizer(getUserId(), slug, input),
        ),
      );

      server.registerTool(
        "add_schedule_item",
        {
          description: "Add a schedule session (organizer).",
          inputSchema: z.object({
            slug: z.string(),
            title: z.string(),
            description: z.string().optional(),
            location: z.string().optional(),
            startsAt: z.string().describe("ISO datetime"),
            endsAt: z.string().optional(),
          }),
        },
        wrap(async ({ slug, ...input }) =>
          ops.addScheduleItemForOrganizer(getUserId(), slug, input),
        ),
      );

      // ── Invites ──────────────────────────────────────────────────────────

      server.registerTool(
        "create_invite",
        {
          description:
            "Create an invite link. Organizer for co_organizer/judge/mentor; team member or organizer for team invites.",
          inputSchema: z.object({
            slug: z.string(),
            type: z.enum(["co_organizer", "team", "judge", "mentor"]),
            teamId: z
              .string()
              .optional()
              .describe("Required when type is team"),
          }),
        },
        wrap(async ({ slug, type, teamId }) =>
          ops.createInviteForUser(getUserId(), slug, type, teamId),
        ),
      );

      server.registerTool(
        "accept_invite",
        {
          description: "Accept an invite token (join as co-organizer, judge, mentor, or team).",
          inputSchema: z.object({ token: z.string() }),
        },
        wrap(async ({ token }) => ops.acceptInviteToken(getUserId(), token)),
      );

      // ── Teams, submissions, check-in, judging ────────────────────────────

      server.registerTool(
        "list_teams",
        {
          description: "List teams and members for an event (members).",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.listTeamsForEvent(getUserId(), slug)),
      );

      server.registerTool(
        "list_submissions",
        {
          description:
            "List submissions. Organizers/judges see all; participants see their team only.",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.listSubmissionsForEvent(getUserId(), slug)),
      );

      server.registerTool(
        "check_in_user",
        {
          description: "Check in a participant by user id (organizer).",
          inputSchema: z.object({
            slug: z.string(),
            userId: z.string().describe("Target user id to check in"),
          }),
        },
        wrap(async ({ slug, userId }) =>
          ops.checkInUserForOrganizer(getUserId(), slug, userId),
        ),
      );

      server.registerTool(
        "list_check_ins",
        {
          description: "List check-ins for an event (organizer).",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.listCheckIns(getUserId(), slug)),
      );

      server.registerTool(
        "score_submission",
        {
          description: "Score a submission 0–100 (judge or organizer).",
          inputSchema: z.object({
            slug: z.string(),
            submissionId: z.string(),
            score: z.number().min(0).max(100),
            feedback: z.string().optional(),
          }),
        },
        wrap(async ({ slug, submissionId, score, feedback }) =>
          ops.scoreSubmissionForJudge(
            getUserId(),
            slug,
            submissionId,
            score,
            feedback,
          ),
        ),
      );

      server.registerTool(
        "list_judging_scores",
        {
          description: "List submissions and judging scores (judge or organizer).",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.listJudgingScores(getUserId(), slug)),
      );

      // ── Participant ──────────────────────────────────────────────────────

      server.registerTool(
        "register_for_event",
        {
          description:
            "Register as a participant for a published event (open/apply modes).",
          inputSchema: z.object({
            slug: z.string(),
            nickname: z.string().optional(),
          }),
        },
        wrap(async ({ slug, nickname }) =>
          ops.registerForEvent(getUserId(), slug, { nickname }),
        ),
      );

      server.registerTool(
        "get_event_home",
        {
          description:
            "Participant/organizer event home: announcements, channels, my team, memberships.",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) => ops.getEventHome(getUserId(), slug)),
      );

      server.registerTool(
        "create_team",
        {
          description: "Create a team and join as leader (participant).",
          inputSchema: z.object({
            slug: z.string(),
            name: z.string(),
            description: z.string().optional(),
            maxMembers: z.number().int().positive().optional(),
            lookingForMembers: z.boolean().optional(),
          }),
        },
        wrap(async ({ slug, ...input }) =>
          ops.createTeamForUser(getUserId(), slug, input),
        ),
      );

      server.registerTool(
        "upsert_match_profile",
        {
          description: "Create/update teammate-matching profile for an event.",
          inputSchema: z.object({
            slug: z.string(),
            roles: z.array(z.string()).optional(),
            skills: z.array(z.string()).optional(),
            goals: z.string().optional(),
            lookingFor: z.string().optional(),
          }),
        },
        wrap(async ({ slug, ...input }) =>
          ops.upsertMatchProfileForUser(getUserId(), slug, input),
        ),
      );

      server.registerTool(
        "list_match_profiles",
        {
          description:
            "List match profiles ranked by skill overlap with yours (members).",
          inputSchema: z.object({ slug: z.string() }),
        },
        wrap(async ({ slug }) =>
          ops.listMatchProfilesForEvent(getUserId(), slug),
        ),
      );

      server.registerTool(
        "select_challenge",
        {
          description: "Select a challenge for your team (participant).",
          inputSchema: z.object({
            slug: z.string(),
            challengeId: z.string(),
          }),
        },
        wrap(async ({ slug, challengeId }) =>
          ops.selectChallengeForTeam(getUserId(), slug, challengeId),
        ),
      );

      server.registerTool(
        "upsert_submission",
        {
          description: "Create or update your team's project submission.",
          inputSchema: z.object({
            slug: z.string(),
            title: z.string(),
            description: z.string().optional(),
            repoUrl: z.string().optional(),
            demoUrl: z.string().optional(),
            videoUrl: z.string().optional(),
          }),
        },
        wrap(async ({ slug, ...input }) =>
          ops.upsertSubmissionForTeam(getUserId(), slug, input),
        ),
      );

      server.registerTool(
        "send_direct_message",
        {
          description: "Send a DM to another member (creates conversation if needed).",
          inputSchema: z.object({
            slug: z.string(),
            recipientId: z.string(),
            body: z.string(),
            conversationId: z.string().optional(),
          }),
        },
        wrap(async ({ slug, ...input }) =>
          ops.sendDirectMessage(getUserId(), slug, input),
        ),
      );

      server.registerTool(
        "list_conversations",
        {
          description: "List your conversations, optionally filtered by event slug.",
          inputSchema: z.object({
            slug: z.string().optional(),
          }),
        },
        wrap(async ({ slug }) => ops.listMyConversations(getUserId(), slug)),
      );

      server.registerTool(
        "get_conversation_messages",
        {
          description: "Fetch messages in a conversation you participate in.",
          inputSchema: z.object({
            conversationId: z.string(),
          }),
        },
        wrap(async ({ conversationId }) =>
          ops.getConversationMessages(getUserId(), conversationId),
        ),
      );

      // ── Profile ──────────────────────────────────────────────────────────

      server.registerTool(
        "get_my_profile",
        {
          description: "Get the authenticated user's account + profile.",
          inputSchema: z.object({}),
        },
        wrap(async () => ops.getMyProfile(getUserId())),
      );

      server.registerTool(
        "update_my_profile",
        {
          description: "Update name, bio, skills, links, looking-for-team, etc.",
          inputSchema: z.object({
            name: z.string().optional(),
            nickname: z.string().optional(),
            bio: z.string().optional(),
            githubUrl: z.string().optional(),
            linkedinUrl: z.string().optional(),
            lookingForTeam: z.boolean().optional(),
            skills: z.array(z.string()).optional(),
            interests: z.array(z.string()).optional(),
            preferredRoles: z.array(z.string()).optional(),
            experienceLevel: z.string().optional(),
          }),
        },
        wrap(async (input) => ops.updateMyProfile(getUserId(), input)),
      );

      return server;
    },
    {
      legacy: "reject",
    },
  );
}
