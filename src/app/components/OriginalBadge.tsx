"use client";

import { Tag } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function OriginalBadge() {
  const { t } = useLanguage();
  return (
    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
      <Tag size={12} />
      {t("prod_badge")}
    </div>
  );
}
