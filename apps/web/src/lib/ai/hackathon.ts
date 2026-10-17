import OpenAI from "openai";
import { z } from "zod";

const briefSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  tagline: z.string(),
  description: z.string(),
  location: z.string().optional(),
  mode: z.enum(["in_person", "online", "hybrid"]).default("hybrid"),
  joinMode: z.enum(["open", "apply", "invite_only"]).default("open"),
  codeOfConduct: z.string().optional(),
  highlights: z.array(z.string()).min(2).max(8),
  faq: z
    .array(z.object({ q: z.string(), a: z.string() }))
    .min(2)
    .max(8),
  prizes: z
    .array(
      z.object({
        title: z.string(),
        value: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
  sponsors: z
    .array(
      z.object({
        name: z.string(),
        tier: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .max(8)
    .default([]),
  tracks: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
  challenges: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        sponsorName: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
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
    .min(2)
    .max(12),
  coverPrompt: z.string(),
});

export type HackathonBrief = z.infer<typeof briefSchema>;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to apps/web/.env.local to enable AI generation.",
    );
  }
  return new OpenAI({ apiKey });
}

export async function generateHackathonBrief(input: {
  idea: string;
  city?: string;
  startsAt?: string;
  endsAt?: string;
  vibe?: string;
}): Promise<HackathonBrief> {
  const client = getOpenAI();
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1";

  const response = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You design complete hackathon marketing packages for Hackhost.
Return ONLY valid JSON with keys:
title, slug?, tagline, description, location?, mode (in_person|online|hybrid),
joinMode (open|apply|invite_only), codeOfConduct?, highlights[], faq[{q,a}],
prizes[{title,value?,description?}], sponsors[{name,tier?,url?}],
tracks[{name,description?}], challenges[{title,description?,sponsorName?}],
schedule[{title,description?,location?,startsAt,endsAt?}], coverPrompt.
Prefer concrete venue/city details, sharp taglines, realistic prize ladders,
and a weekend schedule with ISO-8601 datetimes. coverPrompt must describe a
cinematic full-bleed hero photo with no text overlays or logos.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          idea: input.idea,
          city: input.city ?? null,
          startsAt: input.startsAt ?? null,
          endsAt: input.endsAt ?? null,
          vibe: input.vibe ?? null,
        }),
      },
    ],
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("Model returned empty brief");
  return briefSchema.parse(JSON.parse(text));
}

export async function generateCoverImage(prompt: string) {
  const client = getOpenAI();
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

  const result = await client.images.generate({
    model,
    prompt: `${prompt}. Full-bleed photographic hero for a hackathon landing page. No text, logos, watermarks, or UI chrome.`,
    size: "1536x1024",
  });

  const image = result.data?.[0];
  if (!image) throw new Error("No image returned");

  if (image.url) {
    return { url: image.url, b64Json: null as string | null };
  }

  if (image.b64_json) {
    return {
      url: `data:image/png;base64,${image.b64_json}`,
      b64Json: image.b64_json,
    };
  }

  throw new Error("Image response missing url and b64_json");
}
