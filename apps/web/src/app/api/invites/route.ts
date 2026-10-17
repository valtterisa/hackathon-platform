import { createInvite } from "@/lib/actions/hackathons";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug: string;
    type: "co_organizer" | "team" | "judge" | "mentor";
    teamId?: string;
  };
  const token = await createInvite(body.slug, body.type, body.teamId);
  return NextResponse.json({ token });
}
