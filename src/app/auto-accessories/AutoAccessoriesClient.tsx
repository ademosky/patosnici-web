"use client";

import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { Mail } from "lucide-react";
import Link from "next/link";
import type { Product } from "../data/products";
import { useLanguage } from "../context/LanguageContext";
import { matchesAllWords } from "@/lib/search";

type Props = { initialProducts: Product[] };

export default function AutoAccessoriesClient({ initialProducts }: Props) {
  const { t, lang, localizedPath } = useLanguage();
  const [search, setSearch] = useState("");

  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = initialProducts.filter((p) => {
    if (words.length === 0) return true;
    return matchesAllWords(
      [p.title, p.model, p.brand, p.sku].filter(Boolean).join(" "),
      search
    );
  });

  return (
    <main className="min-h-screen bg-[#0b0b0b] pt-20 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            {lang === "sq" ? "Aksesorë" : "Категорија"}
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-black uppercase text-white">
            {lang === "sq" ? "Aksesorë për auto" : "Авто додатоци"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {filtered.length} {t("prod_count_suffix")}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "sq" ? "Kërko..." : "Пребарај..."}
              className="w-full rounded-xl border border-zinc-700 bg-[#141414] py-3 pl-5 pr-10 text-sm text-white outline-none transition focus:border-red-600"
            />
          </div>
        </div>

        {/* Products grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-[#111]">
              <Mail size={32} className="text-red-600" />
            </div>
            <h2 className="mt-6 text-2xl font-black uppercase text-white">
              {lang === "sq" ? "Nuk ka produkte" : "Нема производи"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {lang === "sq"
                ? "Së shpejti do të shtojmë aksesorë të rinj."
                : "Наскоро ќе додадеме нови додатоци."}
            </p>
            <Link
              href={localizedPath("/contact")}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold uppercase text-white transition hover:bg-red-700"
            >
              <Mail size={16} /> {t("prod_contact")}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
