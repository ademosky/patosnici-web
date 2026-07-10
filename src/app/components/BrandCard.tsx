"use client";

import { Brand } from "../data/brands";
import { useState } from "react";

type BrandCardProps = {
  brand: Brand;
  isViewAll?: boolean;
  onClick?: () => void;
};

export default function BrandCard({
  brand,
  isViewAll = false,
  onClick,
}: BrandCardProps) {
  const [imgError, setImgError] = useState(false);

  if (isViewAll) {
    return (
      <button
        onClick={onClick}
        className="group flex h-36 flex-col items-center justify-center rounded-2xl border border-red-600 bg-[#141414] transition-all duration-300 hover:-translate-y-1 hover:bg-red-600"
      >
        <span className="text-4xl text-white transition-transform duration-300 group-hover:translate-x-2">
          →
        </span>
        <span className="mt-3 text-sm font-semibold text-white">
          Сите
        </span>
      </button>
    );
  }

  // Само темните логоа ги инвертираме во бело
  const imgClass = brand.lightLogo
    ? "h-12 w-12 object-contain"
    : "h-12 w-12 object-contain brightness-0 invert";

  return (
    <button
      onClick={onClick}
      className="group flex h-36 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#141414] transition-all duration-300 hover:-translate-y-1 hover:border-red-600"
    >
      {brand.logo && !imgError ? (
        <img
          src={brand.logo}
          alt={brand.name}
          onError={() => setImgError(true)}
          className={imgClass}
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-lg font-black text-white">
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <h3 className="mt-4 text-sm font-semibold text-white">
        {brand.name}
      </h3>
    </button>
  );
}