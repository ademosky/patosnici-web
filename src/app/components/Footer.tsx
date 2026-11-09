"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const pathname = usePathname();
  const { t, localizedPath } = useLanguage();

  // Not part of the admin app.
  if (pathname?.startsWith("/admin-app")) return null;

  return (
    <footer className="border-t border-zinc-800 bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
          <div>
            <Image src="/images/logo.webp" alt="Original Patosnici" width={240} height={80} className="h-auto w-[190px]" />
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
              <li><Link href={localizedPath("/")} className="transition hover:text-red-500">{t("nav_home")}</Link></li>
              <li><Link href={localizedPath("/products")} className="transition hover:text-red-500">{t("nav_products")}</Link></li>
              <li><Link href={localizedPath("/contact")} className="transition hover:text-red-500">{t("nav_contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">{t("footer_contact")}</h4>
            <div className="mt-5">
              <a href="mailto:patosnicimk@gmail.com" className="flex items-center gap-3 text-sm text-zinc-400 transition hover:text-red-500">
                <Mail size={15} className="flex-shrink-0 text-red-600" />
                patosnicimk@gmail.com
              </a>

              {/* The business number. Shown so it can be saved, but deliberately
                  not a tel: link — WhatsApp and Viber are the channels, and the
                  number should not invite calls. */}
              <p className="mt-4 select-all text-sm text-zinc-400">+389 75 79 96 97</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href="https://wa.me/38975799697"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-[#04381c] transition hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.31-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.42" />
                  </svg>
                  WhatsApp
                </a>

                <a
                  href="viber://chat?number=%2B38975799697"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#7360F2] px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Viber
                </a>

                <a
                  href="https://m.me/patosnici"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0084FF] px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z" />
                  </svg>
                  Messenger
                </a>
              </div>
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
