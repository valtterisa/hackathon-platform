"use client";

import { cn } from "@hackhost/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function EventSidebar({
  slug,
  title,
  mode,
  isOrganizer,
}: {
  slug: string;
  title: string;
  mode: "participant" | "organizer";
  isOrganizer: boolean;
}) {
  const pathname = usePathname();
  const base = `/e/${slug}`;

  const participantItems: NavItem[] = [
    { href: `${base}/home`, label: "Home" },
    { href: `${base}/team`, label: "Team" },
    { href: `${base}/match`, label: "Match" },
    { href: `${base}/challenges`, label: "Challenges" },
    { href: `${base}/submit`, label: "Submit" },
    { href: `${base}/schedule`, label: "Schedule" },
  ];

  const organizerItems: NavItem[] = [
    { href: `${base}/manage`, label: "Overview" },
    { href: `${base}/manage/page`, label: "Marketing page" },
    { href: `${base}/manage/settings`, label: "Settings" },
    { href: `${base}/manage/people`, label: "People" },
    { href: `${base}/manage/teams`, label: "Teams" },
    { href: `${base}/manage/challenges`, label: "Challenges" },
    { href: `${base}/manage/submissions`, label: "Submissions" },
    { href: `${base}/manage/schedule`, label: "Schedule" },
    { href: `${base}/manage/announcements`, label: "Announcements" },
    { href: `${base}/manage/check-in`, label: "Check-in" },
    { href: `${base}/manage/judging`, label: "Judging" },
  ];

  const items = mode === "organizer" ? organizerItems : participantItems;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      <div className="border-b border-white/10 p-4">
        <p className="text-xs uppercase tracking-wide text-white/50">Event</p>
        <p className="font-display text-lg font-semibold leading-tight">{title}</p>
        <Link href={base} className="mt-1 block text-xs text-[var(--primary)] hover:underline">
          Public page
        </Link>
      </div>

      {isOrganizer ? (
        <div className="flex gap-1 border-b border-white/10 p-2">
          <Link
            href={`${base}/home`}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-center text-xs",
              mode === "participant" ? "bg-[var(--sidebar-muted)]" : "text-white/60",
            )}
          >
            Participant
          </Link>
          <Link
            href={`${base}/manage`}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-center text-xs",
              mode === "organizer" ? "bg-[var(--sidebar-muted)]" : "text-white/60",
            )}
          >
            Organize
          </Link>
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `${base}/manage` &&
              item.href !== `${base}/home` &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-[var(--sidebar-muted)] text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 text-xs text-white/40">
        <Link href="/events" className="hover:text-white">
          ← All events
        </Link>
      </div>
    </aside>
  );
}
