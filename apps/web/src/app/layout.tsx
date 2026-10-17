import type { Metadata } from "next";
import { RevealInit } from "@/components/reveal";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hackhost",
    template: "%s · Hackhost",
  },
  description:
    "Publish a weekend flyer. Register builders. Run the hackathon — open source.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <RevealInit />
        {children}
      </body>
    </html>
  );
}
