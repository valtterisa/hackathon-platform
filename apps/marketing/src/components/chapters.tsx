import {
  Button,
  Field,
  Input,
  List,
  ListItem,
  Select,
  Tag,
  cn,
} from "@hackhost/ui";
import type { ReactNode } from "react";
import { type Tone, toneClass } from "@/components/tone";

function Fragment({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-ui
      inert
      className={cn("chapter-drift w-full bg-white p-5 text-ink sm:p-6", className)}
    >
      {children}
    </div>
  );
}

function PublishFragment() {
  return (
    <Fragment>
      <p className="font-display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)]">
        Nordic Builders
      </p>
      <p className="mt-3 text-lg font-medium">14–16 March · Helsinki and online</p>
      <p className="mt-1 text-[0.9375rem]">48 hours to ship something real.</p>
      <p className="mt-1 text-sm text-muted">hackhost.dev/e/nordic-builders</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button>Register</Button>
        <Tag tone="ok">€6,500 in prizes</Tag>
      </div>
    </Fragment>
  );
}

function RegisterFragment() {
  return (
    <Fragment>
      <p className="text-lg font-semibold">Register for Nordic Builders</p>
      <div className="mt-5 grid gap-4">
        <Field label="Name" htmlFor="demo-reg-name">
          <Input id="demo-reg-name" defaultValue="Sofia Korhonen" />
        </Field>
        <Field label="I am joining as" htmlFor="demo-reg-role">
          <Select id="demo-reg-role" defaultValue="builder">
            <option value="builder">Builder</option>
          </Select>
        </Field>
        <Button className="justify-self-start">
          Send registration
        </Button>
      </div>
    </Fragment>
  );
}

function TeamFragment() {
  return (
    <Fragment>
      <p className="text-lg font-semibold">Looking for teammates</p>
      <List className="mt-4">
        <ListItem title="Sofia K." meta="ML · Python" aside={<Tag tone="ok">80% fit</Tag>}>
          Wants a frontend partner
        </ListItem>
        <ListItem title="Jonas P." meta="React · Rust" aside={<Tag>40% fit</Tag>}>
          Open to any track
        </ListItem>
        <ListItem title="Elena V." meta="Product · UX" aside={<Tag>20% fit</Tag>}>
          Has a climate idea
        </ListItem>
      </List>
    </Fragment>
  );
}

function ShipFragment() {
  return (
    <Fragment>
      <p className="text-lg font-semibold">Submissions</p>
      <List className="mt-4">
        <ListItem title="Heatmap Helsinki" meta="Ferry Stack" aside={<Tag tone="ok">Submitted</Tag>} />
        <ListItem title="Corner Shop API" meta="Baltic Bits" aside={<Tag tone="ok">Submitted</Tag>} />
        <ListItem title="Ferry Delay Bot" meta="Sauna Scripts" aside={<Tag tone="warn">Draft</Tag>} />
      </List>
    </Fragment>
  );
}

const CHAPTERS: {
  id: string;
  verb: string;
  tone: Tone;
  line: string;
  fragment: ReactNode;
}[] = [
  {
    id: "publish",
    verb: "Publish",
    tone: "grey",
    line: "Your event gets a public page with the dates, the prizes and a register button. It is live the moment you save.",
    fragment: <PublishFragment />,
  },
  {
    id: "register",
    verb: "Register",
    tone: "mint",
    line: "Builders sign up on that page. Open entry, applications you approve, or invite only. You choose per event.",
    fragment: <RegisterFragment />,
  },
  {
    id: "team-up",
    verb: "Team up",
    tone: "orange",
    line: "People list their skills, find each other and form teams inside the event, not in a spreadsheet.",
    fragment: <TeamFragment />,
  },
  {
    id: "ship",
    verb: "Ship",
    tone: "black",
    line: "Teams hand in repo and demo links before the deadline. Judges score them in the same place.",
    fragment: <ShipFragment />,
  },
];

export function Chapters() {
  return (
    <div aria-label="How a hackathon runs on hackhost">
      {CHAPTERS.map((c) => (
        <section
          key={c.id}
          id={c.id}
          data-tone={c.tone}
          data-stagger
          className={cn(
            "flex min-h-[92svh] flex-col justify-between gap-12 px-[var(--margin)] pt-16 pb-[var(--margin)] md:pt-20",
            toneClass[c.tone],
          )}
        >
          <h2 className="reveal font-display text-[clamp(2.75rem,10.2vw,12rem)]">
            {c.verb}
          </h2>
          <div className="grid items-end gap-8 md:grid-cols-12">
            <p className="reveal max-w-[34ch] text-[length:var(--step-lead)] leading-snug font-medium md:col-span-5">
              {c.line}
            </p>
            <div className="reveal md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
              {c.fragment}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
