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
import { productMatchesQuery } from "@/lib/search";

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

  /**
   * How many cards are actually rendered.
   *
   * The catalogue is 626 products and the page used to render every one of
   * them: two megabytes of markup, 595 cards, 598 <img> tags — all parsed and
   * laid out before the shopper could scroll a single row. The full list still
   * lives in memory (that is what makes the search instant), it is only the
   * *rendering* that is capped, so searching is unaffected.
   */
  const PAGE_SIZE = 60;
  const [showCount, setShowCount] = useState(PAGE_SIZE);

  // A new filter or a new search starts from the top again.
  useEffect(() => { setShowCount(PAGE_SIZE); }, [activeBrand, activeCarModel, localSearch]);

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
    return initialProducts.filter((p) => {
      const matchBrand  = activeBrand === "all" || p.brand === activeBrand;
      const matchModel  = activeCarModel === "all" || p.car_model === activeCarModel;

      /* productMatchesQuery also understands years, so "golf 2010" returns the
         model whose production range covers 2010. */
      const matchSearch = productMatchesQuery(p, localSearch);

      return matchBrand && matchModel && matchSearch;
    });
  }, [activeBrand, activeCarModel, localSearch, initialProducts]);

  const activeBrandName = brands.find((b) => b.id === activeBrand)?.name ?? "";
  const isSearchMode    = localSearch.trim().length > 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-20 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">

          {/* ── НАСЛОВ ── */}
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">{t("prod_catalog")}</p>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black uppercase text-white">
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
            <div className="mb-5 sm:mb-6 flex flex-wrap gap-1.5 sm:gap-2">
              {brands.map((b) => (
                <button key={b.id}
                  onClick={() => router.push(localizedPath(`/products?brand=${b.id}`))}
                  className="rounded-xl border border-zinc-700 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-zinc-400 transition hover:border-red-600 hover:text-white"
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          {/* ── МОДЕЛИ (кога бренд е избран — prominentно!) ── */}
          {activeBrand !== "all" && !isSearchMode && carModels.length > 0 && (
            <div className="mb-6 sm:mb-8">
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
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(0, showCount).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filtered.length > showCount && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {showCount} / {filtered.length}
                  </p>
                  <button
                    onClick={() => setShowCount((n) => n + PAGE_SIZE)}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-[#111] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:border-red-600 hover:bg-[#1a1a1a]"
                  >
                    {t("prod_show_more")} (+{Math.min(PAGE_SIZE, filtered.length - showCount)})
                  </button>
                </div>
              )}
            </>
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold uppercase text-white transition hover:bg-red-700">
                  <Mail size={16} /> {t("prod_contact")}
                </Link>
                {isSearchMode && (
                  <a
                    href={`https://wa.me/38975799697?text=${encodeURIComponent(`${t("nores_wa_prefix")} „${localSearch}“`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold text-[#04381c] transition hover:brightness-110"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.31-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.42" />
                    </svg>
                    {t("nores_whatsapp")}
                  </a>
                )}
                {isSearchMode && (
                  <button onClick={() => { setLocalSearch(""); router.push(localizedPath("/products")); }}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold text-white transition hover:border-red-600">
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
