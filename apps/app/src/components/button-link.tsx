import { buttonVariants, type ButtonVariantProps, cn } from "@hackhost/ui";
import Link from "next/link";
import type { ComponentProps } from "react";

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonVariantProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
