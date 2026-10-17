import { AuthForm } from "@/components/auth-form";
import { Frame, Shell, ShellInner } from "@/components/marketing";

export default function SignupPage() {
  return (
    <Shell>
      <ShellInner className="mx-auto max-w-md space-y-6 py-16">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Create account
        </h1>
        <Frame className="p-5">
          <AuthForm mode="signup" />
        </Frame>
      </ShellInner>
    </Shell>
  );
}
