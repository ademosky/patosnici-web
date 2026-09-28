"use client";

import { useState } from "react";
import Header from "../components/Header";
import { Mail, Send } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const CONTACT_EMAIL = "patosnicimk@gmail.com";

export default function ContactPage() {
  const { t } = useLanguage();
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
      `${t("contact_subject")} — ${form.car || t("contact_not_specified")}`
    );
    // Field names stay language-neutral so the inbox stays readable to the shop.
    const body = encodeURIComponent(
      `Ime: ${form.name}\nEmail: ${form.email}\nVozilo: ${form.car}\n\n${form.message}`
    );
    window.open(
      `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`,
      "_blank"
    );
    setSent(true);
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-[#181818] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600";
  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b] pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">

          {/* Title */}
          <div className="mb-8 sm:mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">
              {t("contact_label")}
            </p>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black uppercase text-white">
              {t("contact_title")}
            </h1>
            <p className="mt-4 text-zinc-400">
              {t("contact_desc")}
            </p>
          </div>

          {/* Email CTA */}
          <div className="mb-8 sm:mb-10 flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-[#111111] px-4 sm:px-6 py-5">
            <Mail size={20} className="shrink-0 text-red-600" />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-all text-sm font-medium text-white transition hover:text-red-500"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Form */}
          {!sent ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-zinc-800 bg-[#111111] p-4 sm:p-8"
            >
              <div>
                <label className={labelClass}>{t("contact_name")} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("contact_name_ph")}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t("contact_email")} *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t("contact_car")}</label>
                <input
                  type="text"
                  value={form.car}
                  onChange={(e) => setForm({ ...form, car: e.target.value })}
                  placeholder={t("contact_car_ph")}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t("contact_message")} *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder={t("contact_message_ph")}
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-[#181818] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
              >
                <Send size={16} />
                {t("contact_send")}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-green-800 bg-green-950/30 p-6 sm:p-10 text-center">
              <p className="text-xl sm:text-2xl font-black uppercase text-white">
                {t("contact_thanks")}
              </p>
              <p className="mt-3 text-zinc-400">
                {t("contact_opened")}{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-red-500 underline"
                >
                  {t("contact_write_directly")}
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
