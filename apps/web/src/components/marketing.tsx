import { cn } from "@hackhost/ui";
import type { HTMLAttributes, ReactNode } from "react";

export function Band({
  field = "bg",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  field?: "bg" | "surface" | "mint" | "orange" | "grey" | "ink";
  children: ReactNode;
}) {
  const map = {
    bg: "bg-[var(--bg)] text-[var(--ink)]",
    surface: "bg-[var(--surface)] text-[var(--ink)]",
    mint: "bg-[var(--field-2)] text-[var(--field-2-ink)]",
    orange: "bg-[var(--field-3)] text-[var(--field-3-ink)]",
    grey: "bg-[var(--field-1)] text-[var(--field-1-ink)]",
    ink: "bg-[var(--field-4)] text-[var(--field-4-ink)]",
  } as const;

  return (
    <section className={cn(map[field], className)} {...props}>
      {children}
    </section>
  );
}

export function BandInner({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-[var(--margin)]", className)}
      {...props}
    />
  );
}

export function Photo({
  src,
  alt,
  className,
  tilt,
}: {
  src: string;
  alt: string;
  className?: string;
  tilt?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        "block h-full w-full object-cover",
        tilt && "tilt-photo origin-center",
        className,
      )}
    />
  );
}

export function Mark({ word = "HACKHOST" }: { word?: string }) {
  return (
    <div className="hh-footer-mark" aria-hidden>
      {word.split("").map((letter, i) => (
        <span key={`${letter}-${i}`}>{letter}</span>
      ))}
    </div>
  );
}

export function Credits({ children }: { children: ReactNode }) {
  return <p className="credits wrap py-6">{children}</p>;
}
