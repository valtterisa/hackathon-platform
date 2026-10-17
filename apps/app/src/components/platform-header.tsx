import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { Wordmark } from "@/components/wordmark";
import { getSession } from "@/lib/session";
import { marketingUrl } from "@/lib/urls";

const navLink =
  "flex h-9 items-center px-3 text-[0.9375rem] text-ink transition-colors duration-150 hover:bg-surface";

export async function PlatformHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-[var(--margin)]">
        <div className="flex items-center gap-6">
          <a href={marketingUrl("/")} aria-label="hackhost home">
            <Wordmark />
          </a>
          <nav className="hidden items-center sm:flex">
            <Link href="/events" className={navLink}>
              Events
            </Link>
            {session ? (
              <Link href="/me/events" className={navLink}>
                My events
              </Link>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/me" className={`${navLink} max-w-40 truncate`}>
                {session.user.name}
              </Link>
              <ButtonLink href="/events/new" size="sm">
                Create event
              </ButtonLink>
            </>
          ) : (
            <>
              <Link href="/login" className={navLink}>
                Sign in
              </Link>
              <ButtonLink href="/signup" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
