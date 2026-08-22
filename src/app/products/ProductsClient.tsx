"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { Mail, X } from "lucide-react";
import Link from "next/link";
import type { Product } from "../data/products";
import type { Brand } from "../data/brands";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  initialProducts: Product[];
  brands: Brand[];
};

function ProductsContent({ initialProducts, brands }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { localizedPath, t } = useLanguage();

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
    // Split query into words — every word must match at least one field
    // (AND across words, OR across fields). Case-insensitive, partial.
    const words = localSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return initialProducts.filter((p) => {
      const matchBrand  = activeBrand === "all" || p.brand === activeBrand;
      const matchModel  = activeCarModel === "all" || p.car_model === activeCarModel;

      const haystack = [
        p.title,
        p.model,
        p.car_model,
        p.brand,
        p.sku,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        words.length === 0 ||
        words.every((w) => haystack.includes(w));

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
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">{t("prod_catalog")}</p>
            <h1 className="mt-2 text-4xl font-black uppercase text-white">
              {isSearchMode
                ? `${t("search_results_for")} „${localSearch}"`
                : activeCarModel !== "all"
                  ? `${activeBrandName} ${activeCarModel} ${t("prod_suffix")}`
                  : activeBrand !== "all"
                    ? `${activeBrandName} ${t("prod_suffix")}`
                    : t("prod_all")}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{filtered.length} {t("prod_count_suffix")}</p>
          </div>

          {/* ── ПРЕБАРУВАЧКА ── */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <input type="text" value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t("prod_search")}
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
                  onClick={() => router.push(localizedPath(`/products?brand=${b.id}`))}
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
                <button onClick={() => router.push(localizedPath("/products"))}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white">
                  ← {t("prod_all_brands")}
                </button>
                <span className="text-zinc-700">›</span>
                <span className="text-sm font-semibold text-white">{activeBrandName}</span>
              </div>

              {/* Модел копчиња — ГОЛЕМ приказ */}
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                {t("prod_select_model")} {activeBrandName}:
              </p>
              {/* Horizontal scroll on mobile, wrap on larger screens */}
              <div className="-mx-6 px-6 sm:mx-0 sm:px-0">
                <div className="flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
                  <button
                    onClick={() => router.push(localizedPath(`/products?brand=${activeBrand}`))}
                    className={`flex-shrink-0 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition ${
                      activeCarModel === "all"
                        ? "bg-red-600 text-white"
                        : "border-2 border-zinc-700 text-zinc-300 hover:border-red-600 hover:text-white"
                    }`}
                  >
                    {t("all")} {activeBrandName}
                  </button>
                  {carModels.map((model) => (
                    <button key={model}
                      onClick={() => router.push(localizedPath(`/products?brand=${activeBrand}&car_model=${encodeURIComponent(model)}`))}
                      className={`flex-shrink-0 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition ${
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
            </div>
          )}

          {/* Назад кога нема модели */}
          {activeBrand !== "all" && !isSearchMode && carModels.length === 0 && (
            <button onClick={() => router.push(localizedPath("/products"))}
              className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white">
              ← {t("prod_all_brands")}
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
                {isSearchMode ? t("search_no_results") : t("no_products")}
              </h2>
              <p className="mt-3 text-zinc-400 text-sm leading-7">
                {isSearchMode
                  ? `${t("no_results_msg")} „${localSearch}".`
                  : t("prod_contact_msg")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href={localizedPath("/contact")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold uppercase text-white transition hover:bg-red-700">
                  <Mail size={16} /> {t("prod_contact")}
                </Link>
                {isSearchMode && (
                  <button onClick={() => { setLocalSearch(""); router.push(localizedPath("/products")); }}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-8 py-4 text-sm font-semibold text-white transition hover:border-red-600">
                    ← {t("back_all_products")}
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
