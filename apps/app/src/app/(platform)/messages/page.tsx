import { db } from "@hackhost/db";
import {
  conversationParticipants,
  conversations,
  messages,
  user,
} from "@hackhost/db/schema";
import { EmptyState, List, ListItem, PageHeader } from "@hackhost/ui";
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
      <>
        <PageHeader title="Messages" />
        <EmptyState title="No conversations yet">
          Match with teammates inside an event to start chatting.
        </EmptyState>
      </>
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
    <>
      <PageHeader title="Messages" />
      <List>
        {threads.map(({ conv, latest, people }) => (
          <ListItem
            key={conv.id}
            title={
              people
                .map((p) => p.user.name)
                .filter((n) => n !== session.user.name)
                .join(", ") || "Conversation"
            }
            meta={latest?.createdAt.toLocaleDateString()}
          >
            <span className={latest ? undefined : "text-muted"}>
              {latest?.body ?? "No messages"}
            </span>
          </ListItem>
        ))}
      </List>
    </>
  );
}
