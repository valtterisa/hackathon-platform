import { db } from "@hackhost/db";
import { profiles } from "@hackhost/db/schema";
import { Button, Input, Label, Textarea } from "@hackhost/ui";
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
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Profile</h1>
        <SignOutButton />
      </div>
      <form action={updateProfile} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={session.user.name} />
        </div>
        <div>
          <Label htmlFor="nickname">Nickname</Label>
          <Input id="nickname" name="nickname" defaultValue={profile?.nickname ?? ""} />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={profile?.bio ?? ""} />
        </div>
        <div>
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Input
            id="skills"
            name="skills"
            defaultValue={(profile?.skills as string[] | null)?.join(", ") ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="interests">Interests</Label>
          <Input
            id="interests"
            name="interests"
            defaultValue={(profile?.interests as string[] | null)?.join(", ") ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="preferredRoles">Preferred roles</Label>
          <Input
            id="preferredRoles"
            name="preferredRoles"
            defaultValue={
              (profile?.preferredRoles as string[] | null)?.join(", ") ?? ""
            }
          />
        </div>
        <div>
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input id="githubUrl" name="githubUrl" defaultValue={profile?.githubUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            defaultValue={profile?.linkedinUrl ?? ""}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="lookingForTeam"
            defaultChecked={profile?.lookingForTeam ?? false}
          />
          Looking for a team
        </label>
        <Button type="submit">Save profile</Button>
      </form>
    </div>
  );
}
