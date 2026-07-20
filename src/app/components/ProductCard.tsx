"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

type ProductCardProps = { product: Product; };

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, slug: product.slug, title: product.title, price: product.price, image: product.image, brand: product.brand, sku: product.sku });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-[#141414] transition-all duration-300 hover:-translate-y-2 hover:border-red-600 hover:shadow-[0_10px_35px_rgba(220,38,38,0.20)]">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-64 overflow-hidden bg-black">
          <Image src={product.image} alt={product.title} fill priority className={`object-cover transition-transform duration-500 group-hover:scale-105 ${product.in_stock === false ? "opacity-50" : ""}`} />
          {product.in_stock === false && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-xl bg-zinc-900/90 px-4 py-2 text-sm font-bold uppercase tracking-wide text-zinc-300 border border-zinc-600">{t("prod_no_stock")}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">{product.model} · {product.year}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 text-xl font-bold text-white hover:text-red-500 transition">{product.title}</h3>
        </Link>
        <p className="mt-2 text-sm text-zinc-400">{t("prod_original")}</p>
        <div className="mt-4"><span className="text-3xl font-extrabold text-red-600">{product.price}</span></div>
        <div className="mt-5 flex gap-2">
          <Link href={`/products/${product.slug}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700">
            {t("prod_details")}
          </Link>
          {product.in_stock !== false ? (
            <button onClick={handleAddToCart} title={t("prod_add_cart")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${added ? "border-green-600 bg-green-600/20 text-green-400" : "border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-red-400"}`}>
              <ShoppingCart size={16} />
              {added ? "✓" : ""}
            </button>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-zinc-800 px-4 py-3 opacity-40">
              <ShoppingCart size={16} className="text-zinc-600" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
