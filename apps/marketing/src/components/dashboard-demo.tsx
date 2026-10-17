"use client";

import {
  AppMain,
  AppShell,
  Button,
  Field,
  Form,
  Input,
  List,
  ListButton,
  ListItem,
  PageHeader,
  Section,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSwitch,
  SidebarSwitchItem,
  Stat,
  StatGrid,
  Tag,
  Textarea,
  statusTone,
} from "@hackhost/ui";
import { useState } from "react";

type Mode = "participant" | "organizer";

const PARTICIPANT_VIEWS = ["Home", "Team", "Match", "Challenges", "Submit", "Schedule"] as const;
const ORGANIZER_VIEWS = ["Overview", "People", "Teams", "Submissions", "Schedule", "Judging"] as const;

type ParticipantView = (typeof PARTICIPANT_VIEWS)[number];
type OrganizerView = (typeof ORGANIZER_VIEWS)[number];

const EVENT = {
  title: "Nordic Builders",
  when: "14–16 March · Helsinki and online",
};

const MOCK = {
  announcements: [
    { title: "Kickoff in the main hall", when: "Fri 16:30", body: "Doors open 17:00. Bring a laptop and charger. Dinner is on us." },
    { title: "Sponsor APIs are live", when: "Fri 18:40", body: "Keys are in the sponsors channel. Rate limits are generous for the weekend." },
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
    { name: "Sofia K.", skills: "ML · Python", note: "Wants a frontend partner", fit: 80 },
    { name: "Jonas P.", skills: "React · Rust", note: "Open to any track", fit: 40 },
    { name: "Elena V.", skills: "Product · UX", note: "Has a climate idea", fit: 20 },
  ],
  challenges: [
    { name: "Climate data", sponsor: "Nordic Energy", prize: "€3,000" },
    { name: "Local commerce", sponsor: "Helsinki Merchants", prize: "€2,000" },
    { name: "Open track", sponsor: "Hackhost", prize: "€1,500" },
  ],
  schedule: [
    { time: "Fri 18:00", title: "Kickoff and team forming", place: "Main hall" },
    { time: "Sat 12:00", title: "Mentor office hours", place: "Room B" },
    { time: "Sun 14:00", title: "Submissions close", place: "Online" },
    { time: "Sun 16:00", title: "Demos and awards", place: "Main hall" },
  ],
  people: [
    { name: "Ada Lovelace", email: "ada@example.com", role: "participant", status: "active" },
    { name: "Grace Hopper", email: "grace@example.com", role: "participant", status: "active" },
    { name: "Alan Turing", email: "alan@example.com", role: "participant", status: "pending" },
    { name: "Katherine Johnson", email: "katherine@example.com", role: "judge", status: "active" },
  ],
  teams: [
    { name: "Ferry Stack", size: 3, max: 4, challenge: "Climate data" },
    { name: "Baltic Bits", size: 4, max: 4, challenge: "Local commerce" },
    { name: "Sauna Scripts", size: 2, max: 4, challenge: "Open track" },
  ],
  submissions: [
    { project: "Heatmap Helsinki", team: "Ferry Stack", status: "draft" },
    { project: "Corner Shop API", team: "Baltic Bits", status: "submitted" },
    { project: "Ferry Delay Bot", team: "Sauna Scripts", status: "submitted" },
  ],
};

function ParticipantPage({
  view,
  go,
}: {
  view: ParticipantView;
  go: (view: ParticipantView) => void;
}) {
  switch (view) {
    case "Home":
      return (
        <>
          <PageHeader as="p" title="Home" description={`Next steps for ${EVENT.title}`} />
          <List>
            <ListButton title="Find or create a team" onClick={() => go("Team")} />
            <ListButton title="Match with teammates" onClick={() => go("Match")} />
            <ListButton title="Pick a challenge" onClick={() => go("Challenges")} />
            <ListButton title="Submit your project" onClick={() => go("Submit")} />
          </List>
          <Section as="p" title="Announcements">
            <List>
              {MOCK.announcements.map((a) => (
                <ListItem key={a.title} title={a.title} meta={a.when}>
                  {a.body}
                </ListItem>
              ))}
            </List>
          </Section>
        </>
      );
    case "Team":
      return (
        <>
          <PageHeader as="p"
            title={MOCK.team.name}
            description="3 of 4 seats taken · Climate data"
            actions={<Button variant="secondary">Invite teammate</Button>}
          />
          <List>
            {MOCK.team.members.map((m) => (
              <ListItem key={m.name} title={m.name} aside={<Tag>{m.role}</Tag>} />
            ))}
          </List>
        </>
      );
    case "Match":
      return (
        <>
          <PageHeader as="p" title="Match" description="People in this event looking for a team." />
          <List>
            {MOCK.matches.map((m) => (
              <ListItem
                key={m.name}
                title={m.name}
                meta={m.skills}
                aside={<Tag tone={m.fit >= 60 ? "ok" : "neutral"}>{m.fit}% fit</Tag>}
              >
                {m.note}
              </ListItem>
            ))}
          </List>
        </>
      );
    case "Challenges":
      return (
        <>
          <PageHeader as="p" title="Challenges" description="Pick a track to build for." />
          <List>
            {MOCK.challenges.map((c) => (
              <ListItem
                key={c.name}
                title={c.name}
                meta={`by ${c.sponsor}`}
                aside={<Button size="sm" variant="secondary">Select</Button>}
              >
                Prize {c.prize}
              </ListItem>
            ))}
          </List>
        </>
      );
    case "Submit":
      return (
        <>
          <PageHeader as="p" title="Submit" description="Submissions close Sunday 14:00." />
          <Form onSubmit={(e) => e.preventDefault()}>
            <Field label="Project title" htmlFor="demo-title">
              <Input id="demo-title" defaultValue="Heatmap Helsinki" />
            </Field>
            <Field label="Description" htmlFor="demo-desc">
              <Textarea id="demo-desc" defaultValue="Live heat map of the city's energy use, block by block." />
            </Field>
            <Field label="Repo URL" htmlFor="demo-repo">
              <Input id="demo-repo" defaultValue="https://github.com/ferry-stack/heatmap" />
            </Field>
            <Button type="submit" className="self-start">
              Update submission
            </Button>
          </Form>
        </>
      );
    case "Schedule":
      return <SchedulePage />;
  }
}

function SchedulePage() {
  return (
    <>
      <PageHeader as="p" title="Schedule" description={EVENT.when} />
      <List>
        {MOCK.schedule.map((s) => (
          <ListItem key={s.title} title={s.title} meta={`${s.time} · ${s.place}`} />
        ))}
      </List>
    </>
  );
}

function OrganizerPage({ view }: { view: OrganizerView }) {
  switch (view) {
    case "Overview":
      return (
        <>
          <PageHeader as="p"
            title="Overview"
            description={
              <span className="flex flex-wrap gap-2">
                <Tag tone="ok">published</Tag>
                <Tag>Join: open</Tag>
              </span>
            }
            actions={<Button>Edit page</Button>}
          />
          <StatGrid>
            <Stat label="Participants" value={128} />
            <Stat label="Pending" value={7} tone="accent" />
            <Stat label="Teams" value={34} />
            <Stat label="Submissions" value={12} />
          </StatGrid>
        </>
      );
    case "People":
      return (
        <>
          <PageHeader as="p"
            title="People"
            description="Registrations and roles"
            actions={<Button variant="secondary">Export CSV</Button>}
          />
          <List>
            {MOCK.people.map((p) => (
              <ListItem
                key={p.email}
                title={p.name}
                meta={`${p.email} · ${p.role}`}
                aside={
                  p.status === "pending" ? (
                    <>
                      <Button size="sm">Approve</Button>
                      <Button size="sm" variant="secondary">Reject</Button>
                    </>
                  ) : (
                    <Tag tone={statusTone(p.status)}>{p.status}</Tag>
                  )
                }
              />
            ))}
          </List>
        </>
      );
    case "Teams":
      return (
        <>
          <PageHeader as="p" title="Teams" description="Formed for this weekend" />
          <List>
            {MOCK.teams.map((t) => (
              <ListItem key={t.name} title={t.name} meta={t.challenge} aside={<Tag>{`${t.size}/${t.max}`}</Tag>} />
            ))}
          </List>
        </>
      );
    case "Submissions":
      return (
        <>
          <PageHeader as="p" title="Submissions" description="Projects handed in so far" />
          <List>
            {MOCK.submissions.map((s) => (
              <ListItem
                key={s.project}
                title={s.project}
                meta={s.team}
                aside={<Tag tone={statusTone(s.status)}>{s.status}</Tag>}
              />
            ))}
          </List>
        </>
      );
    case "Schedule":
      return <SchedulePage />;
    case "Judging":
      return (
        <>
          <PageHeader as="p" title="Judging" description="Score submitted projects from 1 to 10." />
          <List>
            {MOCK.submissions
              .filter((s) => s.status === "submitted")
              .map((s) => (
                <ListItem
                  key={s.project}
                  title={s.project}
                  meta={s.team}
                  aside={
                    <>
                      <Input aria-label={`Score for ${s.project}`} type="number" min={1} max={10} className="h-9 w-20" placeholder="–" />
                      <Button size="sm">Save</Button>
                    </>
                  }
                />
              ))}
          </List>
        </>
      );
  }
}

export function DashboardDemo() {
  const [mode, setMode] = useState<Mode>("organizer");
  const [participantView, setParticipantView] = useState<ParticipantView>("Home");
  const [organizerView, setOrganizerView] = useState<OrganizerView>("Overview");

  const views = mode === "participant" ? PARTICIPANT_VIEWS : ORGANIZER_VIEWS;
  const active = mode === "participant" ? participantView : organizerView;

  return (
    <AppShell className="min-h-0 md:h-[680px]">
      <Sidebar className="md:static md:h-full">
        <SidebarHeader title={EVENT.title}>
          {mode === "organizer" ? "Organiser" : "Participant"}
        </SidebarHeader>
        <SidebarSwitch>
          <SidebarSwitchItem active={mode === "participant"} onClick={() => setMode("participant")}>
            Participant
          </SidebarSwitchItem>
          <SidebarSwitchItem active={mode === "organizer"} onClick={() => setMode("organizer")}>
            Organise
          </SidebarSwitchItem>
        </SidebarSwitch>
        <SidebarNav>
          {views.map((v) => (
            <SidebarItem
              key={v}
              active={v === active}
              onClick={() =>
                mode === "participant"
                  ? setParticipantView(v as ParticipantView)
                  : setOrganizerView(v as OrganizerView)
              }
            >
              {v}
            </SidebarItem>
          ))}
        </SidebarNav>
      </Sidebar>
      <AppMain className="md:overflow-y-auto">
        {mode === "participant" ? (
          <ParticipantPage view={participantView} go={setParticipantView} />
        ) : (
          <OrganizerPage view={organizerView} />
        )}
      </AppMain>
    </AppShell>
  );
}
