"use client";

import { useLanguage } from "../context/LanguageContext";

export default function PaymentNote() {
  const { t } = useLanguage();
  return <span className="mb-1 text-sm text-zinc-500">· {t("payment_on_delivery")}</span>;
}
