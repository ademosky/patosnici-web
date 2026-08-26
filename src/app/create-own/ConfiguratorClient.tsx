"use client";

import { useState, useMemo, useRef } from "react";
import { brands } from "../data/brands";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { getEurValue } from "@/lib/pricing";
import { Send, CheckCircle, Loader2, ChevronDown, ShoppingCart } from "lucide-react";
import MatPreview from "./MatPreview";
import {
  BODY_COLORS,
  BORDER_COLORS,
  VEHICLES,
  CONFIG_BASE_PRICE_MKD,
  type BodyColor,
  type BorderColor,
  type Vehicle,
} from "./configData";

type Config = {
  vehicle: Vehicle | null;
  bodyColor: BodyColor;
  borderColor: BorderColor;
  withLogo: boolean;
};

type Step = "vehicle" | "body" | "border" | "logo";

// ── helpers ──
function brandName(brandId: string) {
  return brands.find((b) => b.id === brandId)?.name ?? brandId;
}

function brandLogo(brandId: string) {
  return brands.find((b) => b.id === brandId)?.logo ?? "";
}

// ── mini sub-components rendered inline for bundle-simplicity ──

function StepIndicator({ step, current }: { step: Step; current: Step }) {
  const order: Step[] = ["vehicle", "body", "border", "logo"];
  const idx = order.indexOf(step);
  const cur = order.indexOf(current);
  const done = idx < cur;
  const active = idx === cur;
  const labels: Record<Step, string> = {
    vehicle: "01",
    body: "02",
    border: "03",
    logo: "04",
  };
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
        done
          ? "bg-green-600 text-white"
          : active
          ? "bg-red-600 text-white"
          : "bg-zinc-800 text-zinc-500"
      }`}
    >
      {labels[step]}
    </span>
  );
}

// ── main component ──

export default function ConfiguratorClient() {
  const { t, lang, currency, localizedPath } = useLanguage();
  const { addItem } = useCart();

  const [step, setStep] = useState<Step>("vehicle");
  const [config, setConfig] = useState<Config>({
    vehicle: null,
    bodyColor: BODY_COLORS[0],
    borderColor: BORDER_COLORS[0],
    withLogo: false,
  });

  // ── order form state ──
  const [form, setForm] = useState({ name: "", surname: "", address: "", city: "", phone: "", email: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cartAdded, setCartAdded] = useState(false);

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  // ── vehicle filtering ──
  const uniqueBrands = useMemo(() => {
    const ids = [...new Set(VEHICLES.map((v) => v.brandId))];
    return ids.map((id) => ({ id, name: brandName(id), logo: brandLogo(id) }));
  }, []);

  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  const modelsForBrand = useMemo(() => {
    if (!selectedBrandId) return [];
    const ids = [...new Set(VEHICLES.filter((v) => v.brandId === selectedBrandId).map((v) => v.model))];
    return ids;
  }, [selectedBrandId]);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const generationsForModel = useMemo(() => {
    if (!selectedBrandId || !selectedModel) return [];
    return VEHICLES.filter((v) => v.brandId === selectedBrandId && v.model === selectedModel);
  }, [selectedBrandId, selectedModel]);

  const selectVehicle = (v: Vehicle) => {
    setConfig((p) => ({ ...p, vehicle: v, withLogo: false }));
    setStep("body");
  };

  const selectBody = (c: BodyColor) => {
    setConfig((p) => ({ ...p, bodyColor: c }));
    setStep("border");
  };

  const selectBorder = (c: BorderColor) => {
    setConfig((p) => ({ ...p, borderColor: c }));
    setStep("logo");
  };

  const toggleLogo = (on: boolean) => {
    setConfig((p) => ({ ...p, withLogo: on }));
  };

  const resetBrand = () => {
    setSelectedBrandId(null);
    setSelectedModel(null);
    setConfig((p) => ({ ...p, vehicle: null }));
  };

  const resetModel = () => {
    setSelectedModel(null);
  };

  // ── price ──
  const priceMkd = CONFIG_BASE_PRICE_MKD;
  const priceDisplay = currency === "EUR" ? `${getEurValue(`${priceMkd} ден`)} €` : `${priceMkd.toLocaleString("mk-MK")} ден`;

  // ── config summary text ──
  const configSummary = config.vehicle
    ? `${brandName(config.vehicle.brandId)} ${config.vehicle.model} ${config.vehicle.generation} | ${config.bodyColor.label_mk} | ${config.borderColor.label_mk} | ${config.withLogo ? "Со лого" : "Без лого"}`
    : "";

  const productTitle = `Платнени патосници — Изработи сам (${config.vehicle ? `${brandName(config.vehicle.brandId)} ${config.vehicle.model}` : ""})`;

  // ── order submit ──
  const handleOrder = async (e: React.FormEvent) => {
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
          productPrice: `${priceMkd.toLocaleString("mk-MK")} ден`,
          productSku: "",
          note: configSummary,
          currency,
        }),
      });

      if (res.ok) {
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

  const handleAddToCart = () => {
    addItem({
      id: 99999, // special id for configurator product
      slug: "platneni-patosnici-izraboti-sam",
      title: `${productTitle} — ${configSummary}`,
      price: `${priceMkd.toLocaleString("mk-MK")} ден`,
      image: "/images/logo.webp",
      brand: config.vehicle?.brandId ?? "",
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2500);
  };

  const inputClass = "w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none transition focus:border-red-600";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-400";

  // ── render ──
  return (
    <main className="min-h-screen bg-[#0b0b0b] pt-28">
      {/* Hero */}
      <section className="py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">
          {lang === "sq" ? "Krijo Vetë" : "Изработи сам"}
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase text-white">
          {lang === "sq" ? "Tapetet e tua. Zgjedhja jote." : "Твоите патосници. Твој избор."}
        </h1>
        <p className="mt-4 text-zinc-400">
          {lang === "sq" ? "Zgjidh automjetin, ngjyrën, bordurën dhe logon." : "Избери возило, боја, раб и лого."}
        </p>
      </section>

      {/* Step progress */}
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-4 px-6 mb-12">
        {(["vehicle", "body", "border", "logo"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            <StepIndicator step={s} current={step} />
            {i < 3 && <div className="h-px w-10 bg-zinc-800" />}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Selection */}
          <div className="space-y-8">
            {/* Step 1: Vehicle */}
            <div className={`rounded-2xl border p-6 transition ${step === "vehicle" ? "border-red-600/50 bg-[#111]" : "border-zinc-800 bg-[#0d0d0d]"}`}>
              <h2 className="flex items-center gap-2 text-lg font-black uppercase text-white mb-5">
                <span className="text-red-600">01</span> {lang === "sq" ? "Zgjidh automjetin" : "Избери возило"}
              </h2>

              {config.vehicle ? (
                <div className="rounded-xl border border-zinc-700 bg-[#1a1a1a] p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{brandName(config.vehicle.brandId)} {config.vehicle.model}</p>
                    <p className="text-sm text-zinc-400">{config.vehicle.generation}</p>
                  </div>
                  <button onClick={resetBrand} className="text-xs text-zinc-500 hover:text-red-500">
                    {lang === "sq" ? "Ndrysho" : "Промени"}
                  </button>
                </div>
              ) : (
                <>
                  {/* Brand grid */}
                  {!selectedBrandId && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {uniqueBrands.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { setSelectedBrandId(b.id); setSelectedModel(null); }}
                          className="rounded-xl border border-zinc-700 bg-[#1a1a1a] p-3 text-center text-sm font-semibold text-white transition hover:border-red-600 hover:bg-black"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Model list */}
                  {selectedBrandId && !selectedModel && (
                    <>
                      <button onClick={resetBrand} className="mb-3 text-xs text-zinc-500 hover:text-white">
                        &larr; {lang === "sq" ? "Të gjitha markat" : "Сите марки"}
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        {modelsForBrand.map((m) => (
                          <button
                            key={m}
                            onClick={() => setSelectedModel(m)}
                            className="rounded-xl border border-zinc-700 bg-[#1a1a1a] p-3 text-center text-sm font-semibold text-white transition hover:border-red-600 hover:bg-black"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Generation list */}
                  {selectedModel && (
                    <>
                      <button onClick={resetModel} className="mb-3 text-xs text-zinc-500 hover:text-white">
                        &larr; {lang === "sq" ? "Modelet" : "Модели"}
                      </button>
                      <div className="space-y-2">
                        {generationsForModel.map((v) => (
                          <button
                            key={v.generation}
                            onClick={() => selectVehicle(v)}
                            className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] p-4 text-left text-white transition hover:border-red-600 hover:bg-black"
                          >
                            <p className="font-semibold">{brandName(v.brandId)} {v.model}</p>
                            <p className="text-sm text-zinc-400">{v.generation}</p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Step 2: Body color */}
            <div className={`rounded-2xl border p-6 transition ${step === "body" ? "border-red-600/50 bg-[#111]" : "border-zinc-800 bg-[#0d0d0d]"}`}>
              <h2 className="flex items-center gap-2 text-lg font-black uppercase text-white mb-5">
                <span className="text-red-600">02</span> {lang === "sq" ? "Ngjyra e trupit" : "Боја на патосниците"}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {BODY_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectBody(c)}
                    className={`rounded-xl border p-4 text-center transition ${
                      config.bodyColor.id === c.id
                        ? "border-red-600 bg-black"
                        : "border-zinc-700 bg-[#1a1a1a] hover:border-red-600/50"
                    }`}
                  >
                    <div
                      className="mx-auto mb-3 h-16 w-16 rounded-full border-2 border-zinc-600"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-sm font-semibold text-white">
                      {lang === "sq" ? c.label_sq : c.label_mk}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Border color */}
            <div className={`rounded-2xl border p-6 transition ${step === "border" ? "border-red-600/50 bg-[#111]" : "border-zinc-800 bg-[#0d0d0d]"}`}>
              <h2 className="flex items-center gap-2 text-lg font-black uppercase text-white mb-5">
                <span className="text-red-600">03</span> {lang === "sq" ? "Ngjyra e bordurës" : "Боја на раб"}
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {BORDER_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectBorder(c)}
                    className={`rounded-xl border p-4 text-center transition ${
                      config.borderColor.id === c.id
                        ? "border-red-600 bg-black"
                        : "border-zinc-700 bg-[#1a1a1a] hover:border-red-600/50"
                    }`}
                  >
                    <div
                      className="mx-auto mb-3 h-14 w-14 rounded-full border-2 border-zinc-600"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-sm font-semibold text-white">
                      {lang === "sq" ? c.label_sq : c.label_mk}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Logo */}
            <div className={`rounded-2xl border p-6 transition ${step === "logo" ? "border-red-600/50 bg-[#111]" : "border-zinc-800 bg-[#0d0d0d]"}`}>
              <h2 className="flex items-center gap-2 text-lg font-black uppercase text-white mb-5">
                <span className="text-red-600">04</span> {lang === "sq" ? "Logo" : "Лого"}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => toggleLogo(false)}
                  className={`flex-1 rounded-xl border p-4 text-center transition ${
                    !config.withLogo
                      ? "border-red-600 bg-black"
                      : "border-zinc-700 bg-[#1a1a1a] hover:border-red-600/50"
                  }`}
                >
                  <span className="text-sm font-semibold text-white">
                    {lang === "sq" ? "Pa logo" : "Без лого"}
                  </span>
                </button>
                <button
                  onClick={() => toggleLogo(true)}
                  className={`flex-1 rounded-xl border p-4 text-center transition ${
                    config.withLogo
                      ? "border-red-600 bg-black"
                      : "border-zinc-700 bg-[#1a1a1a] hover:border-red-600/50"
                  }`}
                >
                  <span className="text-sm font-semibold text-white">
                    {lang === "sq" ? "Me logo" : "Со лого"}
                  </span>
                  {config.vehicle && (
                    <p className="mt-1 text-xs text-zinc-500">{brandName(config.vehicle.brandId)}</p>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-zinc-800 bg-[#111] p-6">
              <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-zinc-500">
                {lang === "sq" ? "Pamja paraprake" : "Преглед"}
              </h3>

              {/* Live preview mat */}
              <MatPreview
                bodyColorHex={config.bodyColor.hex}
                borderColorHex={config.borderColor.hex}
                withLogo={config.withLogo}
                brandId={config.vehicle?.brandId ?? null}
              />

              {/* Config summary */}
              {config.vehicle && (
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                    {lang === "sq" ? "Konfigurimi yt" : "Твојата конфигурација"}
                  </p>

                  <div className="space-y-2 rounded-xl border border-zinc-800 bg-[#1a1a1a] p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{lang === "sq" ? "Automjeti" : "Возило"}</span>
                      <span className="font-semibold text-white">{brandName(config.vehicle.brandId)} {config.vehicle.model} {config.vehicle.generation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{lang === "sq" ? "Ngjyra" : "Боја"}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-zinc-600" style={{ backgroundColor: config.bodyColor.hex }} />
                        <span className="font-semibold text-white">{lang === "sq" ? config.bodyColor.label_sq : config.bodyColor.label_mk}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{lang === "sq" ? "Bordurë" : "Раб"}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-zinc-600" style={{ backgroundColor: config.borderColor.hex }} />
                        <span className="font-semibold text-white">{lang === "sq" ? config.borderColor.label_sq : config.borderColor.label_mk}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Лого</span>
                      <span className="font-semibold text-white">
                        {config.withLogo
                          ? `${lang === "sq" ? "Me logo" : "Со лого"} — ${brandName(config.vehicle.brandId)}`
                          : lang === "sq" ? "Pa logo" : "Без лого"}
                      </span>
                    </div>
                    <div className="border-t border-zinc-700 pt-3 mt-3 flex justify-between">
                      <span className="text-sm font-semibold text-zinc-300">{lang === "sq" ? "Çmimi" : "Цена"}</span>
                      <span className="text-2xl font-extrabold text-red-500">{priceDisplay}</span>
                    </div>
                  </div>

                  {/* Add to cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={cartAdded}
                    className={`w-full rounded-xl py-4 text-sm font-bold uppercase text-white transition ${
                      cartAdded ? "bg-green-600" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {cartAdded ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
                      {cartAdded
                        ? lang === "sq" ? "U shtua ✓" : "Додадено ✓"
                        : lang === "sq" ? "Shto në shportë" : "Додај во корпа"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order form */}
        {config.vehicle && (
          <div id="naracaj" className="mt-20 mb-16">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                {lang === "sq" ? "Porosia" : "Нарачка"}
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase text-white">
                {lang === "sq" ? "Plotëso të dhënat" : "Пополни ги деталите"}
              </h2>
              <p className="mt-3 text-zinc-400">
                {lang === "sq" ? "Po porosisni:" : "Нарачувате:"}{" "}
                <span className="font-semibold text-white">{productTitle}</span>{" "}
                —{" "}
                <span className="font-bold text-red-500">{priceDisplay}</span>
              </p>
            </div>

            <div className="mx-auto max-w-2xl">
              {sent ? (
                <div className="rounded-2xl border border-green-800 bg-green-950/20 p-12 text-center">
                  <CheckCircle size={52} className="mx-auto text-green-500" />
                  <h3 className="mt-5 text-2xl font-black uppercase text-white">
                    {lang === "sq" ? "Porosia u pranua!" : "Нарачката е примена!"}
                  </h3>
                  {form.email && <p className="mt-2 text-sm text-zinc-500">Email: {form.email}</p>}
                </div>
              ) : (
                <form onSubmit={handleOrder} className="rounded-2xl border border-zinc-800 bg-[#111111] p-8">
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                    <div><label className={labelClass}>{t("form_name")} *</label><input type="text" required value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder={t("form_name_ph")} className={inputClass} /></div>
                    <div><label className={labelClass}>{t("form_surname")} *</label><input type="text" required value={form.surname} onChange={(e) => updateField("surname", e.target.value)} placeholder={t("form_surname_ph")} className={inputClass} /></div>
                    <div><label className={labelClass}>{t("form_address")} *</label><input type="text" required value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder={t("form_address_ph")} className={inputClass} /></div>
                    <div><label className={labelClass}>{t("form_city")} *</label><input type="text" required value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder={t("form_city_ph")} className={inputClass} /></div>
                    <div className="sm:col-span-2"><label className={labelClass}>{t("form_phone")} *</label><input type="tel" required value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder={t("form_phone_ph")} className={inputClass} /></div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>{t("form_email")} <span className="font-normal normal-case text-zinc-600">({t("order_email_opt")})</span></label>
                      <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="email@email.com" className={inputClass} />
                    </div>
                  </div>
                  {error && <p className="mt-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</p>}

                  {/* Config note preview */}
                  <div className="mt-5 rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600/80 mb-1">
                      {lang === "sq" ? "Konfigurimi" : "Конфигурација"}
                    </p>
                    <p className="text-sm text-amber-200">{configSummary}</p>
                  </div>

                  {/* Payment method */}
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {t("payment_method")}
                    </p>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3.5">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-red-600">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                      <span className="text-sm font-semibold text-white">{t("payment_cod")}</span>
                      <span className="ml-auto text-xs text-zinc-500">{t("payment_delivery")}</span>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-4 text-base font-bold uppercase tracking-widest text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {loading ? t("order_sending") : t("order_submit")}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}






