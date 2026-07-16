"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { total } = useCart();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link href="/" className="flex-shrink-0">
          <Image src="/images/logo.png" alt="Original Patosnici" width={300} height={100} priority className="h-auto w-[220px]" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-10 text-sm font-semibold uppercase tracking-wide text-white md:flex">
          <Link href="/" className="border-b-2 border-red-600 pb-1 text-white">{t("nav_home")}</Link>
          <Link href="/products" className="transition hover:text-red-500">{t("nav_products")}</Link>
          <Link href="/contact" className="transition hover:text-red-500">{t("nav_contact")}</Link>
        </nav>

        <div className="flex items-center gap-3 text-white">

          {/* Language switcher */}
          <div className="hidden items-center overflow-hidden rounded-xl border border-zinc-700 md:flex">
            <button
              onClick={() => setLang("mk")}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition ${lang === "mk" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              МКД
            </button>
            <button
              onClick={() => setLang("sq")}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition ${lang === "sq" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              SHQ
            </button>
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <ShoppingCart className="cursor-pointer transition hover:text-red-500" size={20} />
            {total > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {total}
              </span>
            )}
          </Link>

          {/* Mobile burger */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-black px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5 text-sm font-semibold uppercase tracking-wide text-white">
            <Link href="/" onClick={() => setMobileOpen(false)}>{t("nav_home")}</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="hover:text-red-500">{t("nav_products")}</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="hover:text-red-500">{t("nav_contact")}</Link>
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 hover:text-red-500">
              {t("nav_cart")} {total > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs">{total}</span>}
            </Link>
            {/* Mobile language switcher */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button onClick={() => setLang("mk")} className={`rounded-lg px-4 py-2 text-xs font-bold uppercase ${lang === "mk" ? "bg-red-600" : "border border-zinc-700 text-zinc-400"}`}>МКД</button>
              <button onClick={() => setLang("sq")} className={`rounded-lg px-4 py-2 text-xs font-bold uppercase ${lang === "sq" ? "bg-red-600" : "border border-zinc-700 text-zinc-400"}`}>SHQ</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
