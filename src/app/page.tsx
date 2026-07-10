import Header from "./components/Header";
import Hero from "./components/Hero";
import BrandSelector from "./components/BrandSelector";
import BestSellers from "./components/BestSellers";
import Features from "./components/Features";
import Reviews from "./components/Reviews";
import TrustBar from "./components/TrustBar";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b]">
        <Hero />
        <BrandSelector />
        <Features />
        <BestSellers />
        <Reviews />
        <TrustBar />
      </main>
    </>
  );
}