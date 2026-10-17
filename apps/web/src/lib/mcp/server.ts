import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@hackhost/db";
import { hackathons } from "@hackhost/db/schema";
import { generateCoverImage, generateHackathonBrief } from "@/lib/ai/hackathon";
import {
  createHackathonForUser,
  getHackathonBundle,
  getHackathonOwnedByUser,
  listHackathonsForUser,
  updateHackathonMarketingForUser,
} from "@/lib/services/hackathons";

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

export function createHackhostMcpHandler(getUserId: () => string) {
  return createMcpHandler(
    () => {
      const server = new McpServer({
        name: "hackhost",
        version: "0.1.0",
      });

      server.registerTool(
        "generate_hackathon_brief",
        {
          description:
            "Use ChatGPT to draft a full hackathon package: copy, tracks, prizes, FAQ, schedule, and a cover image prompt.",
          inputSchema: z.object({
            idea: z.string().describe("One-sentence hackathon idea"),
            city: z.string().optional(),
            startsAt: z.string().optional().describe("ISO-8601 start"),
            endsAt: z.string().optional().describe("ISO-8601 end"),
            vibe: z.string().optional(),
          }),
        },
        async (args) => {
          try {
            const brief = await generateHackathonBrief(args);
            return textResult(brief);
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      server.registerTool(
        "generate_cover_image",
        {
          description:
            "Generate a full-bleed hackathon cover image from a prompt (OpenAI Images).",
          inputSchema: z.object({
            prompt: z.string(),
            slug: z
              .string()
              .optional()
              .describe("If set, also save coverUrl on this owned hackathon"),
          }),
        },
        async ({ prompt, slug }) => {
          try {
            const image = await generateCoverImage(prompt);
            if (slug) {
              const userId = getUserId();
              await updateHackathonMarketingForUser(userId, slug, {
                coverUrl: image.url,
              });
            }
            return textResult(image);
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      server.registerTool(
        "create_hackathon",
        {
          description:
            "Create a draft hackathon (and optional marketing package) for the authenticated organizer. Set withAi+idea to generate everything with ChatGPT (title optional then).",
          inputSchema: z.object({
            title: z
              .string()
              .optional()
              .describe("Required unless withAi is true"),
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
            withAi: z
              .boolean()
              .optional()
              .describe(
                "If true, generate a full brief from `idea` then create the event",
              ),
            idea: z
              .string()
              .optional()
              .describe("Required when withAi is true"),
            city: z.string().optional(),
            vibe: z.string().optional(),
            generateCover: z
              .boolean()
              .optional()
              .describe("When withAi, also generate and attach a cover image"),
          }),
        },
        async (args) => {
          try {
            const userId = getUserId();
            let payload = { ...args };

            if (args.withAi) {
              if (!args.idea) {
                throw new Error("idea is required when withAi is true");
              }
              const brief = await generateHackathonBrief({
                idea: args.idea,
                city: args.city,
                startsAt: args.startsAt,
                endsAt: args.endsAt,
                vibe: args.vibe,
              });
              payload = {
                ...brief,
                ...args,
                title: args.title || brief.title,
                tagline: args.tagline ?? brief.tagline,
                description: args.description ?? brief.description,
                location: args.location ?? brief.location,
                mode: args.mode ?? brief.mode,
                joinMode: args.joinMode ?? brief.joinMode,
                highlights: args.highlights ?? brief.highlights,
                faq: args.faq ?? brief.faq,
                prizes: args.prizes ?? brief.prizes,
                sponsors: args.sponsors ?? brief.sponsors,
                tracks: args.tracks ?? brief.tracks,
                challenges: args.challenges ?? brief.challenges,
                schedule: args.schedule ?? brief.schedule,
              };

              if (args.generateCover !== false) {
                const image = await generateCoverImage(brief.coverPrompt);
                payload.coverUrl = args.coverUrl ?? image.url;
              }
            }

            if (!payload.title?.trim()) {
              throw new Error("title is required (or set withAi + idea)");
            }

            const created = await createHackathonForUser(userId, {
              title: payload.title,
              slug: payload.slug,
              tagline: payload.tagline,
              description: payload.description,
              coverUrl: payload.coverUrl,
              location: payload.location,
              mode: payload.mode,
              joinMode: payload.joinMode,
              capacity: payload.capacity,
              startsAt: payload.startsAt,
              endsAt: payload.endsAt,
              status: payload.status ?? "draft",
              codeOfConduct: payload.codeOfConduct,
              highlights: payload.highlights,
              faq: payload.faq,
              prizes: payload.prizes,
              sponsors: payload.sponsors,
              tracks: payload.tracks,
              challenges: payload.challenges,
              schedule: payload.schedule,
            });

            const appUrl =
              process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
            return textResult({
              ...created,
              urls: {
                landing: `${appUrl}/e/${created.slug}`,
                manage: `${appUrl}/e/${created.slug}/manage`,
                marketing: `${appUrl}/e/${created.slug}/manage/page`,
              },
            });
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      server.registerTool(
        "update_hackathon",
        {
          description:
            "Update marketing/settings for a hackathon you organize.",
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
        async (args) => {
          try {
            const { slug, ...rest } = args;
            const updated = await updateHackathonMarketingForUser(
              getUserId(),
              slug,
              rest,
            );
            return textResult(updated);
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      server.registerTool(
        "publish_hackathon",
        {
          description: "Set a hackathon status to published.",
          inputSchema: z.object({ slug: z.string() }),
        },
        async ({ slug }) => {
          try {
            const updated = await updateHackathonMarketingForUser(
              getUserId(),
              slug,
              { status: "published" },
            );
            return textResult(updated);
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      server.registerTool(
        "list_my_hackathons",
        {
          description: "List hackathons where the authenticated user is active.",
          inputSchema: z.object({}),
        },
        async () => {
          try {
            return textResult(await listHackathonsForUser(getUserId()));
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      server.registerTool(
        "get_hackathon",
        {
          description:
            "Fetch a hackathon bundle (page blocks, prizes, sponsors, tracks, challenges, schedule).",
          inputSchema: z.object({
            slug: z.string(),
            requireOrganizer: z
              .boolean()
              .optional()
              .describe("If true, require organizer membership"),
          }),
        },
        async ({ slug, requireOrganizer }) => {
          try {
            if (requireOrganizer) {
              await getHackathonOwnedByUser(slug, getUserId());
            }
            const bundle = await getHackathonBundle(slug);
            if (!bundle) throw new Error("Not found");
            return textResult(bundle);
          } catch (error) {
            return errorResult(error);
          }
        },
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
        async ({ slug, status }) => {
          try {
            const hackathon = await getHackathonOwnedByUser(slug, getUserId());
            if (!hackathon) throw new Error("Not found");
            await db
              .update(hackathons)
              .set({ status, updatedAt: new Date() })
              .where(eq(hackathons.id, hackathon.id));
            return textResult({ slug, status });
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      return server;
    },
    {
      legacy: "reject",
    },
  );
}
