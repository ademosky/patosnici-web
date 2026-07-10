import Image from "next/image";
import Link from "next/link";
import { Product } from "../data/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#141414] transition-all duration-300 group-hover:-translate-y-2 group-hover:border-red-600 group-hover:shadow-[0_10px_35px_rgba(220,38,38,0.20)]">

        {/* IMAGE */}
        <div className="relative h-80 overflow-hidden bg-black">
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="p-5">

          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            {product.model} · {product.year}
          </p>

          <h3 className="mt-2 text-xl font-bold text-white">
            {product.title}
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Оригинални гумени патосници
          </p>

          <div className="mt-5">
            <span className="text-3xl font-extrabold text-red-600">
              {product.price}
            </span>
          </div>

          <div className="mt-6 w-full rounded-xl bg-red-600 py-3 text-center text-lg font-semibold text-white transition group-hover:bg-red-700">
            Погледни производ
          </div>

        </div>
      </article>
    </Link>
  );
}