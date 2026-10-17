import { EventSidebar } from "@/components/event-sidebar";
import { requireOrganizer, getHackathonBySlug } from "@/lib/rbac";
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
    <div className="flex min-h-screen">
      <EventSidebar
        slug={slug}
        title={hackathon.title}
        mode="organizer"
        isOrganizer
      />
      <div className="flex-1 overflow-auto bg-[var(--background)]">
        <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
