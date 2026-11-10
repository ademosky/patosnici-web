"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function FacebookFloat() {
  const pathname = usePathname();
  const { market } = useLanguage();
  const isMk = market === "mk";
  const label = isMk ? "Facebook страна" : "Faqja në Facebook";
  const tooltip = isMk ? "Следи не на Facebook" : "Na ndiqni në Facebook";

  // Not part of the admin app — it renders its own chrome.
  if (pathname?.startsWith("/admin-app")) return null;

  return (
    <Link
      href="https://www.facebook.com/patosnici"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      /* On a phone it sat bottom-LEFT, directly over the start of every
         paragraph and over the first field of the order form. Smaller, and on
         the right where text is ragged, so it stops covering words. */
      className="group fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 sm:bottom-6 sm:left-6 sm:right-auto sm:h-14 sm:w-14"
      style={{ background: "#1877F2", boxShadow: "0 4px 24px rgba(24,119,242,0.45)" }}
    >
      {/* Facebook icon */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>

      {/* Tooltip — само на desktop hover */}
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:left-16 sm:right-auto sm:block">
        {tooltip}
        <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
      </span>
    </Link>
  );
}
