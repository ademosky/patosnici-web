import type { Metadata } from "next";
import Header from "../components/Header";
import ConfiguratorClient from "./ConfiguratorClient";

const SITE_URL = "https://www.originalpatosnici.com";

export const metadata: Metadata = {
  title: "Изработи сам — Платнени патосници по твој избор | Original Patosnici",
  description:
    "Изработи сам платнени патосници по твој избор. Избери возило, боја, раб и лого. Нарачај онлајн. Достава низ цела Македонија.",
  keywords:
    "платнени патосници, изработи сам, патосници по избор, конфигуратор, текстилни патосници, Македонија",
  openGraph: {
    type: "website",
    locale: "mk_MK",
    url: `${SITE_URL}/create-own`,
    siteName: "Original Patosnici",
    title: "Изработи сам — Платнени патосници по избор",
    description:
      "Изработи сам платнени патосници по твој избор. Избери возило, боја, раб и лого.",
    images: [
      {
        url: `${SITE_URL}/images/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Original Patosnici — Платнени патосници по избор",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Изработи сам — Платнени патосници по избор",
    description: "Изработи сам платнени патосници по твој избор.",
    images: [`${SITE_URL}/images/logo.webp`],
  },
  robots: { index: true, follow: true },
};

export default function IzrabotiSamPage() {
  return (
    <>
      <Header />
      <ConfiguratorClient />
    </>
  );
}


