"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ShowcaseItem {
  image: string;
  brand: string;
  model: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { image: "/images/products/alfa-147.webp", brand: "Alfa Romeo", model: "147" },
  { image: "/images/products/audi-a3.webp", brand: "Audi", model: "A3" },
  { image: "/images/products/golf-5.webp", brand: "Volkswagen", model: "Golf 5" },
  { image: "/images/products/alfa-159.webp", brand: "Alfa Romeo", model: "159" },
  { image: "/images/products/audi-a3-2.webp", brand: "Audi", model: "A3" },
];

export default function ShowcaseSection() {
  const { t, lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((p) => (p === 0 ? SHOWCASE_ITEMS.length - 1 : p - 1));
  const next = () => setActiveIndex((p) => (p === SHOWCASE_ITEMS.length - 1 ? 0 : p + 1));

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
      {/* Section header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
          {lang === "sq" ? "Galeria" : "Галерија"}
        </p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
          {lang === "sq" ? "Punime të realizuara" : "Изработени патосници"}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          {lang === "sq"
            ? "Shiko cilësinë e tapeteve tona të punuara me dorë. Çdo porosi është unike."
            : "Погледни го квалитетот на нашите рачно изработени патосници. Секоја нарачка е уникатна."
          }
        </p>
      </div>

      {/* Desktop — balanced 3-column grid, 2 rows (3+2) */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-3">
        {/* Row 1: first 3 items */}
        {SHOWCASE_ITEMS.slice(0, 3).map((item, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#111] transition-all duration-500 hover:border-red-600/30"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={item.image}
                alt={`${item.brand} ${item.model}`}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">{item.brand}</p>
              <p className="text-sm font-semibold text-white">{item.model}</p>
            </div>
          </div>
        ))}

        {/* Row 2: last 2 items, centered in columns 2-3 */}
        {SHOWCASE_ITEMS.slice(3).map((item, i) => {
          const isFirst = i === 0;
          return (
            <div
              key={i + 3}
              className={`group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#111] transition-all duration-500 hover:border-red-600/30 ${
                isFirst ? "sm:col-start-2" : ""
              }`}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.brand} ${item.model}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-500">{item.brand}</p>
                <p className="text-sm font-semibold text-white">{item.model}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile carousel */}
      <div className="relative sm:hidden">
        <div className="overflow-hidden rounded-2xl">
          <div className="aspect-[4/3] relative">
            <Image
              src={SHOWCASE_ITEMS[activeIndex].image}
              alt={SHOWCASE_ITEMS[activeIndex].brand}
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                {SHOWCASE_ITEMS[activeIndex].brand}
              </p>
              <p className="text-lg font-semibold text-white">
                {SHOWCASE_ITEMS[activeIndex].model}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-[#1a1a1a] text-zinc-400 transition hover:border-red-600 hover:text-red-500"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {SHOWCASE_ITEMS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? "w-6 bg-red-600" : "w-2 bg-zinc-600"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-[#1a1a1a] text-zinc-400 transition hover:border-red-600 hover:text-red-500"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <p className="text-sm text-zinc-500">
          {lang === "sq"
            ? "Çdo palë tapete është punuar me dorë sipas porosisë tuaj."
            : "Секој пар патосници е рачно изработен според твојата нарачка."
          }
        </p>
      </div>
    </section>
  );
}
