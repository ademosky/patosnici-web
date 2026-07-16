"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type Props = { productTitle: string; productPrice: string; productSku?: string; };

export default function OrderForm({ productTitle, productPrice, productSku }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", surname: "", address: "", city: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const inputClass = "w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productTitle, productPrice, productSku }),
      });
      if (res.ok) setSent(true);
      else setError(t("order_error"));
    } catch { setError(t("order_no_net")); }
    finally { setLoading(false); }
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
      <button type="submit" disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-4 text-base font-bold uppercase tracking-widest text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {loading ? t("order_sending") : t("order_submit")}
      </button>
    </form>
  );
}
