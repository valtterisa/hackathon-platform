"use client";

import { cn } from "@hackhost/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEvent } from "./context";

const participantNav = (base: string) =>
  [
    ["Home", `${base}/home`],
    ["Team", `${base}/team`],
    ["Match", `${base}/match`],
    ["Challenges", `${base}/challenges`],
    ["Submit", `${base}/submit`],
    ["Schedule", `${base}/schedule`],
  ] as const;

const organizerNav = (base: string) =>
  [
    ["Overview", `${base}/manage`],
    ["Marketing page", `${base}/manage/page`],
    ["Settings", `${base}/manage/settings`],
    ["People", `${base}/manage/people`],
    ["Teams", `${base}/manage/teams`],
    ["Challenges", `${base}/manage/challenges`],
    ["Submissions", `${base}/manage/submissions`],
    ["Schedule", `${base}/manage/schedule`],
    ["Announcements", `${base}/manage/announcements`],
    ["Check-in", `${base}/manage/check-in`],
    ["Judging", `${base}/manage/judging`],
  ] as const;

export function EventShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen">{children}</div>;
}

export function EventSidebar({
  mode,
}: {
  mode: "participant" | "organizer";
}) {
  const { slug, title, canOrganize } = useEvent();
  const pathname = usePathname();
  const base = `/e/${slug}`;
  const items =
    mode === "organizer" ? organizerNav(base) : participantNav(base);

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      <div className="bg-[var(--sidebar-muted)] p-4">
        <p className="font-display text-base uppercase leading-tight">{title}</p>
        <Link
          href={base}
          className="mt-2 block text-sm text-[var(--accent)] underline"
        >
          Public page
        </Link>
      </div>

      {canOrganize ? (
        <div className="flex gap-1 p-2">
          <Link
            href={`${base}/home`}
            className={cn(
              "flex-1 px-2 py-2 text-center text-sm",
              mode === "participant"
                ? "bg-[var(--sidebar-muted)]"
                : "text-white/55",
            )}
          >
            Participant
          </Link>
          <Link
            href={`${base}/manage`}
            className={cn(
              "flex-1 px-2 py-2 text-center text-sm",
              mode === "organizer"
                ? "bg-[var(--sidebar-muted)]"
                : "text-white/55",
            )}
          >
            Organize
          </Link>
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {items.map(([label, href]) => {
          const active =
            pathname === href ||
            (href !== `${base}/manage` &&
              href !== `${base}/home` &&
              pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-2 text-sm",
                active
                  ? "bg-[var(--sidebar-muted)] text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/events"
        className="p-3 text-sm text-white/45 hover:text-white"
      >
        All events
      </Link>
    </aside>
  );
}

export function EventMain({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-auto bg-[var(--bg)]">
      <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
    </main>
  );
}
