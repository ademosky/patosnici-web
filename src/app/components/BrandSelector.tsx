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
  const [results, setResults]           = useState<SearchResult[]>([]);
  const [loading, setLoading]           = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!search.trim()) { setResults([]); setShowDropdown(false); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current?.contains(e.target as Node) === false &&
          inputRef.current?.contains(e.target as Node) === false)
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredBrands = useMemo(
    () => brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { setShowDropdown(false); router.push(`/products?q=${encodeURIComponent(search.trim())}`); }
  };

  return (
    <section className="bg-[#111111] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Категории</p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">
            Пронајди патосници за твоето возило
          </h2>
          <p className="mt-4 text-zinc-400">
            Избери бренд или пребарај директно по модел
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-xl">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input ref={inputRef} type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Пребарај по модел... пр. Audi A3, Golf 5, BMW E90"
                className="w-full rounded-xl border border-zinc-700 bg-[#181818] py-4 pl-5 pr-14 text-white outline-none transition focus:border-red-600"
              />
              {search && (
                <button type="button"
                  onClick={() => { setSearch(""); setResults([]); setShowDropdown(false); }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
              <button type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700">
                {loading
                  ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <Search size={16} />}
              </button>

              {/* Live dropdown results */}
              {showDropdown && results.length > 0 && (
                <div ref={dropRef}
                  className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-700 bg-[#141414] shadow-2xl">
                  {results.map((r) => (
                    <button key={r.id} type="button"
                      onClick={() => { setShowDropdown(false); setSearch(""); router.push(`/products/${r.slug}`); }}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-zinc-800">
                      <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                        {r.image && <Image src={r.image} alt={r.title} fill className="object-cover" unoptimized />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{r.title}</p>
                        <p className="text-xs text-zinc-500">{r.car_model ? `${r.brand.toUpperCase()} ${r.car_model} · ` : ""}{r.year}</p>
                      </div>
                      <span className="flex-shrink-0 text-sm font-bold text-red-500">{r.price}</span>
                    </button>
                  ))}
                  <button type="button"
                    onClick={() => { setShowDropdown(false); router.push(`/products?q=${encodeURIComponent(search)}`); }}
                    className="flex w-full items-center justify-center gap-2 border-t border-zinc-800 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                    <Search size={14} /> Покажи ги сите резултати за &quot;{search}&quot;
                  </button>
                </div>
              )}

              {showDropdown && results.length === 0 && !loading && search.trim() && (
                <div ref={dropRef}
                  className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-zinc-700 bg-[#141414] p-4 text-center text-sm text-zinc-500 shadow-2xl">
                  Нема резултати — <button type="submit" className="text-red-500 underline">пребарај во сите производи</button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Brand Grid — клик → директно на /products?brand=id */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand}
              onClick={() => router.push(`/products?brand=${brand.id}`)} />
          ))}
          {search === "" && (
            <BrandCard brand={{ id: "all", name: "Сите", logo: "" }} isViewAll
              onClick={() => router.push("/products")} />
          )}
        </div>

        {filteredBrands.length === 0 && search && (
          <p className="mt-8 text-center text-sm text-zinc-600">
            Нема бренд — притисни Enter за да пребараш во производите
          </p>
        )}

      </div>
    </section>
  );
}
