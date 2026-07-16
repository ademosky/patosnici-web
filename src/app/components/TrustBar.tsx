"use client";

import { Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function TrustBar() {
  const { t } = useLanguage();

  const items = [
    { icon: Truck,       title: t("trust1") },
    { icon: ShieldCheck, title: t("trust2") },
    { icon: CreditCard,  title: t("trust3") },
    { icon: Headphones,  title: t("trust4") },
  ];

  return (
    <section className="bg-[#111111] border-y border-zinc-800 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{t("trust_customers")}</h3>
          <p className="mt-2 text-zinc-400">{t("trust_thanks")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-zinc-800 bg-[#171717] p-6 text-center transition hover:border-red-600">
                <Icon className="mx-auto text-red-600" size={34} />
                <h4 className="mt-4 font-semibold text-white">{item.title}</h4>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
