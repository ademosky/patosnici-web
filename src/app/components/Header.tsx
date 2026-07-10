"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="Original Patosnici"
            width={300}
            height={100}
            priority
            className="h-auto w-[220px]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-10 text-sm font-semibold uppercase tracking-wide text-white md:flex">
          <Link href="/" className="border-b-2 border-red-600 pb-1 text-white">
            Почетна
          </Link>
          <Link href="/products" className="transition hover:text-red-500">
            Производи
          </Link>
          <Link href="/contact" className="transition hover:text-red-500">
            Контакт
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4 text-white">
          <Link href="/products">
            <Search className="cursor-pointer transition hover:text-red-500" size={20} />
          </Link>

          {/* Mobile burger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-black px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5 text-sm font-semibold uppercase tracking-wide text-white">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              Почетна
            </Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="hover:text-red-500">
              Производи
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="hover:text-red-500">
              Контакт
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}