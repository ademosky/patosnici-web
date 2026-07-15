"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";
import { Product } from "../data/products";
import { useCart } from "../context/CartContext";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.image,
      brand: product.brand,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-[#141414] transition-all duration-300 hover:-translate-y-2 hover:border-red-600 hover:shadow-[0_10px_35px_rgba(220,38,38,0.20)]">

      {/* IMAGE - клик оди на детали */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-64 overflow-hidden bg-black">
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">
          {product.model} · {product.year}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 text-xl font-bold text-white hover:text-red-500 transition">
            {product.title}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-zinc-400">Оригинални гумени патосници</p>

        <div className="mt-4">
          <span className="text-3xl font-extrabold text-red-600">{product.price}</span>
        </div>

        {/* Двe копчиња */}
        <div className="mt-5 flex gap-2">
          {/* Додај во корпа */}
          <button
            onClick={handleAddToCart}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase tracking-wide transition ${
              added
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <ShoppingCart size={16} />
            {added ? "Додадено ✓" : "Во корпа"}
          </button>

          {/* Детали */}
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-3 text-zinc-400 transition hover:border-red-600 hover:text-white"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
