import { db } from "@hackhost/db";
import {
  hackathonMemberships,
  hackathonPageBlocks,
  hackathons,
  prizes,
  scheduleItems,
  sponsors,
  tracks,
} from "@hackhost/db/schema";
import { Button } from "@hackhost/ui";
import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function EventMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await db.query.hackathons.findFirst({
    where: eq(hackathons.slug, slug),
  });
  if (!event || (event.status === "draft" && !(await canSeeDraft(event.id)))) {
    notFound();
  }

  const [blocks, eventSponsors, eventPrizes, eventTracks, agenda] =
    await Promise.all([
      db.query.hackathonPageBlocks.findMany({
        where: eq(hackathonPageBlocks.hackathonId, event.id),
        orderBy: [asc(hackathonPageBlocks.sortOrder)],
      }),
      db.query.sponsors.findMany({
        where: eq(sponsors.hackathonId, event.id),
        orderBy: [asc(sponsors.sortOrder)],
      }),
      db.query.prizes.findMany({
        where: eq(prizes.hackathonId, event.id),
        orderBy: [asc(prizes.sortOrder)],
      }),
      db.query.tracks.findMany({
        where: eq(tracks.hackathonId, event.id),
        orderBy: [asc(tracks.sortOrder)],
      }),
      db.query.scheduleItems.findMany({
        where: eq(scheduleItems.hackathonId, event.id),
        orderBy: [asc(scheduleItems.sortOrder)],
        limit: 5,
      }),
    ]);

  const highlights = blocks.find((b) => b.type === "highlights");
  const faq = blocks.find((b) => b.type === "faq");
  const highlightItems =
    (highlights?.content as { items?: string[] })?.items ?? [];
  const faqItems =
    (faq?.content as { items?: { q: string; a: string }[] })?.items ?? [];

  const session = await getSession();
  let primaryHref = `/e/${slug}/register`;
  let primaryLabel = "Register";
  let secondaryHref = `/e/${slug}/login`;
  let secondaryLabel = "Participant login";
  let showSecondary = true;

  if (session) {
    const membership = await db.query.hackathonMemberships.findFirst({
      where: and(
        eq(hackathonMemberships.hackathonId, event.id),
        eq(hackathonMemberships.userId, session.user.id),
        eq(hackathonMemberships.status, "active"),
      ),
    });
    if (membership) {
      primaryHref =
        membership.role === "organizer"
          ? `/e/${slug}/manage`
          : `/e/${slug}/home`;
      primaryLabel =
        membership.role === "organizer" ? "Organizer tools" : "Open dashboard";
      showSecondary = membership.role === "organizer";
      secondaryHref = `/e/${slug}/home`;
      secondaryLabel = "Participant view";
    } else {
      primaryHref = `/e/${slug}/register`;
      primaryLabel = "Complete registration";
      showSecondary = false;
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 text-white mix-blend-difference sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold">
          Hackhost
        </Link>
        <div className="flex items-center gap-2">
          {showSecondary ? (
            <Link href={secondaryHref}>
              <Button size="sm" variant="outline">
                {secondaryLabel}
              </Button>
            </Link>
          ) : null}
          <Link href={primaryHref}>
            <Button size="sm" variant="accent">
              {primaryLabel}
            </Button>
          </Link>
        </div>
      </header>

      <section
        className="relative flex min-h-[72vh] items-end bg-cover bg-center px-4 pb-16 pt-28 sm:px-8"
        style={{
          backgroundImage: event.coverUrl
            ? `linear-gradient(to top, rgba(8,16,12,.92), rgba(8,16,12,.35)), url(${event.coverUrl})`
            : "linear-gradient(135deg,#0b6e4f,#0f1a14)",
        }}
      >
        <div className="mx-auto w-full max-w-5xl text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            {event.mode.replace("_", " ")}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            {event.title}
          </h1>
          {event.tagline ? (
            <p className="mt-4 max-w-2xl text-lg text-white/85">{event.tagline}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
            {event.startsAt ? (
              <span className="mr-2">
                {event.startsAt.toLocaleString()} –{" "}
                {event.endsAt?.toLocaleString() ?? ""}
              </span>
            ) : null}
            <Link href={primaryHref}>
              <Button size="lg" variant="accent">
                {primaryLabel}
              </Button>
            </Link>
            {showSecondary ? (
              <Link
                href={secondaryHref}
                className="inline-flex h-12 items-center rounded-xl border border-white/40 px-6 text-base font-medium text-white transition hover:bg-white/10"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-16 px-4 py-16 sm:px-8">
        {event.description ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">About</h2>
            <p className="mt-3 whitespace-pre-wrap text-[var(--muted-foreground)]">
              {event.description}
            </p>
          </section>
        ) : null}

        {highlightItems.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">Highlights</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {highlightItems.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {eventTracks.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">Tracks</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {eventTracks.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {eventPrizes.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">Prizes</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {eventPrizes.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <p className="font-medium">{p.title}</p>
                  {p.value ? (
                    <p className="text-[var(--accent)]">{p.value}</p>
                  ) : null}
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {eventSponsors.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">Sponsors</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {eventSponsors.map((s) => (
                <a
                  key={s.id}
                  href={s.url ?? "#"}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium"
                >
                  {s.name}
                  <span className="ml-2 text-[var(--muted-foreground)]">
                    {s.tier}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {agenda.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">Agenda</h2>
            <ul className="mt-4 space-y-2">
              {agenda.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-[var(--border)] py-3 text-sm"
                >
                  <span className="w-28 shrink-0 text-[var(--muted-foreground)]">
                    {item.startsAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    {item.location ? ` · ${item.location}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={`/e/${slug}/schedule`}
              className="mt-3 inline-block text-sm text-[var(--primary)] underline"
            >
              Full schedule
            </Link>
          </section>
        ) : null}

        {faqItems.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">FAQ</h2>
            <div className="mt-4 space-y-4">
              {faqItems.map((item) => (
                <div key={item.q}>
                  <p className="font-medium">{item.q}</p>
                  <p className="text-[var(--muted-foreground)]">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--card)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="font-medium">{event.title}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Register or log in for the participant dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showSecondary ? (
              <Link href={secondaryHref}>
                <Button variant="outline">{secondaryLabel}</Button>
              </Link>
            ) : null}
            <Link href={primaryHref}>
              <Button variant="accent">{primaryLabel}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

async function canSeeDraft(hackathonId: string) {
  const session = await getSession();
  if (!session) return false;
  const m = await db.query.hackathonMemberships.findFirst({
    where: and(
      eq(hackathonMemberships.hackathonId, hackathonId),
      eq(hackathonMemberships.userId, session.user.id),
      eq(hackathonMemberships.role, "organizer"),
    ),
  });
  return Boolean(m);
}
