import { EventMain, EventProvider, EventShell, EventSidebar } from "@/components/event";
import { getHackathonBySlug, requireOrganizer } from "@/lib/rbac";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ManageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/e/${slug}/manage`);
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) redirect("/events");
  try {
    await requireOrganizer(hackathon.id, session.user.id);
  } catch {
    redirect(`/e/${slug}`);
  }

  return (
    <EventProvider
      value={{
        slug,
        title: hackathon.title,
        canOrganize: true,
      }}
    >
      <EventShell>
        <EventSidebar mode="organizer" />
        <EventMain>{children}</EventMain>
      </EventShell>
    </EventProvider>
  );
}
