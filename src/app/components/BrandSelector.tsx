"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import BrandCard from "./BrandCard";
import { brands } from "../data/brands";

export default function BrandSelector() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(
    () =>
      brands.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <section className="bg-[#111111] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            Категории
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">
            Избери го твојот бренд
          </h2>
          <p className="mt-4 text-zinc-400">
            Одбери бренд или пребарај конкретен модел.
          </p>
        </div>

        {/* Search — со Enter пребарува во /products */}
        <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Пребарај бренд или модел... (пр. Audi A3, Golf 5)"
              className="w-full rounded-xl border border-zinc-700 bg-[#181818] py-4 pl-5 pr-14 text-white outline-none transition focus:border-red-600"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
            >
              <Search size={16} />
            </button>
          </div>
          {search.trim() && (
            <p className="mt-2 text-center text-xs text-zinc-500">
              Притисни Enter или 🔍 за да пребараш &quot;{search}&quot; низ сите производи
            </p>
          )}
        </form>

        {/* Brand grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {filtered.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onClick={() => router.push(`/products?brand=${brand.id}`)}
            />
          ))}

          {search === "" && (
            <BrandCard
              brand={{ id: "all", name: "Сите", logo: "" }}
              isViewAll
              onClick={() => router.push("/products")}
            />
          )}
        </div>

        {filtered.length === 0 && search !== "" && (
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              Нема бренд со тоа ime — 
              <button
                onClick={() => router.push(`/products?q=${encodeURIComponent(search)}`)}
                className="ml-1 text-red-500 underline hover:text-red-400"
              >
                пребарај &quot;{search}&quot; во производите →
              </button>
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
