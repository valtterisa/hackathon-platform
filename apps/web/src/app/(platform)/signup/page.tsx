import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-center font-display text-3xl font-semibold">
        Create account
      </h1>
      <AuthForm mode="signup" />
    </div>
  );
}
