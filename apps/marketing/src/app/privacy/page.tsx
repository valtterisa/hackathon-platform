import { Shell, ShellInner } from "@/components/marketing";

export default function PrivacyPage() {
  return (
    <Shell>
      <ShellInner className="space-y-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Privacy
        </h1>
        <p className="leading-relaxed text-zinc-600">
          Hackhost stores the account and event data you provide to run
          hackathons. Self-hosted deployments keep data on your infrastructure.
          Contact the operator of your instance for retention and deletion
          requests.
        </p>
      </ShellInner>
    </Shell>
  );
}
