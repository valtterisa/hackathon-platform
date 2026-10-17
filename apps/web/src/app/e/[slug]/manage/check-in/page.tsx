import { db } from "@hackhost/db";
import { checkIns, user } from "@hackhost/db/schema";
import { Button, Input, Label } from "@hackhost/ui";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { checkInUser } from "@/lib/actions/hackathons";
import { getHackathonBySlug } from "@/lib/rbac";

export default async function ManageCheckInPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getHackathonBySlug(slug);
  if (!event) notFound();

  const rows = await db
    .select({ checkIn: checkIns, user })
    .from(checkIns)
    .innerJoin(user, eq(checkIns.userId, user.id))
    .where(eq(checkIns.hackathonId, event.id))
    .orderBy(desc(checkIns.checkedInAt));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Check-in</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Enter a participant user id to check them in.
      </p>
      <form
        action={async (formData) => {
          "use server";
          await checkInUser(slug, String(formData.get("userId") ?? ""));
        }}
        className="mt-6 max-w-md space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
      >
        <div>
          <Label htmlFor="userId">User ID</Label>
          <Input id="userId" name="userId" required placeholder="user_…" />
        </div>
        <Button type="submit">Check in</Button>
      </form>
      <ul className="mt-8 space-y-2 text-sm">
        {rows.map(({ checkIn, user: u }) => (
          <li key={checkIn.id}>
            {u.name} · {checkIn.checkedInAt.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
