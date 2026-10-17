import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center font-display text-3xl font-semibold">
        Create account
      </h1>
      <p className="mb-6 text-center text-sm text-[var(--muted-foreground)]">
        For organizers hosting hackathons. Builders should sign up from the
        event page they want to join.
      </p>
      <AuthForm mode="signup" callbackUrl="/events/new" />
      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Looking for a hackathon?{" "}
        <Link href="/events" className="text-[var(--primary)] underline">
          Browse events
        </Link>
      </p>
    </div>
  );
}
