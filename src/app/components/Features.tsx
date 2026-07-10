import { Ruler, Leaf, Wrench, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Ruler,
    title: "Прецизно пасување",
    desc: "Секој сет е изработен по мерка за конкретниот модел возило — без сечење, без прилагодување.",
  },
  {
    icon: Leaf,
    title: "Еко гума без мирис",
    desc: "Изработени од еколошка гума без штетни материи и без непријатен мирис.",
  },
  {
    icon: Wrench,
    title: "Лесно одржување",
    desc: "Едноставно чистење со вода. Издржливи на кал, снег и секојдневна употреба.",
  },
  {
    icon: ShieldCheck,
    title: "Долготрајна заштита",
    desc: "Го штитат оригиналниот под на возилото и ја задржуваат вредноста на вашиот автомобил.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#0b0b0b] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            Зошто нас
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">
            Квалитет кој се чувствува
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            Секој производ е резултат на прецизна изработка и внимание кон деталите.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-2xl border border-zinc-800 bg-[#111111] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-red-600"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-[#1a1a1a] transition group-hover:border-red-600">
                  <Icon size={22} className="text-red-600" />
                </div>
                <h3 className="mt-5 text-lg font-bold uppercase text-white">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}