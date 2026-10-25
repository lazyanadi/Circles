import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Circles: borrow from people you already trust",
  description:
    "Circles helps 5 to 20 friends pool money every month, vote on loans for one another and repay by UPI, at a rate the circle sets.",
};

export const viewport: Viewport = {
  themeColor: "#dde3e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
