"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import Image from "next/image";
import BrandCard from "./BrandCard";
import { brands } from "../data/brands";

type SearchResult = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  car_model?: string;
  model: string;
  year: string;
  price: string;
  image: string;
};

export default function BrandSelector() {
  const [search, setSearch]             = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [results, setResults]           = useState<SearchResult[]>([]);
  const [loading, setLoading]           = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  // Live search debounce
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredBrands = useMemo(
    () => brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowDropdown(false);
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleResultClick = (slug: string) => {
    setShowDropdown(false);
    setSearch("");
    router.push(`/products/${slug}`);
  };

  // Кликнат бренд — прикажи само него
  const handleBrandClick = (brandId: string) => {
    if (selectedBrand === brandId) {
      // Втор клик → оди на производи
      router.push(`/products?brand=${brandId}`);
    } else {
      // Прв клик → избери го
      setSelectedBrand(brandId);
    }
  };

  const selectedBrandObj = brands.find((b) => b.id === selectedBrand);

  return (
    <section className="bg-[#111111] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Категории</p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">
            Избери го твојот бренд
          </h2>
          <p className="mt-4 text-zinc-400">
            Одбери бренд или пребарај конкретен модел.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-xl">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Пребарај бренд или модел... (пр. Audi A3, Golf 5)"
                className="w-full rounded-xl border border-zinc-700 bg-[#181818] py-4 pl-5 pr-14 text-white outline-none transition focus:border-red-600"
              />
              {search ? (
                <button type="button"
                  onClick={() => { setSearch(""); setResults([]); setShowDropdown(false); }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              ) : null}
              <button type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search size={16} />
                )}
              </button>

              {/* Live dropdown */}
              {showDropdown && results.length > 0 && (
                <div ref={dropRef}
                  className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-700 bg-[#141414] shadow-2xl"
                >
                  {results.map((r) => (
                    <button key={r.id} type="button"
                      onClick={() => handleResultClick(r.slug)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-zinc-800"
                    >
                      <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                        {r.image && <Image src={r.image} alt={r.title} fill className="object-cover" unoptimized />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{r.title}</p>
                        <p className="text-xs text-zinc-500">
                          {r.car_model ? `${r.brand.toUpperCase()} ${r.car_model} · ` : ""}{r.year}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-sm font-bold text-red-500">{r.price}</span>
                    </button>
                  ))}
                  <button type="button"
                    onClick={() => { setShowDropdown(false); router.push(`/products?q=${encodeURIComponent(search)}`); }}
                    className="flex w-full items-center justify-center gap-2 border-t border-zinc-800 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  >
                    <Search size={14} />
                    Покажи ги сите резултати за &quot;{search}&quot;
                  </button>
                </div>
              )}
              {showDropdown && results.length === 0 && !loading && search.trim() && (
                <div ref={dropRef}
                  className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-zinc-700 bg-[#141414] p-4 text-center text-sm text-zinc-500 shadow-2xl"
                >
                  Нема резултати за &quot;{search}&quot;
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ── BRAND GRID ── */}
        {selectedBrand ? (
          /* Избран бренд — покажи само него + Сите */
          <div className="mt-12">
            {/* Сите брендови копче */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => setSelectedBrand(null)}
                className="flex items-center gap-2 rounded-xl border border-zinc-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:border-red-600 hover:text-white"
              >
                ← Сите брендови
              </button>
            </div>

            {/* Само избраниот бренд — поголем приказ */}
            {selectedBrandObj && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-48">
                  <BrandCard
                    brand={selectedBrandObj}
                    onClick={() => router.push(`/products?brand=${selectedBrandObj.id}`)}
                  />
                </div>
                <button
                  onClick={() => router.push(`/products?brand=${selectedBrandObj.id}`)}
                  className="rounded-xl bg-red-600 px-10 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-red-700"
                >
                  Види сите {selectedBrandObj.name} патосници →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Сите брендови */
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {filteredBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onClick={() => handleBrandClick(brand.id)}
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
        )}

      </div>
    </section>
  );
}
