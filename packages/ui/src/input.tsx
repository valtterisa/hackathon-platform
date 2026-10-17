import type { InputHTMLAttributes } from "react";
import { cn } from "./utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-none border-0 bg-[var(--surface)] px-3 py-2 text-[var(--step-body)] text-[var(--ink)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}
