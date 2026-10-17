import type { InputHTMLAttributes } from "react";
import { cn } from "./utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-[var(--radius)] border-0 bg-[var(--surface)] px-3 font-sans text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1",
        className,
      )}
      {...props}
    />
  );
}
