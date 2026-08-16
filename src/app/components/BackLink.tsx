"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function BackLink() {
  const { t, localizedPath } = useLanguage();
  return (
    <Link
      href={localizedPath("/products")}
      className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
    >
      <ArrowLeft size={15} />
      {t("prod_back")}
    </Link>
  );
}
