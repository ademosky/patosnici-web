"use client";

import { useState } from "react";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

type Props = {
  product: {
    id: number;
    slug: string;
    title: string;
    price: string;
    image: string;
    brand: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handle = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      {/* Додај во корпа */}
      <button
        onClick={handle}
        className={`flex flex-1 items-center justify-center gap-3 rounded-xl py-4 text-sm font-bold uppercase tracking-widest text-white transition ${
          added ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {added ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
        {added ? "Додадено во корпа ✓" : "Додај во корпа"}
      </button>

      {/* Нарачај директно */}
      <a
        href="#naracaj"
        className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-zinc-700 py-4 text-sm font-semibold text-white transition hover:border-red-600"
      >
        Нарачај директно →
      </a>
    </div>
  );
}
