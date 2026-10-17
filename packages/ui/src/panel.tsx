import type { HTMLAttributes } from "react";
import { cn } from "./utils";

const fields = {
  bg: "bg-[var(--bg)] text-[var(--ink)]",
  surface: "bg-[var(--surface)] text-[var(--ink)]",
  mint: "bg-[var(--field-2)] text-[var(--field-2-ink)]",
  orange: "bg-[var(--field-3)] text-[var(--field-3-ink)]",
  grey: "bg-[var(--field-1)] text-[var(--field-1-ink)]",
  ink: "bg-[var(--field-4)] text-[var(--field-4-ink)]",
} as const;

export type Field = keyof typeof fields;

export function Panel({
  field = "bg",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { field?: Field }) {
  return <section className={cn(fields[field], className)} {...props} />;
}

export function Wrap({
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

export function Stack({
  className,
  gap = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & { gap?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gap === "sm" && "gap-3",
        gap === "md" && "gap-6",
        gap === "lg" && "gap-12",
        className,
      )}
      {...props}
    />
  );
}

export function Row({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} {...props} />
  );
}

export function Display({
  className,
  as: Tag = "h1",
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "p" }) {
  return (
    <Tag
      className={cn(
        "font-display uppercase leading-[0.85] tracking-[-0.02em]",
        "text-[clamp(2.75rem,2rem+9vw,10rem)]",
        className,
      )}
      {...props}
    />
  );
}

export function Lead({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "max-w-[40ch] text-[var(--step-lead)] leading-[1.35] text-[inherit]",
        className,
      )}
      {...props}
    />
  );
}
