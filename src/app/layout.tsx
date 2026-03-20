import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CS2 Crosshair Codes — Find & Share the Best Crosshairs | CS2CrossHub",
  description:
    "Browse and copy the best CS2 crosshair codes from pro players and the community. Find your perfect Counter-Strike 2 crosshair with live preview.",
  keywords: [
    "cs2 crosshair",
    "cs2 crosshair code",
    "cs crosshair",
    "counter strike 2 crosshair",
    "cs2 cross",
    "cs2 pro crosshair",
    "cs2 crosshair generator",
    "best cs2 crosshair",
    "cs2 crosshair share code",
    "crosshair cs2",
    "csgo crosshair",
    "cs2 aim",
    "pro player crosshair cs2",
  ],
  metadataBase: new URL("https://cs2crosshub.pro"), // ← kendi domainine göre değiştir
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CS2 Crosshair Codes — CS2CrossHub",
    description:
      "Find and share the best CS2 crosshair codes from pro players and the community.",
    url: "https://cs2crosshub.pro",
    siteName: "CS2CrossHub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CS2 Crosshair Codes — CS2CrossHub",
    description:
      "Find and share the best CS2 crosshair codes from pro players and the community.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data — Google bu bilgiyi doğrudan okur */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CS2CrossHub",
              url: "https://cs2crosshub.pro",
              description:
                "The best CS2 crosshair code library. Find, copy and share Counter-Strike 2 crosshairs from pro players and the community.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://cs2crosshub.pro/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}