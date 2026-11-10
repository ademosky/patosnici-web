"use client";

/**
 * The primary way to find a product.
 *
 * A shopper arrives knowing "Golf 5" or "Golf 2010" — not which of the 38 brand
 * logos to scan. This puts the search first and answers as they type, so the
 * path is: type → tap the right car → product page.
 *
 * The backend matches production years too, so "golf 2010" returns the model
 * that was actually built in 2010.
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type Hit = {
  id: number; slug: string; title: string; brand: string;
  car_model?: string; model: string; year: string; price: string; image: string;
};

export default function ModelSearch() {
  const { t, localizedPath } = useLanguage();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced lookup — 250ms is long enough to skip intermediate keystrokes
  // and short enough to feel instant.
  useEffect(() => {
    if (!query.trim()) { setHits([]); setOpen(false); return; }
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setHits(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch { setHits([]); } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (path: string) => { setOpen(false); router.push(localizedPath(path)); };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) go(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={boxRef} className="relative max-w-xl">
      <form onSubmit={onSubmit}>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hits.length > 0 && setOpen(true)}
            placeholder={t("hero_search_ph")}
            aria-label={t("hero_search_ph")}
            className="w-full rounded-2xl border-2 border-zinc-700 bg-[#141414] py-4 pl-5 pr-28 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-red-600"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setHits([]); setOpen(false); }}
              aria-label="clear"
              className="absolute right-[104px] top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white">
              <X size={16} />
            </button>
          )}
          <button type="submit"
            className="absolute right-2 top-1/2 flex h-[42px] -translate-y-1/2 items-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700">
            {loading
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <Search size={15} />}
            <span className="hidden sm:inline">{t("hero_search_btn")}</span>
          </button>
        </div>
      </form>

      <p className="mt-2.5 text-xs text-zinc-500">{t("hero_search_hint")}</p>

      {open && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-700 bg-[#141414] shadow-2xl">
          {hits.map((r) => (
            <button key={r.id} type="button" onClick={() => go(`/products/${r.slug}`)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-zinc-800">
              <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                {r.image && <Image src={r.image} alt={r.title} fill sizes="56px" className="object-cover" unoptimized />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{r.title}</span>
                <span className="block text-xs text-zinc-500">{r.year}</span>
              </span>
              <span className="shrink-0 text-sm font-bold text-red-500">{r.price}</span>
            </button>
          ))}
          <button type="button" onClick={() => go(`/products?q=${encodeURIComponent(query)}`)}
            className="flex w-full items-center justify-center gap-2 border-t border-zinc-800 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
            <Search size={14} /> {t("search_show_all")} „{query}“
          </button>
        </div>
      )}
    </div>
  );
}
