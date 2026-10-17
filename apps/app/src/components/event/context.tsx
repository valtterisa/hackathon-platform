"use client";

import { createContext, useContext, type ReactNode } from "react";

type EventValue = {
  slug: string;
  title: string;
  canOrganize: boolean;
};

const EventContext = createContext<EventValue | null>(null);

export function EventProvider({
  value,
  children,
}: {
  value: EventValue;
  children: ReactNode;
}) {
  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent needs EventProvider");
  return ctx;
}
