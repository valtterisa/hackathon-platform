import { PlatformHeader } from "@/components/platform-header";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PlatformHeader />
      <main>{children}</main>
    </div>
  );
}
