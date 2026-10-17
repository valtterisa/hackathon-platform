import { db } from "@hackhost/db";
import { hackathonMemberships, hackathons } from "@hackhost/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function MyEventsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/me/events");

  const rows = await db
    .select({
      role: hackathonMemberships.role,
      status: hackathonMemberships.status,
      hackathon: hackathons,
    })
    .from(hackathonMemberships)
    .innerJoin(hackathons, eq(hackathonMemberships.hackathonId, hackathons.id))
    .where(eq(hackathonMemberships.userId, session.user.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">My events</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li
            key={`${row.hackathon.id}-${row.role}`}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
          >
            <div>
              <p className="font-medium">{row.hackathon.title}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {row.role} · {row.status}
              </p>
            </div>
            <Link
              href={
                row.role === "organizer"
                  ? `/e/${row.hackathon.slug}/manage`
                  : `/e/${row.hackathon.slug}/home`
              }
              className="text-sm text-[var(--primary)] underline"
            >
              Open
            </Link>
          </li>
        ))}
        {rows.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No events yet.</p>
        ) : null}
      </ul>
    </div>
  );
}
