import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-[background-color,color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-[#2e2e2e] hover:text-white",
        accent: "bg-accent text-accent-ink hover:bg-accent-hover hover:text-accent-ink",
        secondary: "bg-surface-2 text-ink hover:bg-line-strong hover:text-ink",
        ghost: "bg-transparent text-ink hover:bg-surface hover:text-ink",
        danger: "bg-danger text-white hover:bg-[#a52a08] hover:text-white",
        inverse: "bg-white text-ink hover:bg-accent hover:text-accent-ink",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-[0.9375rem]",
        lg: "h-14 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
