// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers"; // Eklediğimiz kısım

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CS2 Crosshairs",
  description: "En iyi CS2 Crosshair kodlarını bul ve paylaş.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Tüm uygulamayı Providers ile sarmalıyoruz */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}