import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Kalam } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"], weight: ["400", "500"] });
const kalam = Kalam({ variable: "--font-kalam", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Second Marker: find the marks your examiner missed",
  description:
    "For CBSE Class 12 students after results. Check the scanned copy of your marked answer book against the official marking scheme and see which questions are worth paying to re-evaluate.",
};

export const viewport: Viewport = { themeColor: "#FFFFFF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-accent="green" className={`${inter.variable} ${mono.variable} ${kalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
