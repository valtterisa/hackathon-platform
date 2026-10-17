import { Wrap } from "@hackhost/ui";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <Wrap className="max-w-3xl py-[var(--section)]">
      <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)]">Privacy</h1>
      <p className="mt-10 max-w-[60ch] text-[length:var(--step-lead)] leading-relaxed">
            Hackhost stores the account and event data you provide to run
            hackathons. Self-hosted deployments keep data on your own
            infrastructure. Contact the operator of your instance for retention
            and deletion requests.
      </p>
    </Wrap>
  );
}
