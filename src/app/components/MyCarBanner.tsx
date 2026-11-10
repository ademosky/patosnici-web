"use client";

/**
 * The car this visitor last chose.
 *
 * Written by /products when a brand AND a model are both selected — that is the
 * moment the shopper has identified their vehicle. Reading it back here turns a
 * repeat visit into one tap instead of the whole brand-grid hunt.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const MY_CAR_KEY = "op_my_car";

type Saved = { brand: string; carModel: string; label: string };

export default function MyCarBanner() {
  const { t, localizedPath } = useLanguage();
  const [car, setCar] = useState<Saved | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MY_CAR_KEY);
      if (raw) setCar(JSON.parse(raw) as Saved);
    } catch { /* ignore a corrupt entry */ }
  }, []);

  if (!car) return null;

  const href = localizedPath(
    car.carModel
      ? `/products?brand=${encodeURIComponent(car.brand)}&car_model=${encodeURIComponent(car.carModel)}`
      : `/products?brand=${encodeURIComponent(car.brand)}`,
  );

  const forget = () => {
    try { localStorage.removeItem(MY_CAR_KEY); } catch {}
    setCar(null);
  };

  return (
    <section className="bg-[#0b0b0b] pt-6 sm:pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-red-600/40 bg-[#141414] px-4 py-3.5 sm:px-5">
          <Car size={18} className="shrink-0 text-red-600" />
          <p className="text-sm text-zinc-400">
            {t("mycar_label")}:{" "}
            <span className="font-bold text-white">{car.label}</span>
          </p>
          <Link href={href}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700">
            {t("mycar_view")} →
          </Link>
          <button onClick={forget} aria-label={t("mycar_change")}
            className="text-zinc-600 transition hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
