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
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h1>
      {children ? (
        <div className="text-sm text-zinc-500">{children}</div>
      ) : null}
    </header>
  );
}
