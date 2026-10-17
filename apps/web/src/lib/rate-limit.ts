import { db } from "@hackhost/db";
import { rateLimits } from "@hackhost/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@/lib/ids";

const WINDOW_MS = 60_000;
const MAX = 60;

export async function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = await db.query.rateLimits.findFirst({
    where: eq(rateLimits.key, key),
  });

  if (!existing) {
    await db.insert(rateLimits).values({
      id: createId("rl"),
      key,
      count: 1,
      windowStart: new Date(now),
    });
    return { ok: true, remaining: MAX - 1 };
  }

  const start = existing.windowStart.getTime();
  if (now - start > WINDOW_MS) {
    await db
      .update(rateLimits)
      .set({ count: 1, windowStart: new Date(now) })
      .where(eq(rateLimits.id, existing.id));
    return { ok: true, remaining: MAX - 1 };
  }

  if (existing.count >= MAX) {
    return { ok: false, remaining: 0 };
  }

  await db
    .update(rateLimits)
    .set({ count: existing.count + 1 })
    .where(eq(rateLimits.id, existing.id));

  return { ok: true, remaining: MAX - existing.count - 1 };
}
