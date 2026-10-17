import { cn } from "@hackhost/ui";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-[0.9375rem] tracking-[-0.01em]", className)}>
      hackhost
    </span>
  );
}
