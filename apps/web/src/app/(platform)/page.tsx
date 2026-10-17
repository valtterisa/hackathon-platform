import { Button, Display, Lead } from "@hackhost/ui";
import Link from "next/link";
import { FlyerPreview } from "@/components/flyer-preview";
import { HomeFaq } from "@/components/home-faq";
import { Band, BandInner, Credits, Mark, Photo } from "@/components/marketing";

export default function HomePage() {
  return (
    <>
      <Band field="mint" className="relative min-h-[100svh] overflow-hidden">
        <BandInner className="relative z-10 flex min-h-[100svh] flex-col justify-between py-10">
          <p className="reveal font-display text-xl uppercase">Hackhost</p>
          <div className="reveal grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <Display className="max-w-[12ch]">
              Ship the
              <br />
              weekend flyer
            </Display>
            <div className="relative aspect-[4/5] w-full max-w-md justify-self-end lg:-mb-8 lg:translate-x-4">
              <Photo
                src="/media/olympia-simplex.jpg"
                alt="Olympia Simplex typewriter, archival photograph"
                tilt
                className="h-full"
              />
            </div>
          </div>
          <div className="reveal flex flex-wrap items-end justify-between gap-6 pb-4">
            <Lead>
              Publish a marketing page. Register builders. Run teams — open
              source, no organiser gate.
            </Lead>
            <Link href="/events/new">
              <Button size="lg" variant="invert">
                Create a hackathon
              </Button>
            </Link>
          </div>
        </BandInner>
      </Band>

      <Band field="ink" className="min-h-[100svh]">
        <BandInner className="grid min-h-[100svh] content-center gap-0 py-0 lg:grid-cols-3">
          {[
            {
              verb: "Publish",
              copy: "One shareable /e/slug page — dates, prizes, sticky register.",
              img: "/media/typewriters.jpg",
              alt: "Row of typewriters",
            },
            {
              verb: "Register",
              copy: "Builders join on your site. Open, apply, or invite-only.",
              img: "/media/typewriter-24111292.jpg",
              alt: "Close-up of a typewriter",
            },
            {
              verb: "Run",
              copy: "Sidebars for participants and organizers. Teams, submit, judge.",
              img: "/media/night-windows.jpg",
              alt: "Lit office windows at night",
            },
          ].map((step) => (
            <div key={step.verb} className="reveal relative min-h-[70svh] lg:min-h-[100svh]">
              <Photo src={step.img} alt={step.alt} className="absolute inset-0" />
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative flex h-full flex-col justify-between p-6 text-white">
                <p className="font-display text-[clamp(3rem,12vw,7rem)] uppercase leading-none">
                  {step.verb}
                </p>
                <p className="max-w-[28ch] text-[var(--step-body)]">{step.copy}</p>
              </div>
            </div>
          ))}
        </BandInner>
      </Band>

      <Band field="grey" className="py-[var(--section)]">
        <BandInner className="reveal space-y-10">
          <Display as="h2" className="text-[clamp(2rem,6vw,5rem)]">
            Before
            <br />
            After
          </Display>
          <div className="grid gap-4 md:grid-cols-2">
            <p className="font-display text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.8] text-black/25">
              Dashboard?
            </p>
            <p className="font-display text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.8]">
              /e/your-hack
            </p>
          </div>
          <Lead>
            Event context lives in the URL. Participant and organizer tools share
            one shell — no global nav soup.
          </Lead>
        </BandInner>
      </Band>

      <Band field="surface" className="py-[var(--section)]">
        <BandInner className="reveal space-y-8">
          <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
            Print your title
          </Display>
          <FlyerPreview />
        </BandInner>
      </Band>

      <Band field="bg" className="py-[var(--section)]">
        <BandInner className="reveal space-y-10">
          <Display as="h2" className="text-[clamp(2rem,5vw,4rem)]">
            Questions
          </Display>
          <HomeFaq />
        </BandInner>
      </Band>

      <Band field="ink" className="min-h-[90svh]">
        <BandInner className="flex min-h-[90svh] flex-col justify-between py-16">
          <Display className="reveal max-w-[14ch] text-[clamp(2.5rem,8vw,7rem)]">
            Host the next weekend
          </Display>
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <Lead className="text-[var(--field-4-ink)]">
              Same app self-hosted or managed. Start with a flyer.
            </Lead>
            <Link href="/events/new">
              <Button size="lg">Create a hackathon</Button>
            </Link>
          </div>
        </BandInner>
      </Band>

      <Band field="orange" className="pt-16">
        <BandInner>
          <Mark />
          <div className="mt-14 grid gap-6 pb-10 text-[var(--step-body)] md:grid-cols-4">
            <Link href="/events" className="underline">
              Events
            </Link>
            <Link href="/events/new" className="underline">
              Create
            </Link>
            <Link href="/privacy" className="underline">
              Privacy
            </Link>
            <Link href="/terms" className="underline">
              Terms
            </Link>
          </div>
        </BandInner>
        <Credits>
          Pictures:{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Olympia_Simplex.jpg">
            “Olympia Simplex”
          </a>{" "}
          by Sammlung der Medien und Wissenschaft, CC BY 4.0;{" "}
          <a href="https://commons.wikimedia.org/w/index.php?curid=1166376">
            “Typewriters”
          </a>{" "}
          by Mohylek, CC BY-SA 3.0; night windows atmosphere via Unsplash/picsum.
        </Credits>
      </Band>
    </>
  );
}
