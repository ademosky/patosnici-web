"use client";

import { CheckCircle, Package, Car, Briefcase, Lock, Droplets, Truck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  category?: string;
};

export default function ProductFeatures({ category }: Props) {
  const { t } = useLanguage();

  // Auto accessories → different benefit set with distinct icons
  if (category === "auto_accessories") {
    const accessories = [
      { icon: Package,   label: t("acc_practical") },
      { icon: Car,       label: t("acc_car") },
      { icon: Briefcase, label: t("acc_daily") },
      { icon: Lock,      label: t("acc_stable") },
      { icon: Droplets,  label: t("acc_clean") },
      { icon: Truck,     label: t("acc_delivery") },
    ];

    return (
      <ul className="mt-8 grid grid-cols-2 gap-3">
        {accessories.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-sm text-zinc-300">
            <Icon size={15} className="flex-shrink-0 text-red-600" />
            {label}
          </li>
        ))}
      </ul>
    );
  }

  // Rubber mats — existing benefits unchanged
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
