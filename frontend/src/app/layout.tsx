import type { Metadata, Viewport } from "next";
import { Nunito, Comfortaa, Caveat } from "next/font/google";
import "./globals.css";

const body = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

const display = Comfortaa({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

const accent = Caveat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  title: "lovenote 💌",
  description: "Создай милое романтичное приглашение на свидание.",
};

export const viewport: Viewport = {
  themeColor: "#FFF8F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${body.variable} ${display.variable} ${accent.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
