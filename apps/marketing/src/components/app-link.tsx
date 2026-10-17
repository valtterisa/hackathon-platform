import { buttonVariants, type ButtonVariantProps, cn } from "@hackhost/ui";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { appUrl } from "@/lib/urls";

/** Link into the product app (different origin in local/prod). */
export function AppLink({
  href,
  variant,
  size,
  className,
  children,
  ...props
}: {
  href: string;
  children: ReactNode;
} & ButtonVariantProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a
      href={appUrl(href)}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </a>
  );
}

export function AppTextLink({
  href,
  className,
  children,
  ...props
}: {
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a href={appUrl(href)} className={className} {...props}>
      {children}
    </a>
  );
}
