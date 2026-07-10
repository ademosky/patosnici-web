"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
};

export default function ImageCarousel({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
      if (!images || images.length === 0) {
    return (
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#111111] flex items-center justify-center">
        <p className="text-zinc-600 text-sm">Нема слика</p>
      </div>
    );
  }
  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  // ESC за затворање + стрелки за навигација
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  // Блокирај скрол кога е lightbox отворен
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  // Swipe поддршка за мобилен
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    setTouchStart(null);
  };

  return (
    <>
      {/* ── ГЛАВНА СЛИКА ── */}
      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => setLightboxOpen(true)}
          className="group relative h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#111111]"
          aria-label="Зголеми слика"
        >
          <Image
            src={images[current]}
            alt={`${alt} — слика ${current + 1}`}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
              <ZoomIn size={24} className="text-white" />
            </div>
          </div>

          {/* Бројач */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
              {current + 1} / {images.length}
            </div>
          )}
        </button>

        {/* Стрелки */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-red-600"
              aria-label="Претходна"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-red-600"
              aria-label="Следна"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* ── THUMBNAILS ── */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                i === current
                  ? "border-red-600 opacity-100"
                  : "border-zinc-700 opacity-50 hover:opacity-90"
              }`}
              aria-label={`Слика ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${alt} — thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Затвори */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Затвори"
          >
            <X size={20} />
          </button>

          {/* Стрелки во lightbox */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-red-600"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-red-600"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          {/* Голема слика */}
          <div
            className="relative h-[78vh] w-full max-w-5xl px-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[current]}
              alt={`${alt} — слика ${current + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Thumbnails во lightbox */}
          {images.length > 1 && (
            <div
              className="mt-4 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`relative h-14 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    i === current
                      ? "border-red-600 opacity-100"
                      : "border-white/20 opacity-40 hover:opacity-80"
                  }`}
                >
                  <Image src={img} alt={`thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-white/25">
            ← → стрелки · ESC за затворање
          </p>
        </div>
      )}
    </>
  );
}