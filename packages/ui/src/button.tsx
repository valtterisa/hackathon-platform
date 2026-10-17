import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-[var(--radius)] font-sans text-sm font-medium transition-[color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-zinc-700 hover:text-[var(--accent-ink)]",
        soft: "bg-[var(--surface)] text-[var(--ink)] hover:bg-zinc-200",
        ghost:
          "bg-transparent text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
