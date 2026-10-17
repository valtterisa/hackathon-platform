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
import { Button, Display, Lead } from "@hackhost/ui";
import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Band, BandInner, Photo } from "@/components/marketing";
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
    <>
      <Band field="ink" className="relative min-h-[100svh] overflow-hidden">
        {event.coverUrl ? (
          <div className="absolute inset-0 opacity-40">
            <Photo src={event.coverUrl} alt="" className="h-full" />
          </div>
        ) : null}
        <BandInner className="relative z-10 flex min-h-[100svh] flex-col justify-between py-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="font-display text-lg uppercase">
              Hackhost
            </Link>
            <Link href={ctaHref}>
              <Button size="sm">{ctaLabel}</Button>
            </Link>
          </div>
          <div className="space-y-4">
            <Display className="max-w-[14ch] text-[clamp(3rem,10vw,8rem)]">
              {event.title}
            </Display>
            {when ? <p className="text-[var(--step-lead)]">{when}</p> : null}
            {event.tagline ? <Lead>{event.tagline}</Lead> : null}
          </div>
          <Link href={ctaHref} className="self-start">
            <Button size="lg" variant="accent">
              {ctaLabel}
            </Button>
          </Link>
        </BandInner>
      </Band>

      {event.description ? (
        <Band field="bg" className="py-[var(--section)]">
          <BandInner className="space-y-4">
            <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
              About
            </Display>
            <p className="max-w-[60ch] whitespace-pre-wrap text-[var(--step-body)]">
              {event.description}
            </p>
          </BandInner>
        </Band>
      ) : null}

      {highlightItems.length > 0 ? (
        <Band field="mint" className="py-[var(--section)]">
          <BandInner className="grid gap-6 md:grid-cols-3">
            {highlightItems.map((item) => (
              <p
                key={item}
                className="font-display text-[clamp(1.5rem,3vw,2.5rem)] uppercase leading-[0.95]"
              >
                {item}
              </p>
            ))}
          </BandInner>
        </Band>
      ) : null}

      {eventTracks.length > 0 ? (
        <Band field="grey" className="py-[var(--section)]">
          <BandInner className="space-y-8">
            <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
              Tracks
            </Display>
            <ul className="space-y-6">
              {eventTracks.map((t) => (
                <li key={t.id}>
                  <p className="font-display text-2xl uppercase">{t.name}</p>
                  {t.description ? (
                    <p className="mt-1 max-w-[50ch] text-[var(--step-body)]">
                      {t.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </BandInner>
        </Band>
      ) : null}

      {eventPrizes.length > 0 ? (
        <Band field="orange" className="py-[var(--section)]">
          <BandInner className="space-y-8">
            <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
              Prizes
            </Display>
            <ul className="space-y-6">
              {eventPrizes.map((p) => (
                <li key={p.id} className="md:flex md:items-baseline md:gap-6">
                  <p className="font-display text-2xl uppercase md:min-w-[12ch]">
                    {p.title}
                  </p>
                  <p className="text-[var(--step-lead)]">{p.value}</p>
                  {p.description ? (
                    <p className="text-[var(--step-body)]">{p.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </BandInner>
        </Band>
      ) : null}

      {eventSponsors.length > 0 ? (
        <Band field="surface" className="py-[var(--section)]">
          <BandInner className="space-y-6">
            <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
              Sponsors
            </Display>
            <div className="flex flex-wrap gap-3">
              {eventSponsors.map((s) => (
                <a
                  key={s.id}
                  href={s.url ?? undefined}
                  className="bg-[var(--bg)] px-4 py-3 text-[var(--step-body)]"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </BandInner>
        </Band>
      ) : null}

      {agenda.length > 0 ? (
        <Band field="bg" className="py-[var(--section)]">
          <BandInner className="space-y-8">
            <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
              Agenda
            </Display>
            <ul className="space-y-4">
              {agenda.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-6"
                >
                  <span className="text-[var(--muted)]">
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
          </BandInner>
        </Band>
      ) : null}

      {faqItems.length > 0 ? (
        <Band field="mint" className="py-[var(--section)]">
          <BandInner className="space-y-8">
            <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
              FAQ
            </Display>
            <dl className="space-y-6">
              {faqItems.map((item) => (
                <div key={item.q}>
                  <dt className="font-display text-xl uppercase">{item.q}</dt>
                  <dd className="mt-2 max-w-[50ch] text-[var(--step-body)]">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </BandInner>
        </Band>
      ) : null}

      <Band field="ink" className="sticky bottom-0">
        <BandInner className="flex items-center justify-between gap-4 py-4">
          <p className="font-display text-lg uppercase">{event.title}</p>
          <Link href={ctaHref}>
            <Button variant="accent">{ctaLabel}</Button>
          </Link>
        </BandInner>
      </Band>
    </>
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
