"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { Mail } from "lucide-react";
import Link from "next/link";
import type { Product } from "../data/products";
import type { Brand } from "../data/brands";

type Props = {
  initialProducts: Product[];
  brands: Brand[];
};

function ProductsContent({ initialProducts, brands }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandParam = searchParams.get("brand") || "all";

  const [activeBrand, setActiveBrand] = useState<string>(brandParam);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setActiveBrand(searchParams.get("brand") || "all");
  }, [searchParams]);

  const handleBrandClick = (brandId: string) => {
    setActiveBrand(brandId);
    router.push(brandId === "all" ? "/products" : `/products?brand=${brandId}`);
  };

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchBrand = activeBrand === "all" || p.brand === activeBrand;
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [activeBrand, search, initialProducts]);

  const activeBrandName = brands.find((b) => b.id === activeBrand)?.name ?? "Сите";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-28">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Каталог</p>
            <h1 className="mt-2 text-4xl font-black uppercase text-white">
              {activeBrand === "all" ? "Сите производи" : `${activeBrandName} Патосници`}
            </h1>
            <p className="mt-2 text-zinc-500">
              {filtered.length > 0 ? `${filtered.length} производи` : "Нема производи"}
            </p>
          </div>

          <div className="mb-8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пребарај по модел..."
              className="w-full max-w-md rounded-xl border border-zinc-700 bg-[#141414] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
            />
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            <button
              onClick={() => handleBrandClick("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${activeBrand === "all" ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"}`}
            >
              Сите
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBrandClick(b.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${activeBrand === b.id ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"}`}
              >
                {b.name}
              </button>
            ))}
          </div>

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
                Не го гледате вашиот модел?
              </h2>
              <p className="mt-4 text-zinc-400 leading-7">
                Имаме патосници за{" "}
                <span className="font-semibold text-white">{activeBrandName}</span>{" "}
                возила кои не се уште листани.
              </p>
              <Link
                href={`/contact?car=${encodeURIComponent(activeBrandName)}`}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
              >
                <Mail size={16} />
                Прашај за {activeBrandName}
              </Link>
              <button
                onClick={() => handleBrandClick("all")}
                className="mt-4 block w-full text-center text-sm text-zinc-500 transition hover:text-white"
              >
                ← Назад кон сите производи
              </button>
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