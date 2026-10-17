"use client";

import { useState, type ReactNode } from "react";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-[var(--step-body)]">{label}</span>
      {children}
    </label>
  );
}

function Sheet({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[280px] bg-[var(--field-3)] p-6 text-[var(--field-3-ink)] sm:min-h-[340px]">
      {children}
    </div>
  );
}

export function FlyerPreview() {
  const [name, setName] = useState("Nordic Builders");
  const title = name.trim() || "Untitled hack";

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
      <Field label="Name your weekend">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 42))}
          className="w-full bg-[var(--field-4)] px-4 py-4 text-[var(--step-lead)] text-[var(--field-4-ink)] placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          placeholder="Your hackathon title"
          aria-label="Hackathon name for flyer preview"
        />
      </Field>
      <Sheet>
        <p className="text-[var(--step-small)]">Weekend flyer</p>
        <p className="mt-4 font-display text-[clamp(2rem,6vw,4.5rem)] uppercase leading-[0.85]">
          {title}
        </p>
        <p className="mt-6 max-w-[28ch] text-[var(--step-body)]">
          Register on Hackhost. Share one link. Run the room.
        </p>
        <div className="absolute bottom-6 right-6 bg-[var(--accent)] px-4 py-3 text-[var(--accent-ink)]">
          Register
        </div>
      </Sheet>
    </div>
  );
}
