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
import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { Frame, Shell, ShellInner } from "@/components/marketing";
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
    <Shell className="min-h-screen pb-20">
      <header className="border-b border-zinc-100">
        <ShellInner className="flex h-14 items-center justify-between text-sm">
          <Link
            href="/"
            className="cursor-pointer font-semibold tracking-tight text-zinc-900"
          >
            hackhost
          </Link>
          <ButtonLink href={ctaHref} size="sm">
            {ctaLabel}
          </ButtonLink>
        </ShellInner>
      </header>

      <ShellInner className="space-y-5 py-14 sm:py-20">
        <h1 className="max-w-[18ch] text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight text-zinc-900">
          {event.title}
        </h1>
        {when ? <p className="text-zinc-500">{when}</p> : null}
        {event.tagline ? (
          <p className="max-w-[46ch] text-lg leading-relaxed text-zinc-600">
            {event.tagline}
          </p>
        ) : null}
        {event.status === "draft" ? (
          <p className="text-sm text-amber-700">
            Draft — only organisers can see this
          </p>
        ) : null}
        <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
      </ShellInner>

      <ShellInner className="space-y-12 pb-12">
        {event.description ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              About
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-600">
              {event.description}
            </p>
          </section>
        ) : null}

        {highlightItems.length > 0 ? (
          <Frame>
            <ul className="divide-y divide-zinc-100">
              {highlightItems.map((item) => (
                <li key={item} className="px-4 py-3 font-medium text-zinc-900">
                  {item}
                </li>
              ))}
            </ul>
          </Frame>
        ) : null}

        {eventTracks.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Tracks
            </h2>
            <Frame>
              <ul className="divide-y divide-zinc-100">
                {eventTracks.map((t) => (
                  <li key={t.id} className="px-4 py-4">
                    <p className="font-semibold text-zinc-900">{t.name}</p>
                    {t.description ? (
                      <p className="mt-1 text-sm text-zinc-600">
                        {t.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Frame>
          </section>
        ) : null}

        {eventPrizes.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Prizes
            </h2>
            <Frame>
              <ul className="divide-y divide-zinc-100">
                {eventPrizes.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-4"
                  >
                    <span className="font-semibold text-zinc-900">{p.title}</span>
                    <span className="text-zinc-700">{p.value}</span>
                    {p.description ? (
                      <span className="w-full text-sm text-zinc-600">
                        {p.description}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Frame>
          </section>
        ) : null}

        {eventSponsors.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Sponsors
            </h2>
            <div className="flex flex-wrap gap-2">
              {eventSponsors.map((s) => (
                <a
                  key={s.id}
                  href={s.url ?? undefined}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {agenda.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Agenda
            </h2>
            <Frame>
              <ul className="divide-y divide-zinc-100">
                {agenda.map((item) => (
                  <li
                    key={item.id}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[6rem_1fr]"
                  >
                    <span className="text-sm text-zinc-500">
                      {item.startsAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>
                      <strong className="text-zinc-900">{item.title}</strong>
                      {item.location ? (
                        <span className="text-zinc-500">
                          {" "}
                          · {item.location}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </Frame>
          </section>
        ) : null}

        {faqItems.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              FAQ
            </h2>
            <Frame>
              <dl className="divide-y divide-zinc-100">
                {faqItems.map((item) => (
                  <div key={item.q} className="px-4 py-4">
                    <dt className="font-semibold text-zinc-900">{item.q}</dt>
                    <dd className="mt-1 text-sm text-zinc-600">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </Frame>
          </section>
        ) : null}
      </ShellInner>

      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white">
        <ShellInner className="flex items-center justify-between gap-4 py-3">
          <p className="truncate text-sm font-medium text-zinc-900">
            {event.title}
          </p>
          <ButtonLink href={ctaHref} size="sm">
            {ctaLabel}
          </ButtonLink>
        </ShellInner>
      </div>
    </Shell>
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
