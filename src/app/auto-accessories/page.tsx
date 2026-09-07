import type { Metadata } from "next";
import Header from "../components/Header";
import AutoAccessoriesClient from "./AutoAccessoriesClient";
import { getProductsByCategory } from "../data/products";

const SITE_URL = "https://www.originalpatosnici.com";

export const metadata: Metadata = {
  title: "Авто додатоци | Original Patosnici",
  description:
    "Квалитетни авто додатоци за твоето возило. Нарачај онлајн — брза достава низ цела Македонија.",
  openGraph: {
    type: "website",
    locale: "mk_MK",
    url: `${SITE_URL}/auto-accessories`,
    siteName: "Original Patosnici",
    title: "Авто додатоци | Original Patosnici",
    description: "Квалитетни авто додатоци за твоето возило.",
    images: [{ url: `${SITE_URL}/images/logo.webp`, width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function AutoAccessoriesPage() {
  const products = await getProductsByCategory("auto_accessories");
  return (
    <>
      <Header />
      <AutoAccessoriesClient initialProducts={products} />
    </>
  );
}
