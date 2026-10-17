import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCoverImage } from "@/lib/ai/hackathon";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  prompt: z.string().min(8),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    const image = await generateCoverImage(body.prompt);
    return NextResponse.json(image);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
