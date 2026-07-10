"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
            Имаме патосници за{" "}
            <span className="font-semibold text-white">{brands.length}+ брендови</span>{" "}
            возила.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пребарај бренд... (пр. BMW, Toyota)"
            className="w-full rounded-xl border border-zinc-700 bg-[#181818] px-5 py-4 text-white outline-none transition focus:border-red-600"
          />
        </div>

        {/* Grid */}
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

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-zinc-500">
            Нема резултати за &quot;{search}&quot;
          </p>
        )}

      </div>
    </section>
  );
}