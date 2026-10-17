import Link from "next/link";
import { AppLink, AppTextLink } from "@/components/app-link";

export function SiteHeader() {
  return (
    <header className="wrap sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-100 bg-white/90 text-sm backdrop-blur">
      <Link
        href="/"
        className="cursor-pointer text-base font-semibold tracking-tight text-zinc-900"
      >
        hackhost
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        <AppTextLink
          href="/events"
          className="hidden cursor-pointer text-zinc-600 hover:text-zinc-900 sm:inline"
        >
          Events
        </AppTextLink>
        <AppLink href="/login" size="sm" variant="ghost">
          Sign in
        </AppLink>
        <AppLink href="/signup" size="sm">
          Sign up
        </AppLink>
      </nav>
    </header>
  );
}
