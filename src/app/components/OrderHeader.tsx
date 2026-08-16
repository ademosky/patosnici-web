"use client";

import { useLanguage } from "../context/LanguageContext";
import PriceDisplay from "./PriceDisplay";

type Props = {
  productTitle: string;
  price: string;
  priceEur?: string;
};

export default function OrderHeader({ productTitle, price, priceEur }: Props) {
  const { t } = useLanguage();

  return (
    <div className="mb-8 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-red-600">{t("order_label")}</p>
      <h2 className="mt-2 text-3xl font-black uppercase text-white">
        {t("order_title")}
      </h2>
      <p className="mt-3 text-zinc-400">
        {t("order_you_order")}{" "}
        <span className="font-semibold text-white">{productTitle}</span>{" "}
        —{" "}
        <PriceDisplay price={price} priceEur={priceEur} className="font-bold text-red-500" />
      </p>
    </div>
  );
}
