import { db } from "@hackhost/db";
import { profiles } from "@hackhost/db/schema";
import {
  Button,
  Checkbox,
  Field,
  FieldRow,
  Form,
  Input,
  PageHeader,
  Textarea,
} from "@hackhost/ui";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateProfile } from "@/lib/actions/hackathons";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

export default async function MePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/me");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  return (
    <>
      <PageHeader
        title="Profile"
        description="How you show up to organisers and potential teammates."
        actions={<SignOutButton />}
      />
      <Form action={updateProfile}>
        <FieldRow>
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" defaultValue={session.user.name} />
          </Field>
          <Field label="Nickname" htmlFor="nickname">
            <Input id="nickname" name="nickname" defaultValue={profile?.nickname ?? ""} />
          </Field>
        </FieldRow>
        <Field label="Bio" htmlFor="bio">
          <Textarea id="bio" name="bio" defaultValue={profile?.bio ?? ""} />
        </Field>
        <Field label="Skills" htmlFor="skills" hint="Comma-separated">
          <Input
            id="skills"
            name="skills"
            defaultValue={(profile?.skills as string[] | null)?.join(", ") ?? ""}
          />
        </Field>
        <Field label="Interests" htmlFor="interests">
          <Input
            id="interests"
            name="interests"
            defaultValue={(profile?.interests as string[] | null)?.join(", ") ?? ""}
          />
        </Field>
        <Field label="Preferred roles" htmlFor="preferredRoles">
          <Input
            id="preferredRoles"
            name="preferredRoles"
            defaultValue={
              (profile?.preferredRoles as string[] | null)?.join(", ") ?? ""
            }
          />
        </Field>
        <FieldRow>
          <Field label="GitHub" htmlFor="githubUrl">
            <Input id="githubUrl" name="githubUrl" defaultValue={profile?.githubUrl ?? ""} />
          </Field>
          <Field label="LinkedIn" htmlFor="linkedinUrl">
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              defaultValue={profile?.linkedinUrl ?? ""}
            />
          </Field>
        </FieldRow>
        <Checkbox
          name="lookingForTeam"
          defaultChecked={profile?.lookingForTeam ?? false}
        >
          Looking for a team
        </Checkbox>
        <div>
          <Button type="submit">Save profile</Button>
        </div>
      </Form>
    </>
  );
}
