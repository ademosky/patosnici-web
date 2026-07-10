import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-[#0b0b0b] pt-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">

        {/* LEFT */}
        <div className="z-10 py-14">

          <h1 className="text-5xl font-black uppercase leading-tight text-white lg:text-6xl">
            Врвна заштита
            <br />
            <span className="text-red-600">
              за вашиот автомобил
            </span>
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-8 text-gray-300">
            Издржливи, практични и лесни за одржување.
            <br />
            Направени по мерка за секој модел.
            Еко гума без мирис. 
          </p>

          <Link
            href="/products"
            className="mt-10 inline-block rounded-md bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-wide transition hover:bg-red-700"
          >
            Види производи
          </Link>

        </div>

        {/* RIGHT */}
        <div className="relative h-[520px]">
          <Image
            src="/images/hero-bg.png"
            alt="Original Patosnici"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-transparent to-transparent" />
        </div>

      </div>
    </section>
  );
}