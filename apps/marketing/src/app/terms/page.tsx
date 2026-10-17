import { Wrap } from "@hackhost/ui";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <Wrap className="max-w-3xl py-[var(--section)]">
      <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)]">Terms</h1>
      <p className="mt-10 max-w-[60ch] text-[length:var(--step-lead)] leading-relaxed">
            Hackhost is provided under the Apache-2.0 licence. Use of a managed
            instance is subject to that operator&apos;s acceptable-use policy.
            Organisers are responsible for their event content and participant
            data.
      </p>
    </Wrap>
  );
}
