"use client";

import { cn } from "@hackhost/ui";
import { useState, type ReactNode } from "react";

type Mode = "participant" | "organizer";
type ParticipantView =
  | "home"
  | "team"
  | "match"
  | "challenges"
  | "submit"
  | "schedule";
type OrganizerView =
  | "overview"
  | "people"
  | "teams"
  | "submissions"
  | "schedule"
  | "judging";

const EVENT = {
  title: "Nordic Builders",
  slug: "nordic-builders",
  when: "Mar 14–16 · Helsinki + Online",
  tagline: "48 hours to ship something real",
};

const PARTICIPANT_NAV: { id: ParticipantView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "team", label: "Team" },
  { id: "match", label: "Match" },
  { id: "challenges", label: "Challenges" },
  { id: "submit", label: "Submit" },
  { id: "schedule", label: "Schedule" },
];

const ORGANIZER_NAV: { id: OrganizerView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "people", label: "People" },
  { id: "teams", label: "Teams" },
  { id: "submissions", label: "Submissions" },
  { id: "schedule", label: "Schedule" },
  { id: "judging", label: "Judging" },
];

const MOCK = {
  announcements: [
    {
      title: "Kickoff in the main hall",
      body: "Doors open 17:00. Bring laptop + charger. Dinner is on us.",
    },
    {
      title: "Sponsor APIs are live",
      body: "Keys in the #sponsors channel. Rate limits are generous for the weekend.",
    },
  ],
  team: {
    name: "Ferry Stack",
    members: [
      { name: "Ada L.", role: "Lead" },
      { name: "You", role: "Builder" },
      { name: "Mikko R.", role: "Design" },
    ],
  },
  matches: [
    { name: "Sofia K.", skills: "ML · Python", note: "Looking for frontend" },
    { name: "Jonas P.", skills: "React · Rust", note: "Open to any track" },
    { name: "Elena V.", skills: "Product · UX", note: "Has a climate idea" },
  ],
  challenges: [
    {
      name: "Climate data",
      sponsor: "Nordic Energy",
      prize: "€3,000",
    },
    {
      name: "Local commerce",
      sponsor: "Helsinki Merchants",
      prize: "€2,000",
    },
    {
      name: "Open track",
      sponsor: "Hackhost",
      prize: "€1,500",
    },
  ],
  schedule: [
    { time: "Fri 18:00", title: "Kickoff & team forming" },
    { time: "Sat 12:00", title: "Mentor office hours" },
    { time: "Sun 14:00", title: "Submissions close" },
    { time: "Sun 16:00", title: "Demos & awards" },
  ],
  people: [
    { name: "Ada Lovelace", role: "Participant", status: "Active" },
    { name: "Grace Hopper", role: "Participant", status: "Active" },
    { name: "Alan Turing", role: "Participant", status: "Pending" },
    { name: "You (organiser)", role: "Organiser", status: "Active" },
  ],
  teams: [
    { name: "Ferry Stack", size: 3, challenge: "Climate data" },
    { name: "Baltic Bits", size: 4, challenge: "Local commerce" },
    { name: "Sauna Scripts", size: 2, challenge: "Open track" },
  ],
  submissions: [
    { project: "Heatmap Helsinki", team: "Ferry Stack", status: "Draft" },
    { project: "Corner Shop API", team: "Baltic Bits", status: "Submitted" },
    { project: "Ferry Delay Bot", team: "Sauna Scripts", status: "Submitted" },
  ],
  stats: [
    { label: "Participants", value: "128" },
    { label: "Pending", value: "7" },
    { label: "Teams", value: "34" },
    { label: "Submissions", value: "12" },
  ],
};

function DemoHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-5 space-y-1">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
        {title}
      </h3>
      {children ? (
        <p className="text-sm text-zinc-500">{children}</p>
      ) : null}
    </header>
  );
}

function DemoList({
  items,
}: {
  items: { title: string; meta?: string; body?: string }[];
}) {
  return (
    <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
      {items.map((item) => (
        <li key={item.title} className="px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-zinc-900">{item.title}</p>
            {item.meta ? (
              <p className="text-sm text-zinc-500">{item.meta}</p>
            ) : null}
          </div>
          {item.body ? (
            <p className="mt-1 text-sm text-zinc-600">{item.body}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ParticipantHome({
  onGo,
}: {
  onGo: (view: ParticipantView) => void;
}) {
  const shortcuts: { id: ParticipantView; label: string }[] = [
    { id: "team", label: "Find or create a team" },
    { id: "match", label: "Match with teammates" },
    { id: "challenges", label: "Pick a challenge" },
    { id: "submit", label: "Submit your project" },
    { id: "schedule", label: "View schedule" },
  ];

  return (
    <>
      <DemoHeading title="Home">Next steps for {EVENT.title}</DemoHeading>
      <ul className="mb-6 divide-y divide-zinc-100 rounded-xl border border-zinc-200">
        {shortcuts.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onGo(s.id)}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm text-zinc-900 hover:bg-zinc-50"
            >
              {s.label}
              <span className="text-zinc-400">→</span>
            </button>
          </li>
        ))}
      </ul>
      <h4 className="mb-2 text-sm font-semibold text-zinc-900">Announcements</h4>
      <DemoList
        items={MOCK.announcements.map((a) => ({
          title: a.title,
          body: a.body,
        }))}
      />
    </>
  );
}

function ParticipantViews({
  view,
  onGo,
}: {
  view: ParticipantView;
  onGo: (view: ParticipantView) => void;
}) {
  switch (view) {
    case "home":
      return <ParticipantHome onGo={onGo} />;
    case "team":
      return (
        <>
          <DemoHeading title="Team">{MOCK.team.name}</DemoHeading>
          <DemoList
            items={MOCK.team.members.map((m) => ({
              title: m.name,
              meta: m.role,
            }))}
          />
          <button
            type="button"
            className="mt-4 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Invite teammate
          </button>
        </>
      );
    case "match":
      return (
        <>
          <DemoHeading title="Match">
            People looking for teammates
          </DemoHeading>
          <DemoList
            items={MOCK.matches.map((m) => ({
              title: m.name,
              meta: m.skills,
              body: m.note,
            }))}
          />
        </>
      );
    case "challenges":
      return (
        <>
          <DemoHeading title="Challenges">Pick a track to build for</DemoHeading>
          <DemoList
            items={MOCK.challenges.map((c) => ({
              title: c.name,
              meta: c.prize,
              body: `Sponsored by ${c.sponsor}`,
            }))}
          />
        </>
      );
    case "submit":
      return (
        <>
          <DemoHeading title="Submit">Ship before Sunday 14:00</DemoHeading>
          <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-700">
                Project name
              </span>
              <input
                defaultValue="Heatmap Helsinki"
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-700">
                Repo URL
              </span>
              <input
                defaultValue="https://github.com/ferry-stack/heatmap"
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-700">
                Demo URL
              </span>
              <input
                placeholder="https://"
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
            </label>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:border-zinc-700 hover:bg-zinc-700"
            >
              Save draft
            </button>
          </div>
        </>
      );
    case "schedule":
      return (
        <>
          <DemoHeading title="Schedule">{EVENT.when}</DemoHeading>
          <DemoList
            items={MOCK.schedule.map((s) => ({
              title: s.title,
              meta: s.time,
            }))}
          />
        </>
      );
  }
}

function OrganizerViews({ view }: { view: OrganizerView }) {
  switch (view) {
    case "overview":
      return (
        <>
          <DemoHeading title="Overview">
            Status: published · Join: open
          </DemoHeading>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MOCK.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <p className="text-sm text-zinc-500">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-600">{EVENT.tagline}</p>
        </>
      );
    case "people":
      return (
        <>
          <DemoHeading title="People">Registrations & roles</DemoHeading>
          <DemoList
            items={MOCK.people.map((p) => ({
              title: p.name,
              meta: `${p.role} · ${p.status}`,
            }))}
          />
        </>
      );
    case "teams":
      return (
        <>
          <DemoHeading title="Teams">Formed for this weekend</DemoHeading>
          <DemoList
            items={MOCK.teams.map((t) => ({
              title: t.name,
              meta: `${t.size} members`,
              body: t.challenge,
            }))}
          />
        </>
      );
    case "submissions":
      return (
        <>
          <DemoHeading title="Submissions">Projects in progress</DemoHeading>
          <DemoList
            items={MOCK.submissions.map((s) => ({
              title: s.project,
              meta: s.status,
              body: s.team,
            }))}
          />
        </>
      );
    case "schedule":
      return (
        <>
          <DemoHeading title="Schedule">Public agenda</DemoHeading>
          <DemoList
            items={MOCK.schedule.map((s) => ({
              title: s.title,
              meta: s.time,
            }))}
          />
        </>
      );
    case "judging":
      return (
        <>
          <DemoHeading title="Judging">Score submitted projects</DemoHeading>
          <DemoList
            items={MOCK.submissions
              .filter((s) => s.status === "Submitted")
              .map((s) => ({
                title: s.project,
                meta: "Awaiting scores",
                body: s.team,
              }))}
          />
        </>
      );
  }
}

export function DashboardDemo() {
  const [mode, setMode] = useState<Mode>("participant");
  const [participantView, setParticipantView] =
    useState<ParticipantView>("home");
  const [organizerView, setOrganizerView] = useState<OrganizerView>("overview");

  const nav = mode === "participant" ? PARTICIPANT_NAV : ORGANIZER_NAV;
  const activeId = mode === "participant" ? participantView : organizerView;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-500">
        <span>Interactive demo · mock data</span>
        <span className="hidden sm:inline">{EVENT.title}</span>
      </div>

      <div className="flex min-h-[420px] flex-col sm:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-zinc-100 bg-zinc-50 sm:w-48 sm:border-b-0 sm:border-r">
          <div className="border-b border-zinc-100 p-3">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {EVENT.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">{EVENT.when}</p>
          </div>

          <div className="flex border-b border-zinc-100 text-xs">
            <button
              type="button"
              onClick={() => setMode("participant")}
              className={cn(
                "flex-1 cursor-pointer px-2 py-2.5 text-center font-medium transition-colors",
                mode === "participant"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              Participant
            </button>
            <button
              type="button"
              onClick={() => setMode("organizer")}
              className={cn(
                "flex-1 cursor-pointer px-2 py-2.5 text-center font-medium transition-colors",
                mode === "organizer"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              Organise
            </button>
          </div>

          <nav className="flex gap-1 overflow-x-auto p-2 sm:flex-col sm:overflow-visible">
            {nav.map((item) => {
              const active = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (mode === "participant") {
                      setParticipantView(item.id as ParticipantView);
                    } else {
                      setOrganizerView(item.id as OrganizerView);
                    }
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-white font-medium text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:bg-white/80 hover:text-zinc-900",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          {mode === "participant" ? (
            <ParticipantViews
              view={participantView}
              onGo={setParticipantView}
            />
          ) : (
            <OrganizerViews view={organizerView} />
          )}
        </div>
      </div>
    </div>
  );
}
