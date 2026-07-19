"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingCart, Send, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", surname: "", address: "", city: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // ── Meta Pixel: InitiateCheckout ──
  // BUG FIX: CartContext loads items ASYNC from localStorage via useEffect.
  // On first mount, items = []. We must depend on [items] so the effect
  // re-runs when items arrive. pixelFiredRef prevents duplicate fires.
  const pixelFiredRef = useRef(false);
  useEffect(() => {
    if (pixelFiredRef.current) return; // already fired — never fire again
    if (items.length === 0) return;    // items not loaded yet — wait

    pixelFiredRef.current = true;      // lock before async polling starts

    const totalValue = items.reduce((sum, item) => {
      const num = parseInt(item.price.replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
      return sum + num * item.quantity;
    }, 0);

    type Fbq = (...args: unknown[]) => void;
    type Win = Window & { fbq?: Fbq };

    let fired = false;
    const fire = (): boolean => {
      if (fired) return true;
      const win = window as Win;
      if (typeof win.fbq !== "function") return false;
      fired = true;
      console.log("[MetaPixel] InitiateCheckout fired", {
        content_ids: items.map((i) => String(i.id)),
        value: totalValue,
        currency: "MKD",
      });
      win.fbq("track", "InitiateCheckout", {
        content_ids: items.map((i) => String(i.id)),
        content_name: items.map((i) => i.title).join(", "),
        content_type: "product",
        value: totalValue,
        currency: "MKD",
      });
      return true;
    };

    if (fire()) return;

    const interval = setInterval(() => { if (fire()) clearInterval(interval); }, 100);
    const timeout = setTimeout(() => clearInterval(interval), 10_000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [items]); // re-runs when items load from localStorage

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const inputClass = "w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400";

  // Prevents double-firing Purchase if handleOrder somehow runs twice
  const purchaseFiredRef = useRef(false);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });

      if (res.ok) {
        // ── Meta Pixel: Purchase ──────────────────────────────────────────
        // Fires HERE and ONLY here — after the server returns 200 (order saved).
        // NOT on button click, NOT on form submit, NOT if request fails.
        // No polling needed: by the time user submits, fbq is already loaded.
        if (!purchaseFiredRef.current) {
          purchaseFiredRef.current = true;
          const totalValue = items.reduce((sum, item) => {
            const num =
              parseInt(item.price.replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
            return sum + num * item.quantity;
          }, 0);
          type Win = Window & { fbq?: (...args: unknown[]) => void };
          const win = window as Win;
          if (typeof win.fbq === "function") {
            win.fbq("track", "Purchase", {
              content_ids: items.map((i) => String(i.id)),
              content_name: items.map((i) => i.title).join(", "),
              content_type: "product",
              value: totalValue,
              currency: "MKD",
            });
          }
        }
        // ─────────────────────────────────────────────────────────────────
        clearCart();
        setSent(true);
      } else {
        setError("Грешка при испраќање. Обидете се пак.");
      }
    } catch {
      setError("Нема интернет врска.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] pt-28">
          <div className="mx-auto max-w-md px-6 text-center">
            <CheckCircle size={60} className="mx-auto text-green-500" />
            <h1 className="mt-6 text-3xl font-black uppercase text-white">Нарачката е примена!</h1>
            <p className="mt-4 text-zinc-400 leading-7">
              Ви благодариме! Ќе ве контактираме на{" "}
              <span className="font-semibold text-white">{form.phone}</span> за потврда.
            </p>
            <Link href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold uppercase text-white transition hover:bg-red-700"
            >
              Продолжи со купување
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-28">
        <div className="mx-auto max-w-6xl px-6 py-12">

          <Link href="/products"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={15} /> Назад кон производи
          </Link>

          <h1 className="mb-8 text-4xl font-black uppercase text-white">
            Корпа
            <span className="ml-3 text-xl font-normal text-zinc-500">({items.length} производи)</span>
          </h1>

          {items.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingCart size={60} className="mx-auto text-zinc-700" />
              <p className="mt-4 text-zinc-500">Корпата е празна</p>
              <Link href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold uppercase text-white transition hover:bg-red-700"
              >
                Разгледај производи
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_400px]">

              {/* Cart items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-[#111] p-5"
                  >
                    <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                      {item.image && (
                        <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-lg font-bold text-red-500">{item.price}</p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-red-600 hover:text-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-red-600 hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button onClick={() => removeItem(item.id)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-700 text-zinc-500 transition hover:border-red-600 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                <div className="rounded-2xl border border-zinc-800 bg-[#111] p-5">
                  {/* Вкупно производи */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="text-sm text-zinc-400">Вкупно производи:</span>
                    <span className="font-semibold text-white">{items.reduce((s, i) => s + i.quantity, 0)} ком</span>
                  </div>

                  {/* Вкупна цена */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-300">Вкупна цена:</span>
                    <span className="text-2xl font-extrabold text-red-500">
                      {items.reduce((sum, item) => {
                        const num = parseInt(item.price.replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
                        return sum + num * item.quantity;
                      }, 0).toLocaleString("mk-MK")} ден
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-zinc-600">
                    Плаќање при подигање · Достава низ цела Македонија
                  </p>
                </div>
              </div>

              {/* Order form */}
              <div>
                <h2 className="mb-5 text-xl font-black uppercase text-white">Детали за нарачка</h2>
                <form onSubmit={handleOrder} className="space-y-4 rounded-2xl border border-zinc-800 bg-[#111] p-6">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Ime *</label>
                      <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Марко" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Prezime *</label>
                      <input required value={form.surname} onChange={(e) => update("surname", e.target.value)} placeholder="Петровски" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Adresa *</label>
                    <input required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="ул. Македонија бр. 12" className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Grad *</label>
                    <input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Скопје" className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Telefon *</label>
                    <input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+389 70 123 456" className={inputClass} />
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>
                      Email{" "}
                      <span className="font-normal normal-case text-zinc-600">(опционален — за потврда)</span>
                    </label>
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="vasiot@email.com" className={inputClass} />
                  </div>

                  {error && (
                    <p className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</p>
                  )}

                  <button type="submit" disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {loading ? "Испраќање..." : "Нарачај сè"}
                  </button>

                  <p className="text-center text-xs text-zinc-600">
                    Плаќање при подигање · Ќе ве контактираме за потврда
                  </p>
                </form>
              </div>

            </div>
          )}
        </div>
      </main>
    </>
  );
}
