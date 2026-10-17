import { Button } from "@hackhost/ui";
import Link from "next/link";
import { getSession } from "@/lib/session";

export async function PlatformHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            Hackhost
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-[var(--muted-foreground)] sm:flex">
            <Link href="/events" className="hover:text-[var(--foreground)]">
              Events
            </Link>
            {session ? (
              <Link href="/me/events" className="hover:text-[var(--foreground)]">
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
                <Button size="sm" variant="ghost">
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
      </div>
    </header>
  );
}
