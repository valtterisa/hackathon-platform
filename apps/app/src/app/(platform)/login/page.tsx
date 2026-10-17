import { PageHeader } from "@hackhost/ui";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-md">
      <PageHeader
        title="Sign in"
        description="Welcome back. Pick up where you left off."
      />
      <AuthForm mode="login" callbackUrl={next ?? "/events"} />
    </div>
  );
}
