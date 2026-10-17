import { cn } from "@hackhost/ui";
import { AppLink, AppTextLink } from "@/components/app-link";

const LETTERS = [
  { ch: "h", tone: "bg-ink text-white", h: "100%" },
  { ch: "a", tone: "bg-accent text-ink", h: "72%" },
  { ch: "c", tone: "bg-orange text-ink", h: "86%" },
  { ch: "k", tone: "bg-grey text-ink", h: "64%" },
  { ch: "h", tone: "bg-ink text-white", h: "92%" },
  { ch: "o", tone: "bg-accent text-ink", h: "78%" },
  { ch: "s", tone: "bg-orange text-ink", h: "100%" },
  { ch: "t", tone: "bg-grey text-ink", h: "68%" },
] as const;

const linkClass = "text-[0.9375rem] transition-opacity duration-150 hover:opacity-60";

export function SiteFooter() {
  return (
    <footer data-tone="white" className="bg-white px-[var(--margin)] pt-[var(--section)] pb-8">
      <div
        aria-label="hackhost"
        role="img"
        className="flex h-[22svh] items-end gap-1 md:h-[34svh]"
      >
        {LETTERS.map((l, i) => (
          <span
            key={`${l.ch}-${i}`}
            aria-hidden
            className={cn(
              "block-letter font-display flex flex-1 items-end justify-center pb-[0.12em] text-[clamp(2rem,9vw,9rem)] leading-none",
              l.tone,
            )}
            style={{ height: l.h }}
          >
            {l.ch}
          </span>
        ))}
      </div>

      <div className="mt-14 grid gap-10 sm:grid-cols-2 md:grid-cols-12">
        <nav className="flex flex-col gap-3 md:col-span-3" aria-label="Product">
          <p className="font-semibold">Product</p>
          <AppTextLink href="/events" className={linkClass}>Events</AppTextLink>
          <AppTextLink href="/events/new" className={linkClass}>Create a hackathon</AppTextLink>
          <AppTextLink href="/login" className={linkClass}>Sign in</AppTextLink>
          <AppTextLink href="/signup" className={linkClass}>Sign up</AppTextLink>
        </nav>
        <nav className="flex flex-col gap-3 md:col-span-3" aria-label="This page">
          <p className="font-semibold">On this page</p>
          <a href="/#publish" className={linkClass}>How it works</a>
          <a href="/#demo" className={linkClass}>Dashboard demo</a>
          <a href="/#hosting" className={linkClass}>Self-host or managed</a>
          <a href="/#faq" className={linkClass}>Questions</a>
        </nav>
        <nav className="flex flex-col gap-3 md:col-span-2" aria-label="Legal">
          <p className="font-semibold">Legal</p>
          <a href="/privacy" className={linkClass}>Privacy</a>
          <a href="/terms" className={linkClass}>Terms</a>
        </nav>
        <div className="flex flex-col gap-3 md:col-span-4">
          <p className="font-semibold">Open source</p>
          <p className="text-[0.9375rem]">
            Apache-2.0. Self-host with Docker Compose and Postgres, or use a
            managed instance running the same code.
          </p>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm">© {new Date().getFullYear()} hackhost contributors</p>
        <AppLink href="/events/new" size="sm">
          Create a hackathon
        </AppLink>
      </div>
    </footer>
  );
}
