"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-zinc-800 bg-[#080808]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Image src="/images/logo.png" alt="Original Patosnici" width={240} height={80} className="h-auto w-[190px]" />
            <p className="mt-5 text-sm leading-7 text-zinc-400">{t("footer_desc")}</p>
            <div className="mt-6 flex items-center gap-3">
              <a href="https://www.facebook.com/patosnici" target="_blank" rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-600 hover:text-red-500" aria-label={t("footer_follow")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/patosnici?igsh=dW0yZTdvYWFicXY5" target="_blank" rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-600 hover:text-red-500" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">{t("footer_nav")}</h4>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              <li><Link href="/" className="transition hover:text-red-500">{t("nav_home")}</Link></li>
              <li><Link href="/products" className="transition hover:text-red-500">{t("nav_products")}</Link></li>
              <li><Link href="/contact" className="transition hover:text-red-500">{t("nav_contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">{t("footer_contact")}</h4>
            <div className="mt-5">
              <a href="mailto:patosnicimk@gmail.com" className="flex items-center gap-3 text-sm text-zinc-400 transition hover:text-red-500">
                <Mail size={15} className="flex-shrink-0 text-red-600" />
                patosnicimk@gmail.com
              </a>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Original Patosnici. {t("footer_rights")}</p>
        </div>
      </div>
    </footer>
  );
}
