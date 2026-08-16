"use client";

import { CheckCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function ProductFeatures() {
  const { t } = useLanguage();
  const features = [
    t("feat_fit"),
    t("feat2_title"),
    t("feat_clean"),
    t("feat_durable"),
    t("feat_payment"),
    t("feat_delivery"),
  ];

  return (
    <ul className="mt-8 grid grid-cols-2 gap-3">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
          <CheckCircle size={15} className="flex-shrink-0 text-red-600" />
          {f}
        </li>
      ))}
    </ul>
  );
}
