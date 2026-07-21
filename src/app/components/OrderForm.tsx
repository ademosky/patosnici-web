"use client";

import { useState, useRef } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  productTitle: string;
  productPrice: string;
  productSku?: string;
  productId?: number; // used for content_ids in Pixel events
};

export default function OrderForm({ productTitle, productPrice, productSku, productId }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", surname: "", address: "", city: "", phone: "", email: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Prevent duplicate Pixel events on re-render or accidental double-submit
  const initiateCheckoutFiredRef = useRef(false);
  const purchaseFiredRef = useRef(false);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const inputClass = "w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400";

  // Helper: parse numeric value from price string e.g. "1500 МКД" → 1500
  const numericPrice = parseFloat(productPrice.replace(/[^\d.]/g, "")) || 0;

  // Helper: content_ids — always use numeric productId (DB primary key).
  // Never fall back to SKU: SKU is a string and won't match the catalog <g:id>.
  const contentIds = productId ? [String(productId)] : [];

  type Win = Window & { fbq?: (...args: unknown[]) => void };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ── Meta Pixel: InitiateCheckout ─────────────────────────────────────
    // Fires at form submit (all required fields valid, button clicked).
    // fbq is guaranteed available by this point — no polling needed.
    if (!initiateCheckoutFiredRef.current) {
      initiateCheckoutFiredRef.current = true;
      const win = window as Win;
      if (typeof win.fbq === "function") {
        win.fbq("track", "InitiateCheckout", {
          content_ids: contentIds,
          content_name: productTitle,
          content_type: "product",
          value: numericPrice,
          currency: "MKD",
        });
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productTitle, productPrice, productSku }),
      });

      if (res.ok) {
        // ── Meta Pixel: Purchase ────────────────────────────────────────
        // Fires ONLY here — after server returns 200 (order confirmed in DB).
        // NOT on button click. NOT if API fails or network errors.
        if (!purchaseFiredRef.current) {
          purchaseFiredRef.current = true;
          const win = window as Win;
          if (typeof win.fbq === "function") {
            win.fbq("track", "Purchase", {
              content_ids: contentIds,
              content_name: productTitle,
              content_type: "product",
              value: numericPrice,
              currency: "MKD",
            });
          }
        }
        // ───────────────────────────────────────────────────────────────
        setSent(true);
      } else {
        setError(t("order_error"));
      }
    } catch {
      setError(t("order_no_net"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-800 bg-green-950/20 p-12 text-center">
        <CheckCircle size={52} className="mx-auto text-green-500" />
        <h3 className="mt-5 text-2xl font-black uppercase text-white">{t("order_success")}</h3>
        <p className="mt-4 text-zinc-400 leading-7">{t("order_confirm").replace("{phone}", form.phone)}</p>
        {form.email && <p className="mt-2 text-sm text-zinc-500">Email: {form.email}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-[#111111] p-8">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
        <div><label className={labelClass}>Ime *</label><input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Марко" className={inputClass} /></div>
        <div><label className={labelClass}>Prezime *</label><input type="text" required value={form.surname} onChange={(e) => update("surname", e.target.value)} placeholder="Петровски" className={inputClass} /></div>
        <div><label className={labelClass}>Adresa *</label><input type="text" required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="ул. Македонија бр. 12" className={inputClass} /></div>
        <div><label className={labelClass}>Grad *</label><input type="text" required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Скопје" className={inputClass} /></div>
        <div className="sm:col-span-2"><label className={labelClass}>Telefon *</label><input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+389 70 123 456" className={inputClass} /></div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Email <span className="font-normal normal-case text-zinc-600">({t("order_email_opt")})</span></label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="vasiot@email.com" className={inputClass} />
        </div>
      </div>
      {error && <p className="mt-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</p>}

      {/* ── Напомена ── */}
      <div className="mt-5">
        <label className={labelClass}>
          Напомена <span className="font-normal normal-case text-zinc-600">(опционално)</span>
        </label>
        <textarea
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
          placeholder="Пр. достава наутро, ве молам јавете се пред да испратите..."
          maxLength={300}
          rows={2}
          className="w-full resize-none rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
        />
      </div>

      {/* ── Начин на плаќање ── */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Начин на плаќање
        </p>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3.5">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-red-600">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
          <span className="text-sm font-semibold text-white">Готовина при прием</span>
          <span className="ml-auto text-xs text-zinc-500">Плаќање при достава</span>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-4 text-base font-bold uppercase tracking-widest text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {loading ? t("order_sending") : t("order_submit")}
      </button>
    </form>
  );
}
