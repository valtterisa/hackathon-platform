import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { marketingUrl } from "@/lib/urls";
import { getSession } from "@/lib/session";

export async function PlatformHeader() {
  const session = await getSession();

  return (
    <header className="wrap sticky top-0 z-40 flex h-14 items-center justify-between bg-white text-sm">
      <div className="flex items-center gap-6">
        <a
          href={marketingUrl("/")}
          className="cursor-pointer text-base font-semibold tracking-tight text-zinc-900"
        >
          hackhost
        </a>
        <nav className="hidden items-center gap-4 text-zinc-600 sm:flex">
          <Link href="/events" className="cursor-pointer hover:text-zinc-900">
            Events
          </Link>
          {session ? (
            <Link
              href="/me/events"
              className="cursor-pointer hover:text-zinc-900"
            >
              My events
            </Link>
          ) : null}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {session ? (
          <>
            <ButtonLink href="/events/new" size="sm">
              Create event
            </ButtonLink>
            <ButtonLink href="/me" size="sm" variant="ghost">
              {session.user.name}
            </ButtonLink>
          </>
        ) : (
          <>
            <ButtonLink href="/login" size="sm" variant="ghost">
              Sign in
            </ButtonLink>
            <ButtonLink href="/signup" size="sm">
              Sign up
            </ButtonLink>
          </>
        )}
      </div>
    </header>
  );
}
