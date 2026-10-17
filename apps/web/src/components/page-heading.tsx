import { Display } from "@hackhost/ui";
import type { ReactNode } from "react";

/** App screen title block — compose children instead of title/description props. */
export function PageHeading({ children }: { children: ReactNode }) {
  return <header className="mb-8 space-y-2">{children}</header>;
}

PageHeading.Title = function Title({ children }: { children: ReactNode }) {
  return (
    <Display as="h1" className="text-[clamp(1.75rem,4vw,2.75rem)] normal-case tracking-tight">
      {children}
    </Display>
  );
};

PageHeading.Sub = function Sub({ children }: { children: ReactNode }) {
  return <p className="text-[var(--muted)]">{children}</p>;
};
