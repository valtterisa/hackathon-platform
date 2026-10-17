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

/**
 * Hackhost MCP server for any MCP-capable AI client (Cursor, Claude, ChatGPT
 * apps, custom agents, etc.). The client LLM authors content; tools persist it.
 */
export function createHackhostMcpHandler(getUserId: () => string) {
  return createMcpHandler(
    () => {
      const server = new McpServer({
        name: "hackhost",
        version: "0.2.0",
      });

      server.registerTool(
        "upload_image",
        {
          description:
            "Upload an image (base64 or data URL) for use as a hackathon cover, sponsor logo, or attachment. Returns a public URL. Optionally set it as coverUrl on an owned hackathon via `slug`.",
          inputSchema: z.object({
            dataBase64: z
              .string()
              .describe("Raw base64 bytes or a data:image/...;base64,... URL"),
            mimeType: z
              .enum(["image/jpeg", "image/png", "image/webp", "image/gif"])
              .describe("Image MIME type"),
            filename: z.string().optional().describe("Original filename hint"),
            slug: z
              .string()
              .optional()
              .describe(
                "If set, also update this owned hackathon's coverUrl to the uploaded URL",
              ),
          }),
        },
        async ({ dataBase64, mimeType, filename, slug }) => {
          try {
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

            return textResult({
              ...stored,
              attachedToSlug: slug ?? null,
            });
          } catch (error) {
            return errorResult(error);
          }
        },
      );

      server.registerTool(
        "create_hackathon",
        {
          description:
            "Create a draft hackathon for the authenticated organizer. The AI client should supply title, copy, tracks, prizes, schedule, etc. Upload covers first with upload_image, then pass coverUrl.",
          inputSchema: z.object({
            title: z.string(),
            slug: z.string().optional(),
            tagline: z.string().optional(),
            description: z.string().optional(),
            coverUrl: z
              .string()
              .optional()
              .describe("Public URL from upload_image (or any https URL)"),
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
        async (args) => {
          try {
            const userId = getUserId();
            const created = await createHackathonForUser(userId, {
              title: args.title,
              slug: args.slug,
              tagline: args.tagline,
              description: args.description,
              coverUrl: args.coverUrl,
              location: args.location,
              mode: args.mode,
              joinMode: args.joinMode,
              capacity: args.capacity,
              startsAt: args.startsAt,
              endsAt: args.endsAt,
              status: args.status ?? "draft",
              codeOfConduct: args.codeOfConduct,
              highlights: args.highlights,
              faq: args.faq,
              prizes: args.prizes,
              sponsors: args.sponsors,
              tracks: args.tracks,
              challenges: args.challenges,
              schedule: args.schedule,
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
          description:
            "List hackathons where the authenticated user is an active member.",
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
