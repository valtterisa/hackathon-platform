import { AppLink, AppTextLink } from "@/components/app-link";
import { DashboardDemo } from "@/components/dashboard-demo";
import { HomeFaq } from "@/components/home-faq";
import { Frame, Shell, ShellInner } from "@/components/marketing";

const FEATURES = [
  {
    title: "Public event pages",
    body: "A shareable page for every hackathon — dates, prizes, and registration.",
  },
  {
    title: "Self-serve create",
    body: "Anyone signed in can publish. No organiser approval queue.",
  },
  {
    title: "Run the weekend",
    body: "Teams, submissions, schedule, and judging in one place.",
  },
] as const;

export default function HomePage() {
  return (
    <Shell>
      <ShellInner className="flex flex-col items-center py-16 text-center sm:py-24">
        <p className="reveal text-sm font-medium text-zinc-500">
          Open-source hackathon platform
        </p>
        <h1 className="reveal mt-4 max-w-[16ch] text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-tight text-zinc-900">
          Host hackathons without the busywork
        </h1>
        <p className="reveal mt-5 max-w-[42ch] text-lg leading-relaxed text-zinc-600">
          Publish a page, register builders, form teams, and ship — self-host or
          use managed hosting. Same product either way.
        </p>
        <div className="reveal mt-8 flex flex-wrap justify-center gap-3">
          <AppLink href="/events/new">Create a hackathon</AppLink>
          <AppLink href="/events" variant="soft">
            Browse events
          </AppLink>
        </div>
      </ShellInner>

      <ShellInner className="pb-16 sm:pb-20">
        <div className="reveal mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Try the dashboard
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Click around — participant and organiser views with sample data.
          </p>
        </div>
        <div className="reveal">
          <DashboardDemo />
        </div>
      </ShellInner>

      <ShellInner className="space-y-16 pb-16 sm:pb-20">
        <section className="reveal space-y-6">
          <h2 className="text-center text-xl font-semibold tracking-tight text-zinc-900">
            What you get
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-[var(--surface)] p-5 text-left"
              >
                <h3 className="font-semibold tracking-tight text-zinc-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="reveal space-y-4">
          <h2 className="text-center text-xl font-semibold tracking-tight text-zinc-900">
            FAQ
          </h2>
          <HomeFaq />
        </section>

        <section className="reveal text-center">
          <Frame className="px-6 py-10">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Ready when you are
            </h2>
            <p className="mx-auto mt-2 text-zinc-600">
              No organiser gate. Create an event in a minute.
            </p>
            <div className="mt-6">
              <AppLink href="/events/new">Create a hackathon</AppLink>
            </div>
          </Frame>
        </section>

        <footer className="reveal flex flex-wrap items-center justify-between gap-4 pt-8 pb-4 text-sm text-zinc-500">
          <p>hackhost · Apache-2.0</p>
          <div className="flex flex-wrap gap-4">
            <AppTextLink
              href="/events"
              className="cursor-pointer hover:text-zinc-900"
            >
              Events
            </AppTextLink>
            <a href="/privacy" className="cursor-pointer hover:text-zinc-900">
              Privacy
            </a>
            <a href="/terms" className="cursor-pointer hover:text-zinc-900">
              Terms
            </a>
          </div>
        </footer>
      </ShellInner>
    </Shell>
  );
}
