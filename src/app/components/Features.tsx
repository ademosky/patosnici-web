"use client";

import { Ruler, Leaf, Wrench, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Features() {
  const { t } = useLanguage();

  const features = [
    { icon: Ruler, title: t("feat1_title"), desc: t("feat1_desc") },
    { icon: Leaf,  title: t("feat2_title"), desc: t("feat2_desc") },
    { icon: Wrench, title: t("feat3_title"), desc: t("feat3_desc") },
    { icon: ShieldCheck, title: t("feat4_title"), desc: t("feat4_desc") },
  ];

  return (
    <section className="bg-[#0b0b0b] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">{t("feat_label")}</p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">{t("feat_title")}</h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">{t("feat_desc")}</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group rounded-2xl border border-zinc-800 bg-[#111111] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-red-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-[#1a1a1a] transition group-hover:border-red-600">
                  <Icon size={22} className="text-red-600" />
                </div>
                <h3 className="mt-5 text-lg font-bold uppercase text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
