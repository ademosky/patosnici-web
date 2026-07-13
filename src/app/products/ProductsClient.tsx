"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { Mail, ChevronRight } from "lucide-react";
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

  // Уникатни car_model-и за избраниот бренд
  const carModels = useMemo(() => {
    if (activeBrand === "all") return [];
    const models = initialProducts
      .filter((p) => p.brand === activeBrand && p.car_model)
      .map((p) => p.car_model);
    return [...new Set(models)].sort();
  }, [activeBrand, initialProducts]);

  // Филтрирани производи
  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchBrand    = activeBrand === "all" || p.brand === activeBrand;
      const matchModel    = activeCarModel === "all" || p.car_model === activeCarModel;
      return matchBrand && matchModel;
    });
  }, [activeBrand, activeCarModel, initialProducts]);

  const activeBrandName    = brands.find((b) => b.id === activeBrand)?.name ?? "Сите";
  const showModelSelector  = activeBrand !== "all" && carModels.length > 0;
  const showProducts       = activeBrand === "all" || activeCarModel !== "all" || carModels.length === 0;

  const goToBrand = (brandId: string) => {
    if (brandId === "all") router.push("/products");
    else router.push(`/products?brand=${brandId}`);
  };

  const goToModel = (model: string) => {
    if (model === "all") router.push(`/products?brand=${activeBrand}`);
    else router.push(`/products?brand=${activeBrand}&car_model=${encodeURIComponent(model)}`);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-28">
        <div className="mx-auto max-w-7xl px-6 py-12">

          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
            <button onClick={() => router.push("/products")} className="hover:text-white transition">
              Сите производи
            </button>
            {activeBrand !== "all" && (
              <>
                <ChevronRight size={14} />
                <button onClick={() => goToBrand(activeBrand)} className="hover:text-white transition text-zinc-300">
                  {activeBrandName}
                </button>
              </>
            )}
            {activeCarModel !== "all" && (
              <>
                <ChevronRight size={14} />
                <span className="text-white">{activeCarModel}</span>
              </>
            )}
          </div>

          {/* Title */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Каталог</p>
            <h1 className="mt-2 text-4xl font-black uppercase text-white">
              {activeCarModel !== "all"
                ? `${activeBrandName} ${activeCarModel}`
                : activeBrand !== "all"
                  ? `${activeBrandName} Патосници`
                  : "Сите производи"}
            </h1>
          </div>

          {/* Ниво 1 — Brand филтер */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => goToBrand("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${activeBrand === "all" ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"}`}
            >
              Сите брендови
            </button>
            {brands.map((b) => (
              <button key={b.id} onClick={() => goToBrand(b.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${activeBrand === b.id ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"}`}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* Ниво 2 — Car Model филтер (само кога бренд е избран) */}
          {showModelSelector && (
            <div className="mb-8 rounded-2xl border border-zinc-800 bg-[#111] p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                Модели на {activeBrandName}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => goToModel("all")}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold uppercase transition ${activeCarModel === "all" ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"}`}
                >
                  Сите {activeBrandName}
                </button>
                {carModels.map((model) => (
                  <button key={model} onClick={() => goToModel(model)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold uppercase transition ${activeCarModel === model ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"}`}
                  >
                    {activeBrandName} {model}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ниво 3 — Производи */}
          {showProducts && (
            <>
              <p className="mb-6 text-sm text-zinc-500">{filtered.length} производи</p>
              {filtered.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="mx-auto max-w-lg py-16 text-center">
                  <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl border border-zinc-800 bg-[#111111]">
                    <Mail size={32} className="text-red-600" />
                  </div>
                  <h2 className="mt-6 text-2xl font-black uppercase text-white">
                    Нема производи
                  </h2>
                  <p className="mt-4 text-zinc-400">
                    Контактирај не — ги имаме и за овој модел!
                  </p>
                  <Link
                    href="/contact"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
                  >
                    <Mail size={16} />
                    Прашај
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Кога само бренд е избран и нема car_model — покажи промпт */}
          {!showProducts && showModelSelector && (
            <div className="py-10 text-center text-zinc-500">
              ↑ Избери модел на возило погоре
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