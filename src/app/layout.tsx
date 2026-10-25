import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { getGameData } from "@/lib/fpl/data";
import { currentEvent, nextEvent } from "@/lib/fpl/select";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "فانتازي أرينا | كل إحصاءات فانتازي الدوري الإنجليزي",
  description:
    "تطبيق عربي شامل لفانتازي الدوري الإنجليزي: إحصاءات اللاعبين، الفورمة، xG/xA، التشكيلات، المباريات، ومتابعة فريقك ببيانات رسمية من fantasy.premierleague.com.",
  applicationName: "Fantasy Arena",
  keywords: ["فانتازي", "الدوري الإنجليزي", "FPL", "إحصاءات", "فانتازي أرينا"],
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    title: "فانتازي أرينا | كل إحصاءات فانتازي الدوري الإنجليزي",
    description: "قاعدة لاعبين كاملة، فورمة، xG/xA، مباريات، متابعة فريقك وبناء تشكيلة.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060f",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let header: {
    gameweekName?: string;
    deadline?: string;
    averageScore?: number;
    source: "live" | "cache";
    updatedAt: string;
  } = { source: "live", updatedAt: new Date().toISOString() };

  try {
    const data = await getGameData();
    const current = currentEvent(data.events);
    const upcoming = nextEvent(data.events);
    header = {
      gameweekName: current?.name,
      deadline: upcoming?.deadline ?? current?.deadline,
      averageScore: current?.averageScore,
      source: data.source,
      updatedAt: data.updatedAt,
    };
  } catch {
    header = { source: "cache", updatedAt: new Date().toISOString() };
  }

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-ink font-sans text-white antialiased">
        <AppShell {...header}>{children}</AppShell>
      </body>
    </html>
  );
}
