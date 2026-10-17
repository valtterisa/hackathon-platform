import type { TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-none border-0 bg-[var(--surface)] px-3 py-2 text-[var(--step-body)] text-[var(--ink)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}
