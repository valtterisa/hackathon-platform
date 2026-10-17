import type { HTMLAttributes, ReactNode } from "react";
import { UiLink } from "./link";
import { cn } from "./utils";

type HeadingTag = "h1" | "h2" | "h3" | "p";

export function PageHeader({
  title,
  description,
  actions,
  className,
  as: Title = "h1",
}: {
  as?: HeadingTag;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className,
      )}
    >
      <div className="min-w-0">
        <Title className="text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] leading-tight font-semibold tracking-[-0.025em]">
          {title}
        </Title>
        {description ? (
          <div className="mt-2 max-w-[60ch] text-base text-muted">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function Section({
  title,
  description,
  actions,
  className,
  children,
  as: Title = "h2",
}: {
  as?: HeadingTag;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("mt-12 first:mt-0", className)}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <Title className="text-lg font-semibold">{title}</Title>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-surface p-5 sm:p-6", className)} {...props} />;
}

export function StatGrid({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-px bg-line lg:grid-cols-4", className)}
      {...props}
    />
  );
}

export function Stat({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: ReactNode;
  tone?: "plain" | "accent";
}) {
  return (
    <div className={cn("p-5", tone === "accent" ? "bg-accent" : "bg-white")}>
      <p className="text-sm text-ink">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] tabular-nums">
        {value}
      </p>
    </div>
  );
}

const listClass = "border-y border-line [&>li+li]:border-t [&>li+li]:border-line"; // taste-skill-ignore: hairline — row dividers in app data lists

export function List({
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(listClass, className)}
      {...props}
    />
  );
}

type ListItemProps = {
  title: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
};

function ListItemBody({ title, meta, aside, children }: ListItemProps) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-medium text-ink">{title}</p>
          {meta ? <p className="text-sm text-muted">{meta}</p> : null}
        </div>
        {children ? (
          <div className="mt-1 text-[0.9375rem] text-ink/80">{children}</div>
        ) : null}
      </div>
      {aside ? (
        <div className="flex shrink-0 items-center gap-2">{aside}</div>
      ) : null}
    </>
  );
}

const rowClass = "flex items-center gap-4 py-4";

export function ListItem({ className, ...props }: ListItemProps) {
  return (
    <li className={cn(rowClass, className)}>
      <ListItemBody {...props} />
    </li>
  );
}

const actionRowClass =
  "-mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center gap-4 px-3 py-4 text-left transition-colors duration-150 hover:bg-surface";

function Arrow() {
  return (
    <span
      aria-hidden
      className="text-lg text-muted transition-transform duration-150 group-hover:translate-x-1 group-hover:text-ink"
    >
      →
    </span>
  );
}

export function ListLink({
  href,
  className,
  ...props
}: ListItemProps & { href: string }) {
  return (
    <li>
      <UiLink href={href} className={cn("group", actionRowClass, className)}>
        <ListItemBody {...props} aside={props.aside ?? <Arrow />} />
      </UiLink>
    </li>
  );
}

export function ListButton({
  onClick,
  className,
  ...props
}: ListItemProps & { onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn("group", actionRowClass, className)}
      >
        <ListItemBody {...props} aside={props.aside ?? <Arrow />} />
      </button>
    </li>
  );
}

const tagTones = {
  neutral: "bg-surface-2 text-ink",
  ok: "bg-accent text-accent-ink",
  warn: "bg-warn text-ink",
  ink: "bg-ink text-white",
} as const;

export function Tag({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof tagTones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center px-2.5 text-sm font-medium capitalize",
        tagTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof tagTones {
  if (["active", "published", "submitted", "open", "checked_in"].includes(status))
    return "ok";
  if (["pending", "waitlisted", "draft", "apply"].includes(status)) return "warn";
  return "neutral";
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="bg-surface px-6 py-12">
      <p className="text-lg font-semibold">{title}</p>
      {children ? (
        <p className="mt-2 max-w-[48ch] text-muted">{children}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Notice({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-accent px-4 py-3 text-[0.9375rem] text-accent-ink", className)}
      {...props}
    />
  );
}

export function Wrap({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl px-[var(--margin)]", className)}
      {...props}
    />
  );
}
