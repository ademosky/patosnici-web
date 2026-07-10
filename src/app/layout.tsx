import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Original Patosnici | Оригинални гумени патосници",
  description:
    "Оригинални гумени патосници за сите марки возила. Издржливи, практични и лесни за одржување. Достава низ цела Македонија.",
  keywords:
    "патосници, гумени патосници, автомобилски патосници, VW, BMW, Audi, Mercedes, Škoda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mk">
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}