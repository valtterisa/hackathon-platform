import type { Metadata } from "next";
import Script from "next/script";
import { UiProvider } from "@/components/ui-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "hackhost",
    template: "%s · hackhost",
  },
  description:
    "Open-source hackathon tooling. Publish event pages, register builders, run teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=panchang@700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <UiProvider>{children}</UiProvider>
      </body>
    </html>
  );
}
