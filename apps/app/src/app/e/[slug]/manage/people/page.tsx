import { db } from "@hackhost/db";
import { hackathonMemberships, user } from "@hackhost/db/schema";
import { Button } from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateMembershipStatus } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";
import { ExportCsvButton } from "@/components/export-csv-button";

export default async function ManagePeoplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();

  const rows = await db
    .select({
      membership: hackathonMemberships,
      user,
    })
    .from(hackathonMemberships)
    .innerJoin(user, eq(hackathonMemberships.userId, user.id))
    .where(eq(hackathonMemberships.hackathonId, event.id));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">People</h1>
        <ExportCsvButton slug={slug} />
      </div>
      <ul className="mt-6 space-y-2">
        {rows.map(({ membership, user: u }) => (
          <li
            key={membership.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {u.email} · {membership.role} · {membership.status}
              </p>
            </div>
            {membership.status === "pending" ||
            membership.status === "waitlisted" ? (
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await updateMembershipStatus(slug, membership.id, "active");
                  }}
                >
                  <Button size="sm" type="submit">
                    Approve
                  </Button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await updateMembershipStatus(
                      slug,
                      membership.id,
                      "rejected",
                    );
                  }}
                >
                  <Button size="sm" variant="soft" type="submit">
                    Reject
                  </Button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
