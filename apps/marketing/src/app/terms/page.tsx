import { Shell, ShellInner } from "@/components/marketing";

export default function TermsPage() {
  return (
    <Shell>
      <ShellInner className="space-y-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Terms
        </h1>
        <p className="leading-relaxed text-zinc-600">
          Hackhost is provided under the Apache-2.0 license. Use of a managed
          instance is subject to that operator&apos;s acceptable-use policy.
          Organisers are responsible for their event content and participant
          data.
        </p>
      </ShellInner>
    </Shell>
  );
}
