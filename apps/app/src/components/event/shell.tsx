"use client";

import {
  AppMain,
  AppShell,
  Sidebar,
  SidebarFooter,
  SidebarFooterLink,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSwitch,
  SidebarSwitchItem,
} from "@hackhost/ui";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEvent } from "./context";

const participantNav = [
  ["Home", "/home"],
  ["Team", "/team"],
  ["Match", "/match"],
  ["Challenges", "/challenges"],
  ["Submit", "/submit"],
  ["Schedule", "/schedule"],
] as const;

const organizerNav = [
  ["Overview", "/manage"],
  ["Marketing page", "/manage/page"],
  ["People", "/manage/people"],
  ["Teams", "/manage/teams"],
  ["Challenges", "/manage/challenges"],
  ["Submissions", "/manage/submissions"],
  ["Schedule", "/manage/schedule"],
  ["Announcements", "/manage/announcements"],
  ["Check-in", "/manage/check-in"],
  ["Judging", "/manage/judging"],
  ["Settings", "/manage/settings"],
] as const;

export function EventShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export function EventSidebar({ mode }: { mode: "participant" | "organizer" }) {
  const { slug, title, canOrganize } = useEvent();
  const pathname = usePathname();
  const base = `/e/${slug}`;
  const items = mode === "organizer" ? organizerNav : participantNav;
  const roots = new Set([`${base}/manage`, `${base}/home`]);

  return (
    <Sidebar>
      <SidebarHeader title={title}>
        {mode === "organizer" ? "Organiser" : "Participant"}
      </SidebarHeader>

      {canOrganize ? (
        <SidebarSwitch>
          <SidebarSwitchItem href={`${base}/home`} active={mode === "participant"}>
            Participant
          </SidebarSwitchItem>
          <SidebarSwitchItem href={`${base}/manage`} active={mode === "organizer"}>
            Organise
          </SidebarSwitchItem>
        </SidebarSwitch>
      ) : null}

      <SidebarNav>
        {items.map(([label, path]) => {
          const href = `${base}${path}`;
          const active =
            pathname === href || (!roots.has(href) && pathname.startsWith(href));
          return (
            <SidebarItem key={href} href={href} active={active}>
              {label}
            </SidebarItem>
          );
        })}
      </SidebarNav>

      <SidebarFooter>
        <SidebarFooterLink href={base}>Public page</SidebarFooterLink>
        <SidebarFooterLink href="/events">All events</SidebarFooterLink>
      </SidebarFooter>
    </Sidebar>
  );
}

export function EventMain({ children }: { children: ReactNode }) {
  return <AppMain>{children}</AppMain>;
}
