import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg font-sans text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700 hover:border-zinc-700 hover:text-white",
        soft: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900",
        ghost:
          "border border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-5",
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
