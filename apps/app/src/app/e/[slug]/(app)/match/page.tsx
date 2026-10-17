import { db } from "@hackhost/db";
import { matchProfiles, profiles, user } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { and, eq, ne } from "drizzle-orm";
import {
  assertCanAccessEventApp,
  upsertMatchProfile,
} from "@/lib/actions/hackathons";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hackathon, session } = await assertCanAccessEventApp(slug);

  const mine = await db.query.matchProfiles.findFirst({
    where: and(
      eq(matchProfiles.hackathonId, hackathon.id),
      eq(matchProfiles.userId, session.user.id),
    ),
  });

  const others = await db
    .select({
      profile: matchProfiles,
      user,
      userProfile: profiles,
    })
    .from(matchProfiles)
    .innerJoin(user, eq(matchProfiles.userId, user.id))
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .where(
      and(
        eq(matchProfiles.hackathonId, hackathon.id),
        ne(matchProfiles.userId, session.user.id),
      ),
    );

  const mySkills = new Set((mine?.skills as string[] | null) ?? []);
  const ranked = others
    .map((row) => {
      const skills = (row.profile.skills as string[] | null) ?? [];
      const overlap = skills.filter((s) =>
        [...mySkills].some(
          (m) => m.toLowerCase() === s.toLowerCase(),
        ),
      ).length;
      const roleBonus =
        ((row.profile.roles as string[] | null) ?? []).length > 0 ? 1 : 0;
      return { ...row, score: overlap * 20 + roleBonus * 10 };
    })
    .sort((a, b) => b.score - a.score);

  const save = upsertMatchProfile.bind(null, slug);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Match</h1>
      <p className="mt-1 text-[var(--muted-foreground)]">
        Lightweight skill/role matching — no 20-question maze.
      </p>

      <form
        action={save}
        className="mt-8 max-w-lg space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
      >
        <div>
          <Label htmlFor="roles">Roles (comma-separated)</Label>
          <Input
            id="roles"
            name="roles"
            defaultValue={((mine?.roles as string[]) ?? []).join(", ")}
            placeholder="Developer, Designer"
          />
        </div>
        <div>
          <Label htmlFor="skills">Skills</Label>
          <Input
            id="skills"
            name="skills"
            defaultValue={((mine?.skills as string[]) ?? []).join(", ")}
            placeholder="TypeScript, Figma"
          />
        </div>
        <div>
          <Label htmlFor="goals">Goals</Label>
          <Textarea id="goals" name="goals" defaultValue={mine?.goals ?? ""} />
        </div>
        <div>
          <Label htmlFor="lookingFor">Looking for</Label>
          <Textarea
            id="lookingFor"
            name="lookingFor"
            defaultValue={mine?.lookingFor ?? ""}
          />
        </div>
        <Button type="submit">Save match profile</Button>
      </form>

      <ul className="mt-10 space-y-3">
        {ranked.map((row) => (
          <li
            key={row.profile.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{row.user.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {((row.profile.roles as string[]) ?? []).join(", ")} ·{" "}
                  {((row.profile.skills as string[]) ?? []).join(", ")}
                </p>
                <p className="mt-1 text-sm">{row.profile.goals}</p>
              </div>
              <span className="text-sm text-[var(--primary)]">
                {row.score}% fit
              </span>
            </div>
          </li>
        ))}
        {ranked.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">
            No other match profiles yet. Save yours and invite teammates.
          </p>
        ) : null}
      </ul>
    </div>
  );
}
