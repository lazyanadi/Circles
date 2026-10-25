import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, DM_Sans } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// The landing page's display face, so the app reads as the same product.
const display = Bodoni_Moda({ subsets: ["latin"], variable: "--font-display", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Circles: borrow from people you already trust",
  description:
    "Circles helps 5 to 20 friends pool money every month, vote on loans for one another and repay by UPI, at a rate the circle sets.",
};

export const viewport: Viewport = {
  themeColor: "#07110d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
