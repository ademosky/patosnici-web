"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useLanguage } from "../context/LanguageContext";
import type { Product } from "../data/products";

export default function BestSellers() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=4")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {});
  }, []);

  return (
    <section className="bg-[#0b0b0b] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black uppercase text-white">{t("best_title")}</h2>
            <p className="mt-3 text-zinc-400">{t("best_desc")}</p>
          </div>
          <Link href="/products"
            className="hidden rounded-xl border border-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-600 lg:block">
{t("best_view_all")}
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center lg:hidden">
          <Link href="/products" className="rounded-xl border border-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-600">
{t("best_view_all")}
          </Link>
        </div>
      </div>
    </section>
  );
}
