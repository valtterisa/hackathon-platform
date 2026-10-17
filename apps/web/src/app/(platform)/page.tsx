import { Button } from "@hackhost/ui";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% -10%, #0b6e4f33, transparent), radial-gradient(ellipse 60% 50% at 90% 10%, #c45d2633, transparent), linear-gradient(180deg, #eef5f0 0%, #f4f7f5 40%, #f4f7f5 100%)",
        }}
      />
      <section className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-20">
        <p className="font-display text-5xl font-semibold tracking-tight text-[var(--primary)] sm:text-7xl">
          Hackhost
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-medium leading-tight text-[var(--foreground)] sm:text-4xl">
          Market your hackathon. Register builders. Run the weekend.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--muted-foreground)]">
          Open-source event OS with per-hackathon landing pages, clear sidebars,
          and organizer tools — self-host or use the managed cloud.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/events">
            <Button size="lg">Browse events</Button>
          </Link>
          <Link href="/events/new">
            <Button size="lg" variant="outline">
              Create a hackathon
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
