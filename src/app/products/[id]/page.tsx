import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import OrderForm from "../../components/OrderForm";
import ImageCarousel from "../../components/ImageCarousel";
import { getProducts, getProductBySlug } from "../../data/products";
import { CheckCircle, ArrowLeft, Tag } from "lucide-react";
import AddToCartButton from "../../components/AddToCartButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) notFound();

  const features = [
    "Прецизно пасување за овој модел",
    "Еко гума без мирис",
    "Лесно чистење со вода",
    "Долготрајна заштита на подот",
    "Плаќање при подигање",
    "Достава низ цела Македонија",
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-28">
        <div className="mx-auto max-w-6xl px-6 py-12">

          <Link
            href="/products"
            className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={15} />
            Назад кон производи
          </Link>

          <div className="grid gap-12 lg:grid-cols-2">

            {/* Carousel */}
            <div className="relative">
              <ImageCarousel
                images={product.images && product.images.length > 0 ? product.images : [product.image]}
                alt={product.title}
              />
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                <Tag size={12} />
                Оригинален производ
              </div>
              {product.in_stock === false && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                  <span className="rounded-2xl border border-zinc-500 bg-zinc-900/95 px-8 py-4 text-xl font-black uppercase tracking-widest text-zinc-300">
                    Нема залиха
                  </span>
                </div>
              )}
            </div>

            {/* Инфо */}
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                {product.brand.toUpperCase()} · {product.year}
              </p>

              <h1 className="mt-3 text-4xl font-black uppercase leading-tight text-white">
                {product.title}
              </h1>

              {/* Модел + SKU */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-zinc-400">
                  {product.model} · {product.year}
                </span>
                {product.sku && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1">
                    <span className="text-xs text-zinc-500">SKU</span>
                    <span className="font-mono text-sm font-bold text-white">
                      {product.sku}
                    </span>
                  </span>
                )}
              </div>

              <p className="mt-5 text-base leading-8 text-zinc-400">
                {product.description}
              </p>

              <div className="mt-8 flex items-end gap-3">
                <span className="text-5xl font-extrabold text-red-600">
                  {product.price}
                </span>
                <span className="mb-1 text-sm text-zinc-500">
                  · плаќање при подигање
                </span>
              </div>

              <ul className="mt-8 grid grid-cols-2 gap-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle size={15} className="flex-shrink-0 text-red-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <AddToCartButton product={{
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                image: product.image,
                brand: product.brand,
              }} />
            </div>
          </div>

          {/* Order Form */}
          <div id="naracaj" className="mt-20">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">Нарачка</p>
              <h2 className="mt-2 text-3xl font-black uppercase text-white">
                Пополни ги деталите
              </h2>
              <p className="mt-3 text-zinc-400">
                Нарачувате:{" "}
                <span className="font-semibold text-white">{product.title}</span>{" "}
                —{" "}
                <span className="font-bold text-red-500">{product.price}</span>
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <OrderForm
                productTitle={product.title}
                productPrice={product.price}
                productSku={product.sku}
              />
            </div>
          </div>

        </div>
      </main>
    </>
  );
}