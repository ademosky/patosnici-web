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

          {/* Messaging — WhatsApp and Viber, not a call line.
              The number is shown so it can be saved, but it is deliberately not
              a tel: link: calls are not the channel this number is for. */}
          <div className="mb-8 sm:mb-10 rounded-2xl border border-zinc-800 bg-[#111111] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {t("contact_msg_label")}
                </p>
                <p className="mt-1.5 select-all text-lg font-bold tracking-wide text-white">
                  +389 75 79 96 97
                </p>
                <p className="mt-1 text-xs text-zinc-500">{t("contact_msg_hint")}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://wa.me/38975799697"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#04381c] transition hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.31-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.42" />
                  </svg>
                  WhatsApp
                </a>

                <a
                  href="viber://chat?number=%2B38975799697"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7360F2] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Viber
                </a>

                <a
                  href="https://m.me/patosnici"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0084FF] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z" />
                  </svg>
                  Messenger
                </a>
              </div>
            </div>
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
