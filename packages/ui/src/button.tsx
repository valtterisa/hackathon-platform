import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none text-sm font-medium transition-[transform,background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-95",
        secondary: "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--field-1)]",
        outline: "bg-[var(--field-1)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--field-4-ink)]",
        ghost: "bg-transparent text-[var(--ink)] hover:bg-[var(--surface)]",
        danger: "bg-[var(--danger)] text-white hover:brightness-95",
        accent: "bg-[var(--field-3)] text-[var(--field-3-ink)] hover:brightness-95",
        invert: "bg-[var(--field-4)] text-[var(--field-4-ink)] hover:bg-[var(--ink)]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-14 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
