import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center font-display text-3xl font-semibold">
        Sign in
      </h1>
      <p className="mb-6 text-center text-sm text-[var(--muted-foreground)]">
        For organizers creating and running hackathons. Participants should log
        in from their event page.
      </p>
      <AuthForm mode="login" callbackUrl={next ?? "/me/events"} />
      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Looking for a hackathon?{" "}
        <Link href="/events" className="text-[var(--primary)] underline">
          Browse events
        </Link>
      </p>
    </div>
  );
}
