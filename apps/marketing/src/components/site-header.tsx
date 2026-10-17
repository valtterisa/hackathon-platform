"use client";

import { cn } from "@hackhost/ui";
import { useEffect, useState } from "react";
import { AppLink, AppTextLink } from "@/components/app-link";
import { type Tone, toneClass } from "@/components/tone";

const HEADER_LINE = 66;

/** Takes the field colour of whichever `[data-tone]` chapter sits under the bar. */
function useChapterTone(): Tone {
  const [tone, setTone] = useState<Tone>("white");

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const chapters = document.querySelectorAll<HTMLElement>("[data-tone]");
      let next: Tone = "white";
      for (const el of chapters) {
        const r = el.getBoundingClientRect();
        if (r.top <= HEADER_LINE && r.bottom > HEADER_LINE) {
          next = el.dataset.tone as Tone;
        }
      }
      setTone(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    onScroll();
    const events = ["scroll", "resize", "load", "hashchange"] as const;
    for (const e of events) window.addEventListener(e, onScroll, { passive: true });
    return () => {
      for (const e of events) window.removeEventListener(e, onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return tone;
}

const linkClass =
  "hidden h-10 items-center px-3 text-[0.9375rem] font-medium transition-opacity duration-150 hover:opacity-60 sm:flex";

export function SiteHeader() {
  const tone = useChapterTone();
  const dark = tone === "black";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300 ease-out",
        toneClass[tone],
      )}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-[var(--margin)]">
        <a href="/" className="font-display text-base" aria-label="hackhost home">
          hackhost
        </a>
        <nav className="flex items-center gap-1">
          <AppTextLink href="/events" className={linkClass}>
            Events
          </AppTextLink>
          <a href="/#demo" className={linkClass}>
            Demo
          </a>
          <a href="/#faq" className={linkClass}>
            FAQ
          </a>
          <AppTextLink href="/login" className={linkClass}>
            Sign in
          </AppTextLink>
          <AppLink
            href="/events/new"
            size="sm"
            variant={dark ? "accent" : "primary"}
            className="ml-2"
          >
            Create a hackathon
          </AppLink>
        </nav>
      </div>
    </header>
  );
}
