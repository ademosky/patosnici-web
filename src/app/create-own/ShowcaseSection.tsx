"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ShowcaseItem {
  id: number;
  image: string;
  brand: string;
  model: string;
  sort_order: number;
}

export default function ShowcaseSection() {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/showcase");
        if (res.ok) {
          const data = (await res.json()) as ShowcaseItem[];
          setItems(data);
        }
      } catch {
        // Silent
      }
    };
    fetchItems();
  }, []);

  if (items.length === 0) return null;

  const prev = () => setActiveIndex((p) => (p === 0 ? items.length - 1 : p - 1));
  const next = () => setActiveIndex((p) => (p === items.length - 1 ? 0 : p + 1));

  const openLightbox = (item: ShowcaseItem) => {
    const idx = items.findIndex((i) => i.id === item.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const lightboxNext = () => setLightboxIndex((p) => (p === null ? p : (p + 1) % items.length));
  const lightboxPrev = () => setLightboxIndex((p) => (p === null ? p : (p - 1 + items.length) % items.length));

  // Keyboard navigation (left/right arrows + Escape)
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") lightboxNext();
      else if (e.key === "ArrowLeft") lightboxPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, items.length]);

  // Touch swipe (mobile)
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) lightboxNext();
      else lightboxPrev();
    }
    touchStartX.current = null;
  };

  return (
    <>
      <section id="izraboteni" className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 scroll-mt-24">
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

        {/* Desktop — balanced grid, 3 columns */}
        <div className="hidden gap-4 sm:grid sm:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(item)}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#111] text-left transition-all duration-500 hover:border-red-600/30"
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
                {/* Click indicator */}
                <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-500">{item.brand}</p>
                <p className="text-sm font-semibold text-white">{item.model}</p>
              </div>
            </button>
          ))}

          {items.slice(3).map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(item)}
              className={`group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#111] text-left transition-all duration-500 hover:border-red-600/30 ${
                i === 0 ? "sm:col-start-2" : ""
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
                <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-500">{item.brand}</p>
                <p className="text-sm font-semibold text-white">{item.model}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={() => openLightbox(items[activeIndex])}
            className="block w-full overflow-hidden rounded-2xl"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={items[activeIndex].image}
                alt={items[activeIndex].brand}
                fill
                sizes="100vw"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Click indicator */}
              <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                  {items[activeIndex].brand}
                </p>
                <p className="text-lg font-semibold text-white">
                  {items[activeIndex].model}
                </p>
              </div>
            </div>
          </button>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-[#1a1a1a] text-zinc-400 transition hover:border-red-600 hover:text-red-500"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
              {items.map((item, i) => (
                <button
                  key={item.id}
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

      {/* ── Lightbox overlay ── */}
      {lightboxIndex !== null && items[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-black/60 text-zinc-400 transition hover:border-red-600 hover:text-white sm:right-6 sm:top-6"
            aria-label="Затвори"
          >
            <X size={20} />
          </button>

          {/* Prev arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/60 text-zinc-300 transition hover:border-red-600 hover:text-white sm:left-6"
            aria-label="Претходна"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/60 text-zinc-300 transition hover:border-red-600 hover:text-white sm:right-6"
            aria-label="Следна"
          >
            <ChevronRight size={22} />
          </button>

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={items[lightboxIndex].image}
              alt={`${items[lightboxIndex].brand} ${items[lightboxIndex].model}`}
              width={1200}
              height={900}
              className="max-h-[85vh] w-auto rounded-xl object-contain"
              unoptimized
            />
            {/* Info bar */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">{items[lightboxIndex].brand}</p>
              <p className="text-sm font-semibold text-white">{items[lightboxIndex].model}</p>
              {/* Counter */}
              <p className="mt-1 text-xs text-zinc-400">{lightboxIndex + 1} / {items.length}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
