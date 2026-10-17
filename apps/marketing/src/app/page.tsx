import { AppLink } from "@/components/app-link";
import { Chapters } from "@/components/chapters";
import { DashboardDemo } from "@/components/dashboard-demo";
import { HomeFaq } from "@/components/home-faq";
import { NamePreview } from "@/components/name-preview";

export default function HomePage() {
  return (
    <>
      <section
        data-tone="white"
        className="flex min-h-[calc(100svh-4rem)] flex-col justify-between gap-12 px-[var(--margin)] pt-[8svh] pb-[clamp(4rem,10svh,7rem)]"
      >
        <h1 className="font-display text-[clamp(2.25rem,9.2vw,11rem)] leading-[0.86]">
          <span className="mask-line">
            <span className="text-[#8c8c8c]">Host the</span>
          </span>
          <span className="mask-line">
            <span>hackathon</span>
          </span>
        </h1>

        <div className="grid items-end gap-10 md:grid-cols-12" data-stagger>
          <div className="md:col-span-6 lg:col-span-5">
            <p className="reveal max-w-[34ch] text-[length:var(--step-lead)] leading-snug">
              An open-source platform for the whole weekend: the public event
              page, registration, teams, submissions and judging. Self-host it
              for free or let us run it.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3">
              <AppLink href="/events/new" size="lg">
                Create a hackathon
              </AppLink>
              <AppLink href="/events" size="lg" variant="secondary">
                Browse events
              </AppLink>
            </div>
          </div>
          <div className="reveal md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
            <NamePreview />
          </div>
        </div>
      </section>

      <Chapters />

      <section
        id="demo"
        data-tone="white"
        data-stagger
        className="px-[var(--margin)] py-[var(--section)]"
      >
        <div className="grid gap-6 md:grid-cols-12">
          <h2 className="reveal text-[length:var(--step-head)] font-semibold tracking-[-0.035em] md:col-span-6">
            Click through the real dashboard
          </h2>
          <p className="reveal max-w-[44ch] text-[length:var(--step-lead)] leading-snug md:col-span-5 md:col-start-8 md:self-end">
            The same sidebar and pages organisers and builders use, filled with
            a sample event. Switch between Organise and Participant.
          </p>
        </div>
        <div className="reveal mt-14 bg-surface p-2 sm:p-3">
          <DashboardDemo />
        </div>
      </section>

      <section
        id="hosting"
        data-tone="grey"
        data-stagger
        className="bg-grey px-[var(--margin)] pt-[var(--section)]"
      >
        <div className="grid gap-6 md:grid-cols-12">
          <h2 className="reveal text-[length:var(--step-head)] font-semibold tracking-[-0.035em] md:col-span-6">
            Same code, two homes
          </h2>
          <p className="reveal max-w-[46ch] text-[length:var(--step-lead)] leading-snug md:col-span-5 md:col-start-8 md:self-end">
            Nothing is held back for a paid tier. The managed service runs the
            repository you can clone, so you can move between the two whenever
            you like.
          </p>
        </div>

        <div className="mt-[12vh] grid gap-px md:grid-cols-2">
          <div className="reveal">
            <p className="max-w-[36ch] pb-4 text-base">
              <strong className="font-semibold">Self-hosted.</strong> Docker
              Compose and Postgres on your own machine. Free under Apache-2.0.
            </p>
            <div className="h-[38svh] overflow-hidden md:h-[min(13vw,260px)]">
              <p
                aria-hidden
                className="text-[clamp(7rem,30vw,30rem)] leading-[0.8] font-bold tracking-[-0.06em] md:text-[min(15vw,22rem)]"
              >
                yours
              </p>
            </div>
          </div>
          <div className="reveal bg-ink px-4 pt-4 text-white md:bg-transparent md:px-0 md:pt-0 md:text-ink">
            <p className="max-w-[36ch] pb-4 text-base">
              <strong className="font-semibold">Managed.</strong> The same
              codebase, run by us. Nothing to install or keep up to date.
            </p>
            <div className="h-[38svh] overflow-hidden md:h-[min(13vw,260px)]">
              <p
                aria-hidden
                className="text-[clamp(7rem,30vw,30rem)] leading-[0.8] font-bold tracking-[-0.06em] md:text-[min(15vw,22rem)]"
              >
                ours
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        data-tone="white"
        data-stagger
        className="px-[var(--margin)] py-[var(--section)]"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="reveal text-[length:var(--step-head)] font-semibold tracking-[-0.035em]">
            Questions, filed
          </h2>
          <div className="reveal mt-12">
            <HomeFaq />
          </div>
        </div>
      </section>

      <section
        data-tone="black"
        data-stagger
        className="flex min-h-[90svh] flex-col justify-between gap-16 bg-ink px-[var(--margin)] pt-[14svh] pb-10 text-white"
      >
        <h2 className="reveal font-display text-[clamp(2.75rem,9.6vw,11rem)] leading-[0.9] text-white">
          Open it tonight
        </h2>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="reveal max-w-[38ch] text-[1.25rem] leading-snug">
            No approval queue. Name it, set the dates, share the link.
            Registrations start arriving straight away.
          </p>
          <AppLink
            href="/events/new"
            size="lg"
            variant="accent"
            className="reveal w-full md:w-auto"
          >
            Create a hackathon
          </AppLink>
        </div>
      </section>
    </>
  );
}
