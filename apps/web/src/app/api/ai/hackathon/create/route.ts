import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCoverImage, generateHackathonBrief } from "@/lib/ai/hackathon";
import { createHackathonForUser } from "@/lib/services/hackathons";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  idea: z.string().min(3),
  city: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  vibe: z.string().optional(),
  generateCover: z.boolean().optional().default(true),
  publish: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    const brief = await generateHackathonBrief(body);

    let coverUrl: string | undefined;
    if (body.generateCover) {
      const image = await generateCoverImage(brief.coverPrompt);
      coverUrl = image.url;
    }

    const created = await createHackathonForUser(session.user.id, {
      ...brief,
      coverUrl,
      startsAt: body.startsAt ?? brief.schedule[0]?.startsAt,
      endsAt: body.endsAt ?? brief.schedule.at(-1)?.endsAt,
      status: body.publish ? "published" : "draft",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.json({
      ...created,
      brief,
      coverUrl,
      urls: {
        landing: `${appUrl}/e/${created.slug}`,
        manage: `${appUrl}/e/${created.slug}/manage`,
        marketing: `${appUrl}/e/${created.slug}/manage/page`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Creation failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
