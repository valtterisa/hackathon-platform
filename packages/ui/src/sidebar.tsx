import type { HTMLAttributes, ReactNode } from "react";
import { UiLink } from "./link";
import { cn } from "./utils";

export function AppShell({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-ui
      className={cn("flex min-h-dvh flex-col bg-white md:flex-row", className)}
      {...props}
    />
  );
}

export function Sidebar({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col bg-surface text-[0.9375rem] md:sticky md:top-0 md:h-dvh md:w-64",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-5 pt-6 pb-5">
      <p className="text-lg leading-tight font-semibold tracking-[-0.02em]">
        {title}
      </p>
      {children ? <div className="mt-1.5 text-sm text-muted">{children}</div> : null}
    </div>
  );
}

export function SidebarSwitch({ children }: { children: ReactNode }) {
  return (
    <div className="mx-3 mb-3 grid grid-cols-2 gap-1 bg-surface-2 p-1 text-sm">
      {children}
    </div>
  );
}

const switchItemClass = (active: boolean) =>
  cn(
    "flex h-9 cursor-pointer items-center justify-center font-medium transition-colors duration-150",
    active ? "bg-white text-ink" : "text-muted hover:text-ink",
  );

export function SidebarSwitchItem({
  active,
  href,
  onClick,
  children,
}: {
  active: boolean;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (href) {
    return (
      <UiLink href={href} className={switchItemClass(active)} aria-current={active ? "page" : undefined}>
        {children}
      </UiLink>
    );
  }
  return (
    <button type="button" onClick={onClick} className={switchItemClass(active)} aria-pressed={active}>
      {children}
    </button>
  );
}

export function SidebarNav({ children }: { children: ReactNode }) {
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-y-auto">
      {children}
    </nav>
  );
}

const itemClass = (active: boolean) =>
  cn(
    "flex h-10 shrink-0 cursor-pointer items-center px-3 text-left transition-colors duration-150",
    active
      ? "bg-ink font-medium text-white"
      : "text-ink hover:bg-surface-2",
  );

export function SidebarItem({
  active = false,
  href,
  onClick,
  children,
}: {
  active?: boolean;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (href) {
    return (
      <UiLink href={href} className={itemClass(active)} aria-current={active ? "page" : undefined}>
        {children}
      </UiLink>
    );
  }
  return (
    <button type="button" onClick={onClick} className={itemClass(active)} aria-current={active ? "page" : undefined}>
      {children}
    </button>
  );
}

export function SidebarFooter({ children }: { children: ReactNode }) {
  return (
    <div className="hidden flex-col gap-1 px-3 pb-4 text-sm md:flex">
      {children}
    </div>
  );
}

export function SidebarFooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <UiLink
      href={href}
      className="flex h-9 items-center px-3 text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
    >
      {children}
    </UiLink>
  );
}

export function AppMain({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className={cn("min-w-0 flex-1 bg-white", className)}>
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 md:py-12">{children}</div>
    </main>
  );
}
