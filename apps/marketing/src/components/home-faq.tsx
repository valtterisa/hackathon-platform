"use client";

import { useState } from "react";
import { Frame } from "@/components/marketing";

const ITEMS = [
  {
    key: "who",
    q: "Who can create a hackathon?",
    a: "Anyone signed in. No organiser approval queue — you publish, you run it.",
  },
  {
    key: "register",
    q: "How do builders register?",
    a: "They open your event page and register. Join modes: open, apply, or invite only.",
  },
  {
    key: "selfhost",
    q: "Can I self-host?",
    a: "Yes. Docker Compose plus the same codebase as managed hosting.",
  },
  {
    key: "match",
    q: "Is there teammate matching?",
    a: "Per-event skill profiles and teams — without a twenty-question maze.",
  },
  {
    key: "license",
    q: "What is the license?",
    a: "Apache-2.0. Self-host for free.",
  },
] as const;

export function HomeFaq() {
  const [open, setOpen] = useState<string | null>("who");

  return (
    <Frame>
      <ul>
        {ITEMS.map((item, i) => {
          const isOpen = open === item.key;
          return (
            <li
              key={item.key}
              className={i < ITEMS.length - 1 ? "border-b border-zinc-100" : ""}
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-start justify-between gap-4 px-4 py-4 text-left hover:bg-zinc-50"
                onClick={() => setOpen(isOpen ? null : item.key)}
                aria-expanded={isOpen}
              >
                <span>
                  <span className="font-medium text-zinc-900">{item.q}</span>
                  {isOpen ? (
                    <span className="mt-2 block text-sm leading-relaxed text-zinc-600">
                      {item.a}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-zinc-400" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}
