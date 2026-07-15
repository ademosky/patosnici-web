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

const MESSENGER_URL = "https://m.me/patosnici";

export default function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handle = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="mt-10 flex flex-col gap-3">

      {/* Ред 1: Додај во корпа + Нарачај директно */}
      <div className="flex gap-3">
        {/* Додај во корпа */}
        <button
          onClick={handle}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold uppercase tracking-widest text-white transition ${
            added ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {added ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
          {added ? "Додадено ✓" : "Додај во корпа"}
        </button>

        {/* Нарачај директно */}
        <a
          href="#naracaj"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 py-4 text-sm font-semibold text-white transition hover:border-red-600"
        >
          Нарачај директно →
        </a>
      </div>

      {/* Ред 2: Messenger копче */}
      <a
        href={`${MESSENGER_URL}?ref=${encodeURIComponent(product.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-white transition"
        style={{ background: "linear-gradient(135deg, #0099FF, #A033FF)" }}
      >
        {/* Messenger SVG икона */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.46 5.556 3.746 7.285V22l3.416-1.879c.913.253 1.879.39 2.838.39 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm1.006 12.443l-2.546-2.72-4.97 2.72 5.467-5.79 2.607 2.72 4.91-2.72-5.468 5.79z"/>
        </svg>
        Прашај не на Messenger
      </a>

    </div>
  );
}
