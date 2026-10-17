import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("rounded-xl border border-zinc-200 bg-white", className)}
      {...props}
    />
  );
}

export function Wrap({
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

export function Stack({
  className,
  gap = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & { gap?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gap === "sm" && "gap-2",
        gap === "md" && "gap-4",
        gap === "lg" && "gap-8",
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
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
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
        "font-sans text-[var(--step-display)] font-semibold tracking-tight text-zinc-900",
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
      className={cn("max-w-[52ch] text-lg leading-relaxed text-zinc-600", className)}
      {...props}
    />
  );
}
