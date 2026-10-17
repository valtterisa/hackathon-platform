import { EventSidebar } from "@/components/event-sidebar";
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
    <div className="flex min-h-screen">
      <EventSidebar
        slug={slug}
        title={hackathon.title}
        mode="participant"
        isOrganizer={isOrganizer}
      />
      <div className="flex-1 overflow-auto bg-[var(--background)]">
        <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
