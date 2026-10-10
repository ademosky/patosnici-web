"use client";

import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { Mail } from "lucide-react";
import Link from "next/link";
import type { Product } from "../data/products";
import { useLanguage } from "../context/LanguageContext";
import { matchesAllWords } from "@/lib/search";
import { type Subcategory, subcategoryLabel } from "../data/subcategories";

/** Tiny class joiner — kept local so the storefront never imports admin code. */
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

type Props = { initialProducts: Product[]; subcategories?: Subcategory[] };

export default function AutoAccessoriesClient({ initialProducts, subcategories = [] }: Props) {
  const { t, lang, localizedPath } = useLanguage();
  const [search, setSearch] = useState("");
  const [sub, setSub] = useState("");

  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const searched = initialProducts.filter((p) => {
    if (words.length === 0) return true;
    return matchesAllWords(
      [p.title, p.model, p.brand, p.sku].filter(Boolean).join(" "),
      search
    );
  });

  // Grouping only kicks in once subcategories exist, so a shop that has not
  // set any up sees exactly the same page as before.
  const grouped = subcategories.length > 0;
  const UNASSIGNED = "__none__";

  const counts = new Map<string, number>();
  for (const p of searched) {
    const key = p.subcategory && subcategories.some((s) => s.slug === p.subcategory)
      ? p.subcategory
      : UNASSIGNED;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const unassignedLabel = lang === "sq" ? "Të tjera" : "Останато";

  const sections: Array<{ key: string; label: string; items: Product[] }> = grouped
    ? [
        ...subcategories
          .map((s) => ({
            key: s.slug,
            label: subcategoryLabel(s, lang),
            items: searched.filter((p) => p.subcategory === s.slug),
          })),
        {
          key: UNASSIGNED,
          label: unassignedLabel,
          items: searched.filter(
            (p) => !p.subcategory || !subcategories.some((s) => s.slug === p.subcategory)
          ),
        },
      ].filter((sec) => sec.items.length > 0 && (!sub || sec.key === sub))
    : [{ key: "all", label: "", items: searched }];

  const filtered = sections.flatMap((s) => s.items);

  return (
    <main className="min-h-screen bg-[#0b0b0b] pt-20 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            {lang === "sq" ? "Aksesorë" : "Категорија"}
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-black uppercase text-white">
            {lang === "sq" ? "Aksesorë për auto" : "Авто додатоци"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {filtered.length} {t("prod_count_suffix")}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "sq" ? "Kërko..." : "Пребарај..."}
              className="w-full rounded-xl border border-zinc-700 bg-[#141414] py-3 pl-5 pr-10 text-sm text-white outline-none transition focus:border-red-600"
            />
          </div>
        </div>

        {/* Subcategory filter */}
        {grouped && (
          <div className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button onClick={() => setSub("")}
              className={cx(
                "shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition",
                !sub ? "border-red-600 bg-red-600/10 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500",
              )}>
              {lang === "sq" ? "Të gjitha" : "Сите"}
              <span className="ml-1.5 opacity-60">{searched.length}</span>
            </button>
            {subcategories.map((s) => (
              <button key={s.id} onClick={() => setSub(sub === s.slug ? "" : s.slug)}
                className={cx(
                  "shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition",
                  sub === s.slug ? "border-red-600 bg-red-600/10 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500",
                )}>
                {subcategoryLabel(s, lang)}
                <span className="ml-1.5 opacity-60">{counts.get(s.slug) ?? 0}</span>
              </button>
            ))}
            {(counts.get(UNASSIGNED) ?? 0) > 0 && (
              <button onClick={() => setSub(sub === UNASSIGNED ? "" : UNASSIGNED)}
                className={cx(
                  "shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition",
                  sub === UNASSIGNED ? "border-amber-600 bg-amber-600/10 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500",
                )}>
                {unassignedLabel}
                <span className="ml-1.5 opacity-60">{counts.get(UNASSIGNED)}</span>
              </button>
            )}
          </div>
        )}

        {/* Products — grouped by subcategory when any exist */}
        {filtered.length > 0 ? (
          sections.map((sec) => (
            <section key={sec.key} className="mb-10 last:mb-0">
              {grouped && (
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">{sec.label}</h2>
                  <span className="text-xs text-zinc-500">{sec.items.length}</span>
                  <span className="h-px flex-1 bg-zinc-800" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sec.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-[#111]">
              <Mail size={32} className="text-red-600" />
            </div>
            <h2 className="mt-6 text-2xl font-black uppercase text-white">
              {lang === "sq" ? "Nuk ka produkte" : "Нема производи"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {lang === "sq"
                ? "Së shpejti do të shtojmë aksesorë të rinj."
                : "Наскоро ќе додадеме нови додатоци."}
            </p>
            <Link
              href={localizedPath("/contact")}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold uppercase text-white transition hover:bg-red-700"
            >
              <Mail size={16} /> {t("prod_contact")}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
