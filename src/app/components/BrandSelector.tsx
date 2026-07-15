"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronRight } from "lucide-react";
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
  const [search, setSearch]               = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [carModels, setCarModels]         = useState<string[]>([]);
  const [results, setResults]             = useState<SearchResult[]>([]);
  const [loading, setLoading]             = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);
  const modelsRef = useRef<HTMLDivElement>(null);

  // Fetch car models when brand selected
  useEffect(() => {
    if (!selectedBrand) { setCarModels([]); return; }
    fetch(`/api/products?q=&brand=${selectedBrand}`)
      .then((r) => r.json())
      .then((data: SearchResult[]) => {
        const models = [...new Set(
          data.filter((p) => p.car_model).map((p) => p.car_model as string)
        )].sort();
        setCarModels(models);
        // Scroll to models section
        setTimeout(() => modelsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
      })
      .catch(() => setCarModels([]));
  }, [selectedBrand]);

  // Live search debounce
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredBrands = useMemo(
    () => brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const selectedBrandObj = brands.find((b) => b.id === selectedBrand);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { setShowDropdown(false); router.push(`/products?q=${encodeURIComponent(search.trim())}`); }
  };

  const handleBrandClick = (brandId: string) => {
    setSelectedBrand(selectedBrand === brandId ? null : brandId);
  };

  const handleModelClick = (model: string) => {
    router.push(`/products?brand=${selectedBrand}&car_model=${encodeURIComponent(model)}`);
  };

  return (
    <section className="bg-[#111111] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Категории</p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">
            Избери го твојот бренд
          </h2>
          <p className="mt-4 text-zinc-400">Одбери бренд или пребарај конкретен модел.</p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-xl">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input ref={inputRef} type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Пребарај бренд или модел... (пр. Audi A3, Golf 5)"
                className="w-full rounded-xl border border-zinc-700 bg-[#181818] py-4 pl-5 pr-14 text-white outline-none transition focus:border-red-600"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(""); setResults([]); setShowDropdown(false); }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
              <button type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700">
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Search size={16} />}
              </button>

              {/* Dropdown */}
              {showDropdown && results.length > 0 && (
                <div ref={dropRef} className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-700 bg-[#141414] shadow-2xl">
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
                <div ref={dropRef} className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-zinc-700 bg-[#141414] p-4 text-center text-sm text-zinc-500 shadow-2xl">
                  Нема резултати за &quot;{search}&quot;
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Brand Grid — секогаш видлив */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className={`transition-all duration-200 ${selectedBrand && selectedBrand !== brand.id ? "opacity-40 scale-95" : ""}`}>
              <BrandCard
                brand={brand}
                onClick={() => handleBrandClick(brand.id)}
              />
            </div>
          ))}
          {search === "" && (
            <BrandCard brand={{ id: "all", name: "Сите", logo: "" }} isViewAll
              onClick={() => router.push("/products")} />
          )}
        </div>

        {/* Модели секција — се прикажува под брендовите */}
        {selectedBrand && selectedBrandObj && (
          <div ref={modelsRef} className="mt-8 rounded-2xl border border-zinc-700 bg-[#0f0f0f] p-6 transition-all">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                {selectedBrandObj.name}
              </p>
              <ChevronRight size={14} className="text-zinc-600" />
              <p className="text-xs text-zinc-500">Избери модел</p>
              <button onClick={() => setSelectedBrand(null)}
                className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition">
                ✕ Затвори
              </button>
            </div>

            {carModels.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {/* Сите од брендот */}
                <button
                  onClick={() => router.push(`/products?brand=${selectedBrand}`)}
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold uppercase text-zinc-300 transition hover:border-red-600 hover:text-white"
                >
                  Сите {selectedBrandObj.name}
                </button>
                {/* Поединечни модели */}
                {carModels.map((model) => (
                  <button key={model}
                    onClick={() => handleModelClick(model)}
                    className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold uppercase text-zinc-300 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    {selectedBrandObj.name} {model}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                <span className="text-sm text-zinc-500">Се вчитуваат моделите...</span>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
