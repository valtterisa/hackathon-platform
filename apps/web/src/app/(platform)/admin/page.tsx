import { db } from "@hackhost/db";
import { hackathons, user } from "@hackhost/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Platform admin</h1>
      <p className="mt-1 text-[var(--muted-foreground)]">
        Moderate events and users. Abuse controls live here for the managed service.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Events</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
              <Link href={`/e/${e.slug}`} className="text-[var(--primary)] underline">
                {e.title}
              </Link>
              <span className="text-[var(--muted-foreground)]">{e.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Users</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
              <span>
                {u.name} · {u.email}
              </span>
              {u.isPlatformAdmin ? (
                <span className="text-[var(--accent)]">admin</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
