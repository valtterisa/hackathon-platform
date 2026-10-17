import { cn } from "@hackhost/ui";
import type { HTMLAttributes, ReactNode } from "react";

export function Shell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={cn("bg-white text-zinc-900", className)} {...props}>
      {children}
    </section>
  );
}

export function ShellInner({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-3xl px-[var(--margin)]", className)}
      {...props}
    />
  );
}

export function Frame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
