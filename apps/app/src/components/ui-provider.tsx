"use client";

import { UiLinkProvider } from "@hackhost/ui";
import Link from "next/link";
import type { ReactNode } from "react";

export function UiProvider({ children }: { children: ReactNode }) {
  return <UiLinkProvider link={Link}>{children}</UiLinkProvider>;
}
