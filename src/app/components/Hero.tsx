"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative bg-[#0b0b0b] pt-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="z-10 py-14">
          <h1 className="text-5xl font-black uppercase leading-tight text-white lg:text-6xl">
            {t("hero_title")}
            <br />
            <span className="text-red-600">{t("hero_subtitle")}</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-gray-300">
            {t("hero_desc").split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
          <Link href="/products" className="mt-10 inline-block rounded-md bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-wide transition hover:bg-red-700">
            {t("hero_cta")}
          </Link>
        </div>
        <div className="relative h-[520px]">
          <Image src="/images/hero-bg.png" alt="Original Patosnici" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
