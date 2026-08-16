"use client";

import { useLanguage } from "../../context/LanguageContext";

type Props = {
  price: string;
  priceEur?: string;
  className?: string;
};

export default function PriceDisplay({ price, priceEur, className }: Props) {
  const { formatPrice } = useLanguage();
  return <span className={className}>{formatPrice(price, priceEur)}</span>;
}
