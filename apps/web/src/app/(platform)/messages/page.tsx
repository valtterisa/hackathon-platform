import { db } from "@hackhost/db";
import {
  conversationParticipants,
  conversations,
  messages,
  user,
} from "@hackhost/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/messages");

  const parts = await db.query.conversationParticipants.findMany({
    where: eq(conversationParticipants.userId, session.user.id),
  });
  const convIds = parts.map((p) => p.conversationId);
  if (convIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          No conversations yet. Match with teammates inside an event to start chatting.
        </p>
      </div>
    );
  }

  const convs = await db.query.conversations.findMany({
    where: inArray(conversations.id, convIds),
  });

  const threads = await Promise.all(
    convs.map(async (conv) => {
      const latest = await db.query.messages.findFirst({
        where: eq(messages.conversationId, conv.id),
        orderBy: [desc(messages.createdAt)],
      });
      const people = await db
        .select({ user })
        .from(conversationParticipants)
        .innerJoin(user, eq(conversationParticipants.userId, user.id))
        .where(eq(conversationParticipants.conversationId, conv.id));
      return { conv, latest, people };
    }),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Messages</h1>
      <ul className="mt-6 space-y-3">
        {threads.map(({ conv, latest, people }) => (
          <li
            key={conv.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="font-medium">
              {people
                .map((p) => p.user.name)
                .filter((n) => n !== session.user.name)
                .join(", ") || "Conversation"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {latest?.body ?? "No messages"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
