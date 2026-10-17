import { db } from "@hackhost/db";
import { matchProfiles, profiles, user } from "@hackhost/db/schema";
import {
  Button,
  EmptyState,
  Field,
  FieldRow,
  Form,
  Input,
  List,
  ListItem,
  PageHeader,
  Panel,
  Section,
  Tag,
  Textarea,
} from "@hackhost/ui";
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
    <>
      <PageHeader
        title="Match"
        description="Lightweight skill and role matching. No 20-question maze."
      />

      <Section title="Your match profile">
        <Panel>
          <Form action={save}>
            <FieldRow>
              <Field label="Roles" htmlFor="roles" hint="Comma-separated">
                <Input
                  id="roles"
                  name="roles"
                  defaultValue={((mine?.roles as string[]) ?? []).join(", ")}
                  placeholder="Developer, Designer"
                />
              </Field>
              <Field label="Skills" htmlFor="skills" hint="Comma-separated">
                <Input
                  id="skills"
                  name="skills"
                  defaultValue={((mine?.skills as string[]) ?? []).join(", ")}
                  placeholder="TypeScript, Figma"
                />
              </Field>
            </FieldRow>
            <Field label="Goals" htmlFor="goals">
              <Textarea id="goals" name="goals" defaultValue={mine?.goals ?? ""} />
            </Field>
            <Field label="Looking for" htmlFor="lookingFor">
              <Textarea
                id="lookingFor"
                name="lookingFor"
                defaultValue={mine?.lookingFor ?? ""}
              />
            </Field>
            <div>
              <Button type="submit">Save match profile</Button>
            </div>
          </Form>
        </Panel>
      </Section>

      <Section title="Suggested teammates">
        {ranked.length === 0 ? (
          <EmptyState title="No other match profiles yet">
            Save yours and invite teammates.
          </EmptyState>
        ) : (
          <List>
            {ranked.map((row) => (
              <ListItem
                key={row.profile.id}
                title={row.user.name}
                meta={[
                  ((row.profile.roles as string[]) ?? []).join(", "),
                  ((row.profile.skills as string[]) ?? []).join(", "),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                aside={<Tag tone="ok">{row.score}% fit</Tag>}
              >
                {row.profile.goals}
              </ListItem>
            ))}
          </List>
        )}
      </Section>
    </>
  );
}
