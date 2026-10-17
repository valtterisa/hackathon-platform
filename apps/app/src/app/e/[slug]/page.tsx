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
import { cn, List, ListItem, Tag } from "@hackhost/ui";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/button-link";
import { Wordmark } from "@/components/wordmark";
import { getSession } from "@/lib/session";
import { marketingUrl } from "@/lib/urls";

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

  const highlightItems =
    (
      blocks.find((b) => b.type === "highlights")?.content as {
        items?: string[];
      }
    )?.items ?? [];
  const faqItems =
    (
      blocks.find((b) => b.type === "faq")?.content as {
        items?: { q: string; a: string }[];
      }
    )?.items ?? [];

  const session = await getSession();
  let ctaHref = `/e/${slug}/register`;
  let ctaLabel = "Register";
  if (session) {
    const membership = await db.query.hackathonMemberships.findFirst({
      where: and(
        eq(hackathonMemberships.hackathonId, event.id),
        eq(hackathonMemberships.userId, session.user.id),
        eq(hackathonMemberships.status, "active"),
      ),
    });
    if (membership) {
      ctaHref =
        membership.role === "organizer"
          ? `/e/${slug}/manage`
          : `/e/${slug}/home`;
      ctaLabel = "Continue";
    }
  }

  const when = [
    event.startsAt?.toLocaleDateString(),
    event.location ?? event.mode.replace("_", " "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-[var(--margin)]">
        <a href={marketingUrl("/")} className="cursor-pointer text-ink">
          <Wordmark />
        </a>
        <ButtonLink href={ctaHref} size="sm">
          {ctaLabel}
        </ButtonLink>
      </header>

      <section className="mx-auto w-full max-w-6xl px-[var(--margin)] pt-16 pb-24 sm:pt-24 sm:pb-32">
        {event.status === "draft" ? (
          <Tag tone="warn" className="mb-8 normal-case">
            Draft — only organisers can see this
          </Tag>
        ) : null}
        <h1 className="font-display line-clamp-2 max-w-[14ch] text-[clamp(2.75rem,9vw,8rem)] text-balance">
          {event.title}
        </h1>
        {when ? (
          <p className="mt-6 text-2xl font-medium capitalize">{when}</p>
        ) : null}
        {event.tagline ? (
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed sm:text-xl">
            {event.tagline}
          </p>
        ) : null}
        <ButtonLink href={ctaHref} size="lg" variant="accent" className="mt-10">
          {ctaLabel}
        </ButtonLink>
      </section>

      {highlightItems.length > 0 ? (
        <Band className="bg-accent text-accent-ink">
          <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {highlightItems.map((item) => (
              <li
                key={item}
                className="text-2xl leading-snug font-semibold tracking-[-0.02em] text-balance"
              >
                {item}
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {event.description ? (
        <Band>
          <BandHeading>About</BandHeading>
          <p className="max-w-[65ch] text-lg leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </Band>
      ) : null}

      {eventTracks.length > 0 ? (
        <Band className="bg-surface">
          <BandHeading>Tracks</BandHeading>
          <List className="border-ink/15 [&>li+li]:border-ink/15">
            {eventTracks.map((t) => (
              <ListItem key={t.id} title={<Big>{t.name}</Big>}>
                {t.description ? <Body>{t.description}</Body> : null}
              </ListItem>
            ))}
          </List>
        </Band>
      ) : null}

      {eventPrizes.length > 0 ? (
        <Band className="bg-orange">
          <BandHeading>Prizes</BandHeading>
          <List className="border-ink/25 [&>li+li]:border-ink/25">
            {eventPrizes.map((p) => (
              <ListItem
                key={p.id}
                title={<Big>{p.title}</Big>}
                aside={
                  p.value ? (
                    <span className="text-xl font-semibold tabular-nums">
                      {p.value}
                    </span>
                  ) : null
                }
              >
                {p.description ? <Body>{p.description}</Body> : null}
              </ListItem>
            ))}
          </List>
        </Band>
      ) : null}

      {agenda.length > 0 ? (
        <Band>
          <BandHeading>Schedule</BandHeading>
          <List>
            {agenda.map((item) => (
              <ListItem
                key={item.id}
                title={<Big>{item.title}</Big>}
                meta={
                  <span className="text-base text-ink">
                    {item.startsAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {item.location ? ` · ${item.location}` : ""}
                  </span>
                }
              />
            ))}
          </List>
        </Band>
      ) : null}

      {eventSponsors.length > 0 ? (
        <Band className="bg-grey">
          <BandHeading>Sponsors</BandHeading>
          <ul className="flex flex-wrap gap-2">
            {eventSponsors.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url ?? undefined}
                  className="inline-flex h-12 items-center bg-white px-5 text-base font-medium text-ink transition-colors duration-150 hover:bg-accent"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {faqItems.length > 0 ? (
        <Band>
          <BandHeading>FAQ</BandHeading>
          <List>
            {faqItems.map((item) => (
              <ListItem key={item.q} title={<Big>{item.q}</Big>}>
                <Body>{item.a}</Body>
              </ListItem>
            ))}
          </List>
        </Band>
      ) : null}

      <Band className="bg-ink text-white">
        <h2 className="font-display line-clamp-2 max-w-[16ch] text-[clamp(2rem,6vw,5rem)] text-balance">
          {event.title}
        </h2>
        {when ? (
          <p className="mt-6 text-2xl font-medium capitalize">{when}</p>
        ) : null}
        <ButtonLink href={ctaHref} size="lg" variant="inverse" className="mt-10">
          {ctaLabel}
        </ButtonLink>
      </Band>
    </div>
  );
}

function Band({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("py-[clamp(4rem,9vw,8rem)]", className)}>
      <div className="mx-auto w-full max-w-6xl px-[var(--margin)]">
        {children}
      </div>
    </section>
  );
}

function BandHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display mb-10 line-clamp-2 text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)] text-balance">
      {children}
    </h2>
  );
}

function Big({ children }: { children: ReactNode }) {
  return <span className="text-xl font-semibold">{children}</span>;
}

function Body({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[65ch] text-base leading-relaxed text-ink">{children}</p>
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
