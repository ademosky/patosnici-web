"use client";

import ProductCard from "./ProductCard";
import { useLanguage } from "../context/LanguageContext";
import type { Product } from "../data/products";

type Props = {
  products: Product[];
};

export default function RecommendedProducts({ products }: Props) {
  const { t, lang } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className="bg-[#0b0b0b] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
            {lang === "sq" ? "Rekomandime" : "Препорачани производи"}
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            {lang === "sq" ? "Produkte të rekomanduara" : "Препорачани производи"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
