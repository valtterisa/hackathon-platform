"use client";

import { cn } from "@hackhost/ui";
import { useState } from "react";

const ITEMS = [
  {
    topic: "Who",
    q: "Who can create a hackathon?",
    a: "Anyone with an account. There is no approval queue: you publish it, you run it, and you can invite co-organisers by link.",
  },
  {
    topic: "Joining",
    q: "How do builders register?",
    a: "They open your event page and register. Each event is open to all, by application that you approve, or invite only.",
  },
  {
    topic: "Self-host",
    q: "Can I run it on my own server?",
    a: "Yes. Docker Compose and Postgres, from the same repository the managed version runs on. Nothing is held back.",
  },
  {
    topic: "Roles",
    q: "Which roles are there?",
    a: "Organiser, participant, judge and mentor, set per event. A judge in one event can be a builder in the next.",
  },
  {
    topic: "Teams",
    q: "Is there teammate matching?",
    a: "Builders add their skills and what they are looking for, then see who fits. Teams form inside the event with invite links.",
  },
  {
    topic: "Licence",
    q: "What is the licence?",
    a: "Apache-2.0. Use it, change it and host it for your own events or for others.",
  },
] as const;

const CARD_TONES = ["bg-accent", "bg-orange", "bg-grey"] as const;

export function HomeFaq() {
  const [open, setOpen] = useState(0);

  return (
    <div className="pt-10">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        const tone = CARD_TONES[i % CARD_TONES.length];
        return (
          <div
            key={item.topic}
            className={cn("relative mt-10 first:mt-0", tone)}
            style={{ zIndex: i + 1 }}
          >
            <span
              aria-hidden
              className={cn(
                "absolute -top-10 flex h-10 w-[120px] items-center px-4 text-base font-medium sm:w-[200px]",
                tone,
                "left-[calc(var(--i)*48px)] sm:left-[calc(var(--i)*150px)]",
              )}
              style={{ ["--i" as string]: i % 4 }}
            >
              {item.topic}
            </span>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(i)}
              className="flex w-full cursor-pointer items-center justify-between gap-6 px-5 pt-6 pb-12 text-left sm:px-8"
            >
              <span className="text-xl font-medium">{item.q}</span>
              <span
                aria-hidden
                className={cn(
                  "text-2xl transition-transform duration-200 ease-out",
                  isOpen && "rotate-45",
                )}
              >
                +
              </span>
            </button>
            <div id={`faq-${i}`} hidden={!isOpen}>
              <p className="faq-answer -mt-6 max-w-[50ch] px-5 pb-12 text-[1.0625rem] sm:px-8">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
