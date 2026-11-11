"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import ModelSearch from "./ModelSearch";

export default function Hero() {
  const { t, localizedPath } = useLanguage();

  return (
    <section className="relative bg-[#0b0b0b] pt-20 sm:pt-28">
      <div className="mx-auto grid max-w-7xl items-center gap-6 sm:gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="z-10 py-8 sm:py-14">
          <h1 className="text-3xl sm:text-5xl font-black uppercase leading-tight text-white lg:text-6xl">
            {t("hero_title")}
            <br />
            <span className="text-red-600">{t("hero_subtitle")}</span>
          </h1>
          <p className="mt-5 sm:mt-8 max-w-lg text-base sm:text-lg leading-7 sm:leading-8 text-gray-300">
            {t("hero_desc").split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
          {/* The search is the primary action: a shopper knows their car, not
              which of 38 brand logos to pick. */}
          <div className="mt-7 sm:mt-9">
            <ModelSearch />
          </div>
          <Link href={localizedPath("/products")} className="mt-4 inline-block text-sm text-zinc-400 underline-offset-4 transition hover:text-white hover:underline">
            {t("hero_cta")} →
          </Link>
        </div>
        <div className="relative h-[300px] sm:h-[420px] lg:h-[520px]">
          <Image
            src="/images/hero-bg.webp"
            alt="Original Patosnici"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {/* On a phone the photo sits BELOW the text, so it needs to fade in
              from the top — the old left-to-right gradient (meant for the
              desktop side-by-side layout) only darkened its left edge and made
              the image look like a pasted rectangle. */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b] via-transparent to-transparent lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#0b0b0b] via-transparent to-transparent lg:block" />
        </div>
      </div>
    </section>
  );
}
