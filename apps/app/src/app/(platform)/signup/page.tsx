import { PageHeader } from "@hackhost/ui";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <PageHeader
        title="Create account"
        description="One account for every hackathon you build or run."
      />
      <AuthForm mode="signup" />
    </div>
  );
}
