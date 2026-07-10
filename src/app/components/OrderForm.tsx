"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";

type Props = {
  productTitle: string;
  productPrice: string;
  productSku?: string; 
  
};


export default function OrderForm({ productTitle, productPrice, productSku }: Props) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    address: "",
    city: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productTitle,
          productPrice,
          productSku,
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError("Грешка при испраќање. Обидете се пак или јавете се директно.");
      }
    } catch {
      setError("Нема интернет врска. Обидете се пак.");
    } finally {
      setLoading(false);
    }
  };

  // ── Успешна нарачка ──────────────────────
  if (sent) {
    return (
      <div className="rounded-2xl border border-green-800 bg-green-950/20 p-12 text-center">
        <CheckCircle size={52} className="mx-auto text-green-500" />
        <h3 className="mt-5 text-2xl font-black uppercase text-white">
          Нарачката е примена!
        </h3>
        <p className="mt-4 text-zinc-400 leading-7">
          Ви благодариме! Ќе ве контактираме на{" "}
          <span className="font-semibold text-white">{form.phone}</span>{" "}
          за потврда на нарачката.
        </p>
      </div>
    );
  }

  // ── Форма ───────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-[#111111] p-8">

      <div className="grid gap-5 sm:grid-cols-2">

        {/* Ime */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
            Име *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Марко"
            className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
          />
        </div>

        {/* Prezime */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
            Презиме *
          </label>
          <input
            type="text"
            required
            value={form.surname}
            onChange={(e) => update("surname", e.target.value)}
            placeholder="Петровски"
            className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
          />
        </div>

        {/* Adresa */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
            Адреса *
          </label>
          <input
            type="text"
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="ул. Македонија бр. 12"
            className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
          />
        </div>

        {/* Grad */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
            Град *
          </label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Скопје"
            className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
          />
        </div>

        {/* Telefon — full width */}
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400">
            Телефон *
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="070 123 456"
            className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
          />
        </div>

      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-4 text-base font-bold uppercase tracking-widest text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Send size={18} />
        )}
        {loading ? "Испраќање..." : "Финално нарачај"}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-600">
        Ќе ве контактираме по телефон за потврда на нарачката.
      </p>

    </form>
  );
}