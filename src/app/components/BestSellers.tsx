import Link from "next/link";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

export default function BestSellers() {
  return (
    <section className="bg-[#0b0b0b] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black uppercase text-white">
              Најпродавани производи
            </h2>
            <p className="mt-3 text-zinc-400">
              Избрани оригинални патосници од нашата понуда.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden rounded-xl border border-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-600 lg:block"
          >
            Види ги сите →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center lg:hidden">
          <Link
            href="/products"
            className="rounded-xl border border-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
          >
            Види ги сите →
          </Link>
        </div>
      </div>
    </section>
  );
}