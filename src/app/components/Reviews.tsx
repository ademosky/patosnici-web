"use client";

import { Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Reviews() {
  const { t } = useLanguage();

  const reviews = [
    { name: "Марко Петровски", car: t("rev1_car"), text: t("rev1_text"), rating: 5 },
    { name: "Сашо Илиевски",   car: t("rev2_car"), text: t("rev2_text"), rating: 5 },
    { name: "Ана Стефановска", car: t("rev3_car"), text: t("rev3_text"), rating: 5 },
  ];

  return (
    <section className="bg-[#111111] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">{t("rev_label")}</p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">{t("rev_title")}</h2>
          <p className="mt-4 text-zinc-400">{t("rev_count")}</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} className="rounded-2xl border border-zinc-800 bg-[#141414] p-7 transition hover:border-zinc-700">
              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-zinc-300">"{review.text}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-zinc-800 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                  <p className="text-xs text-zinc-500">{review.car}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
