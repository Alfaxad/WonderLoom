import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "WonderLoom — Make a story that stays yours",
  description: "A child-led creative studio for speaking, shaping, and sharing a small illustrated story.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${fraunces.variable} ${nunito.variable}`}>
        <a className="skip-link" href="#main-content">Skip to the story</a>
        {children}
      </body>
    </html>
  );
}
