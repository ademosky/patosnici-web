"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

type Props = {
  src: string;
  alt: string;
};

export default function ImageLightbox({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  // Затвори со ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Блокирај скрол кога е отворено
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Thumbnail — клик го отвора lightbox */}
      <button
        onClick={() => setOpen(true)}
        className="group relative h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#111111]"
        aria-label="Зголеми слика"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover overlay со zoom икона */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            <ZoomIn size={26} className="text-white" />
          </div>
        </div>

        {/* Hint текст */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1 text-xs text-white/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          Клик за зголемување
        </div>
      </button>

      {/* Lightbox Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setOpen(false)}
        >
          {/* Затвори копче */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Затвори"
          >
            <X size={20} />
          </button>

          {/* Голема слика */}
          <div
            className="relative h-[85vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Hint */}
          <p className="absolute bottom-4 text-xs text-white/30">
            ESC или клик надвор за затворање
          </p>
        </div>
      )}
    </>
  );
}