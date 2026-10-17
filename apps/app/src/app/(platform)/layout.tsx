import { Wrap } from "@hackhost/ui";
import { PlatformHeader } from "@/components/platform-header";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PlatformHeader />
      <main>
        <Wrap className="py-10 md:py-14">{children}</Wrap>
      </main>
    </div>
  );
}
