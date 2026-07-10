"use client";

import { useState } from "react";
import Header from "../components/Header";
import { Mail, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    car: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Прашање за патосници — ${form.car || "не наведено"}`
    );
    const body = encodeURIComponent(
      `Ime: ${form.name}\nEmail: ${form.email}\nVozilo: ${form.car}\n\n${form.message}`
    );
    window.open(
      `mailto:patosnicimk@gmail.com?subject=${subject}&body=${body}`,
      "_blank"
    );
    setSent(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-28">
        <div className="mx-auto max-w-3xl px-6 py-16">

          {/* Title */}
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">
              Контакт
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase text-white">
              Пратете ни порака
            </h1>
            <p className="mt-4 text-zinc-400">
              Имате прашање или сакате да нарачате? Контактирајте не.
            </p>
          </div>

          {/* Email CTA */}
          <div className="mb-10 flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-[#111111] px-6 py-5">
            <Mail size={20} className="text-red-600" />
            <a
              href="mailto:patosnicimk@gmail.com"
              className="text-sm font-medium text-white transition hover:text-red-500"
            >
              patosnicimk@gmail.com
            </a>
          </div>

          {/* Form */}
          {!sent ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-zinc-800 bg-[#111111] p-8"
            >
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Вашето име *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Марко Петровски"
                  className="w-full rounded-xl border border-zinc-700 bg-[#181818] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Вашиот email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="marko@example.com"
                  className="w-full rounded-xl border border-zinc-700 bg-[#181818] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Вашето возило
                </label>
                <input
                  type="text"
                  value={form.car}
                  onChange={(e) => setForm({ ...form, car: e.target.value })}
                  placeholder="пр. VW Golf 7, BMW E90..."
                  className="w-full rounded-xl border border-zinc-700 bg-[#181818] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Порака *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Напишете го вашето прашање или нарачка..."
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-[#181818] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
              >
                <Send size={16} />
                Испрати порака
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-green-800 bg-green-950/30 p-10 text-center">
              <p className="text-2xl font-black uppercase text-white">
                Ви благодариме! ✓
              </p>
              <p className="mt-3 text-zinc-400">
                Вашиот email клиент се отвори. Ако не се отвори,{" "}
                <a
                  href="mailto:patosnicimk@gmail.com"
                  className="text-red-500 underline"
                >
                  пишете директно
                </a>
                .
              </p>
            </div>
          )}

        </div>
      </main>
    </>
  );
}