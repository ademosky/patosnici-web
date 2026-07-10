import { Star } from "lucide-react";

const reviews = [
  {
    name: "Марко Петровски",
    car: "VW Golf 7",
    text: "Одлични патосници, совршено пасуваат. Монтажата траеше 2 минути и изгледаат премиум. Препорачувам!",
    rating: 5,
  },
  {
    name: "Сашо Илиевски",
    car: "BMW 3 Series",
    text: "Купив за мојот BMW и воодушевен сум. Квалитетна гума, без мирис, лесни за чистење. Супер искуство.",
    rating: 5,
  },
  {
    name: "Ана Стефановска",
    car: "Škoda Octavia",
    text: "Веќе 6 месеци ги користам и изгледаат исто како нови. Брза достава и добра комуникација.",
    rating: 5,
  },
];

export default function Reviews() {
  return (
    <section className="bg-[#111111] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            Рецензии
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">
            Што велат клиентите
          </h2>
          <p className="mt-4 text-zinc-400">
            Над 5.000 задоволни купувачи низ Македонија
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-2xl border border-zinc-800 bg-[#141414] p-7 transition hover:border-zinc-700"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="mt-5 text-sm leading-7 text-zinc-300">
                "{review.text}"
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-zinc-800 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {review.name}
                  </p>
                  <p className="text-xs text-zinc-500">{review.car}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}