"use client";

import { useState, type ReactNode } from "react";

const ITEMS = [
  {
    tab: "Host",
    q: "Who can create an event?",
    a: "Anyone with an account. No organiser application queue — publish and run it.",
  },
  {
    tab: "Join",
    q: "How do builders register?",
    a: "They open your /e/slug page and hit Register. Open, apply, or invite-only.",
  },
  {
    tab: "Self-host",
    q: "Can I run it myself?",
    a: "Yes. Docker Compose plus Postgres. Same codebase as managed cloud.",
  },
  {
    tab: "Teams",
    q: "Do you do matching?",
    a: "Inside each event: short skill profiles, teams, invites — not a twenty-question maze.",
  },
  {
    tab: "Price",
    q: "What does it cost?",
    a: "Apache-2.0. Self-host free. Managed billing later if you want hosted.",
  },
] as const;

const fields = ["var(--field-2)", "var(--field-3)", "var(--field-1)"] as const;

function Deck({ children }: { children: ReactNode }) {
  return <div className="relative mx-auto max-w-3xl pb-16">{children}</div>;
}

function Card({
  tab,
  open,
  offset,
  color,
  onOpen,
  children,
}: {
  tab: string;
  open: boolean;
  offset: number;
  color: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="faq-card relative mb-[-56px] w-full px-5 pb-5 pt-12 text-left last:mb-0"
      style={{
        background: color,
        color: "var(--ink)",
        marginLeft: offset,
        zIndex: open ? 20 : offset / 24 + 1,
        paddingBottom: open ? "2rem" : undefined,
      }}
    >
      <span className="absolute left-0 top-0 flex h-10 w-[200px] items-center px-4">
        {tab}
      </span>
      {children}
    </button>
  );
}

export function HomeFaq() {
  const [open, setOpen] = useState(0);

  return (
    <Deck>
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <Card
            key={item.tab}
            tab={item.tab}
            open={isOpen}
            offset={Math.min(i * 24, 96)}
            color={fields[i % fields.length]!}
            onOpen={() => setOpen(i)}
          >
            <span className="block text-[var(--step-lead)] font-medium">
              {item.q}
            </span>
            {isOpen ? (
              <p className="mt-3 max-w-[50ch] text-[var(--step-body)]">{item.a}</p>
            ) : null}
          </Card>
        );
      })}
    </Deck>
  );
}
