import { db } from "@hackhost/db";
import { hackathons, user } from "@hackhost/db/schema";
import {
  List,
  ListItem,
  ListLink,
  PageHeader,
  Section,
  Tag,
  statusTone,
} from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  const row = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });
  if (!row?.isPlatformAdmin) redirect("/");


  const [events, users] = await Promise.all([
    db.query.hackathons.findMany({ orderBy: [desc(hackathons.createdAt)], limit: 50 }),
    db.query.user.findMany({ orderBy: [desc(user.createdAt)], limit: 50 }),
  ]);

  return (
    <>
      <PageHeader
        title="Platform admin"
        description="Moderate events and users. Abuse controls live here for the managed service."
      />

      <Section title="Events" description="Latest 50">
        <List>
          {events.map((e) => (
            <ListLink
              key={e.id}
              href={`/e/${e.slug}`}
              title={e.title}
              aside={<Tag tone={statusTone(e.status)}>{e.status}</Tag>}
            />
          ))}
        </List>
      </Section>

      <Section title="Users" description="Latest 50">
        <List>
          {users.map((u) => (
            <ListItem
              key={u.id}
              title={u.name}
              meta={u.email}
              aside={u.isPlatformAdmin ? <Tag tone="ink">admin</Tag> : null}
            />
          ))}
        </List>
      </Section>
    </>
  );
}
