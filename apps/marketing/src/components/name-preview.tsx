"use client";

import { Input } from "@hackhost/ui";
import { useState } from "react";
import { AppLink } from "@/components/app-link";

const FALLBACK = "Nordic Builders";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function NamePreview() {
  const [name, setName] = useState("");
  const title = name.trim() || FALLBACK;
  const slug = slugify(title) || "your-event";

  return (
    <div className="bg-accent p-5 sm:p-7">
      <label htmlFor="hero-name" className="block text-base font-medium">
        Name your hackathon
      </label>
      <Input
        id="hero-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={FALLBACK}
        maxLength={60}
        autoComplete="off"
        className="mt-3 h-12 border-ink text-base"
      />

      <div className="mt-6 bg-white p-5" aria-live="polite">
        <p className="font-display line-clamp-2 text-[clamp(1.5rem,1rem+1.6vw,2.25rem)] break-words">
          {title}
        </p>
        <p className="mt-3 text-[0.9375rem]">Registration open · Teams of up to 4</p>
        <p className="mt-1 text-sm text-muted">hackhost.dev/e/{slug}</p>
      </div>

      <AppLink
        href={`/events/new?title=${encodeURIComponent(title)}`}
        size="lg"
        className="mt-5 w-full"
      >
        Create “{title.length > 24 ? `${title.slice(0, 24)}…` : title}”
      </AppLink>
    </div>
  );
}
