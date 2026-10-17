import { EventProvider, EventShell } from "@/components/event";
import { assertCanAccessEventApp } from "@/lib/actions/hackathons";

export default async function EventParticipantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hackathon, isOrganizer } = await assertCanAccessEventApp(slug);

  return (
    <EventProvider
      value={{
        slug,
        title: hackathon.title,
        canOrganize: isOrganizer,
      }}
    >
      <EventShell>
        <EventShell.Sidebar mode="participant" />
        <EventShell.Main>{children}</EventShell.Main>
      </EventShell>
    </EventProvider>
  );
}
