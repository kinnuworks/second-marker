import type { Metadata, Viewport } from "next";
import { Hind, Kalam } from "next/font/google";
import "./globals.css";

const hind = Hind({
  variable: "--font-body",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

const kalam = Kalam({
  variable: "--font-ink",
  subsets: ["latin", "devanagari"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Second Marker — find the marks your examiner missed",
  description:
    "For CBSE Class 12 students after results: check the scanned copy of your marked answer book against the official marking scheme, and see which questions are worth paying to re-evaluate.",
};

export const viewport: Viewport = {
  themeColor: "#E8EEF2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hind.variable} ${kalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
