import type { InputHTMLAttributes } from "react";
import { cn } from "./utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1",
        className,
      )}
      {...props}
    />
  );
}
