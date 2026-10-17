import { Button } from "@hackhost/ui";
import Link from "next/link";
import { getSession } from "@/lib/session";

export async function PlatformHeader() {
  const session = await getSession();

  return (
    <header className="wrap sticky top-0 z-40 flex h-14 items-center justify-between bg-[var(--bg)] text-[var(--ink)]">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-display text-lg uppercase tracking-tight"
        >
          Hackhost
        </Link>
        <nav className="hidden items-center gap-5 text-[var(--step-body)] sm:flex">
          <Link href="/events" className="hover:underline">
            Events
          </Link>
          {session ? (
            <Link href="/me/events" className="hover:underline">
              My events
            </Link>
          ) : null}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {session ? (
          <>
            <Link href="/events/new">
              <Button size="sm">Create event</Button>
            </Link>
            <Link href="/me">
              <Button size="sm" variant="secondary">
                {session.user.name}
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button size="sm" variant="ghost">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
