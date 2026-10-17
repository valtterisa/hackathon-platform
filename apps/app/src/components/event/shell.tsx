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
  return (
    <div data-ui className="flex min-h-dvh bg-white">
      {children}
    </div>
  );
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
    <aside className="flex w-56 shrink-0 flex-col bg-[var(--surface)] text-sm">
      <div className="p-4">
        <p className="font-semibold leading-tight tracking-tight text-zinc-900">
          {title}
        </p>
        <Link
          href={base}
          className="mt-2 block text-xs text-zinc-500 hover:text-zinc-900"
        >
          Public page →
        </Link>
      </div>

      {canOrganize ? (
        <div className="flex text-xs">
          <Link
            href={`${base}/home`}
            className={cn(
              "flex-1 px-2 py-2.5 text-center font-medium",
              mode === "participant"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            Participant
          </Link>
          <Link
            href={`${base}/manage`}
            className={cn(
              "flex-1 px-2 py-2.5 text-center font-medium",
              mode === "organizer"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            Organise
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
                "rounded-[var(--radius)] px-3 py-2",
                active
                  ? "bg-white font-medium text-zinc-900"
                  : "text-zinc-600 hover:bg-white hover:text-zinc-900",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/events"
        className="mt-auto p-3 text-xs text-zinc-500 hover:text-zinc-900"
      >
        All events
      </Link>
    </aside>
  );
}

export function EventMain({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-auto bg-white">
      <div className="mx-auto max-w-3xl px-6 py-8">{children}</div>
    </main>
  );
}
