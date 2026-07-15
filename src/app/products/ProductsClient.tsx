"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { Mail, X } from "lucide-react";
import Link from "next/link";
import type { Product } from "../data/products";
import type { Brand } from "../data/brands";

type Props = {
  initialProducts: Product[];
  brands: Brand[];
};

function ProductsContent({ initialProducts, brands }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const activeBrand    = searchParams.get("brand")     || "all";
  const activeCarModel = searchParams.get("car_model") || "all";
  const globalQuery    = searchParams.get("q")         || "";

  const [localSearch, setLocalSearch] = useState(globalQuery);

  useEffect(() => { setLocalSearch(globalQuery); }, [globalQuery]);

  // Уникатни car_models за избраниот бренд
  const carModels = useMemo(() => {
    if (activeBrand === "all") return [];
    const models = initialProducts
      .filter((p) => p.brand === activeBrand && p.car_model)
      .map((p) => p.car_model as string);
    return [...new Set(models)].sort();
  }, [activeBrand, initialProducts]);

  // Филтрирање
  const filtered = useMemo(() => {
    const q = localSearch.toLowerCase().trim();
    return initialProducts.filter((p) => {
      const matchBrand  = activeBrand === "all" || p.brand === activeBrand;
      const matchModel  = activeCarModel === "all" || p.car_model === activeCarModel;
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        (p.car_model || "").toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchBrand && matchModel && matchSearch;
    });
  }, [activeBrand, activeCarModel, localSearch, initialProducts]);

  const activeBrandName = brands.find((b) => b.id === activeBrand)?.name ?? "";
  const isSearchMode    = localSearch.trim().length > 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-28">
        <div className="mx-auto max-w-7xl px-6 py-12">

          {/* ── НАСЛОВ ── */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Каталог</p>
            <h1 className="mt-2 text-4xl font-black uppercase text-white">
              {isSearchMode
                ? `Резултати за „${localSearch}"`
                : activeCarModel !== "all"
                  ? `${activeBrandName} ${activeCarModel} Патосници`
                  : activeBrand !== "all"
                    ? `${activeBrandName} Патосници`
                    : "Сите Патосници"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{filtered.length} производи</p>
          </div>

          {/* ── ПРЕБАРУВАЧКА ── */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <input type="text" value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Пребарај модел..."
                className="w-full rounded-xl border border-zinc-700 bg-[#141414] py-3 pl-5 pr-10 text-sm text-white outline-none transition focus:border-red-600"
              />
              {localSearch && (
                <button onClick={() => { setLocalSearch(""); router.push(activeBrand !== "all" ? `/products?brand=${activeBrand}` : "/products"); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ── БРЕНД ИЗБОР (само кога нема активен бренд) ── */}
          {activeBrand === "all" && !isSearchMode && (
            <div className="mb-6 flex flex-wrap gap-2">
              {brands.map((b) => (
                <button key={b.id}
                  onClick={() => router.push(`/products?brand=${b.id}`)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-400 transition hover:border-red-600 hover:text-white"
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          {/* ── МОДЕЛИ (кога бренд е избран — prominentно!) ── */}
          {activeBrand !== "all" && !isSearchMode && carModels.length > 0 && (
            <div className="mb-8">
              {/* Назад + бренд info */}
              <div className="mb-4 flex items-center gap-3">
                <button onClick={() => router.push("/products")}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white">
                  ← Сите брендови
                </button>
                <span className="text-zinc-700">›</span>
                <span className="text-sm font-semibold text-white">{activeBrandName}</span>
              </div>

              {/* Модел копчиња — ГОЛЕМ приказ */}
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                Избери модел на {activeBrandName}:
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push(`/products?brand=${activeBrand}`)}
                  className={`rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition ${
                    activeCarModel === "all"
                      ? "bg-red-600 text-white"
                      : "border-2 border-zinc-700 text-zinc-300 hover:border-red-600 hover:text-white"
                  }`}
                >
                  Сите {activeBrandName}
                </button>
                {carModels.map((model) => (
                  <button key={model}
                    onClick={() => router.push(`/products?brand=${activeBrand}&car_model=${encodeURIComponent(model)}`)}
                    className={`rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition ${
                      activeCarModel === model
                        ? "bg-red-600 text-white"
                        : "border-2 border-zinc-700 text-zinc-300 hover:border-red-600 hover:text-white"
                    }`}
                  >
                    {activeBrandName} {model}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Назад кога нема модели */}
          {activeBrand !== "all" && !isSearchMode && carModels.length === 0 && (
            <button onClick={() => router.push("/products")}
              className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white">
              ← Сите брендови
            </button>
          )}

          {/* ── ПРОИЗВОДИ GRID ── */}
          {filtered.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md py-16 text-center">
              <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl border border-zinc-800 bg-[#111]">
                <Mail size={32} className="text-red-600" />
              </div>
              <h2 className="mt-6 text-2xl font-black uppercase text-white">
                {isSearchMode ? `Нема резултати` : "Нема производи"}
              </h2>
              <p className="mt-3 text-zinc-400 text-sm leading-7">
                {isSearchMode
                  ? `Не пронајдовме производи за „${localSearch}". Пробај поинаков термин или контактирај не.`
                  : "Контактирај не — ги имаме и за овој модел!"}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold uppercase text-white transition hover:bg-red-700">
                  <Mail size={16} /> Контактирај не
                </Link>
                {isSearchMode && (
                  <button onClick={() => { setLocalSearch(""); router.push("/products"); }}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-8 py-4 text-sm font-semibold text-white transition hover:border-red-600">
                    ← Сите производи
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

export default function ProductsClient(props: Props) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    }>
      <ProductsContent {...props} />
    </Suspense>
  );
}
