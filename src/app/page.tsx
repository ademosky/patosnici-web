import Header from "./components/Header";
import Hero from "./components/Hero";
import BrandSelector from "./components/BrandSelector";
import BestSellers from "./components/BestSellers";
import Features from "./components/Features";
import Reviews from "./components/Reviews";
import TrustBar from "./components/TrustBar";
import { getProductsBySkus } from "./data/products";

const BEST_SELLER_SKUS = ["444806", "213648", "444894", "212807"];

export const revalidate = 300;

export default async function Home() {
  const bestSellers = await getProductsBySkus(BEST_SELLER_SKUS);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b]">
        <Hero />
        <BrandSelector />
        <Features />
        <BestSellers products={bestSellers} />
        <Reviews />
        <TrustBar />
      </main>
    </>
  );
}