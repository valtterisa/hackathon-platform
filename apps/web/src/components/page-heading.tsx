import { Display } from "@hackhost/ui";
import type { ReactNode } from "react";

export function PageHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 space-y-2">
      <Display
        as="h1"
        className="text-[clamp(1.75rem,4vw,2.75rem)] normal-case tracking-tight"
      >
        {title}
      </Display>
      {children}
    </header>
  );
}
