"use client";

import { useLanguage } from "../context/LanguageContext";

type Props = {
  description_mk: string;
  description_sq?: string;
};

export default function ProductDescription({ description_mk, description_sq }: Props) {
  const { lang } = useLanguage();
  const text = lang === "sq" && description_sq ? description_sq : description_mk;

  return (
    <p className="mt-5 text-base leading-8 text-zinc-400">
      {text}
    </p>
  );
}
