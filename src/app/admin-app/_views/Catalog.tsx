"use client";

/**
 * Catalog — products and auto-accessories.
 *
 * One screen, three categories. Accessories live in the same `products` table
 * with category = auto_accessories, so the shop's /auto-accessories page
 * reflects whatever is created here.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { brands } from "../../data/brands";
import {
  Category, Product, CATEGORY_LABEL, CATEGORY_SHORT, categoryOf,
  toNumber, eurValue, allValue, money, groupBy, cx,
} from "../_lib/core";
import { useAdmin } from "../_lib/store";
import {
  Card, SectionTitle, Stat, Pill, Btn, IconBtn, Sheet, Field, Input, Select, Textarea,
  Segmented, Empty, IcSpinner, IcSearch, IcX, IcPlus, IcPencil, IcTrash,
  IcBox, IcUpload, IcAlert, IcCheck, IcTag, IcLayers, IcUp, IcDown,
} from "../_ui/kit";

type Form = {
  title: string; brand: string; model: string; car_model: string; year: string;
  price: string; price_eur: string; sku: string; category: Category;
  description: string; description_sq: string; image: string; images: string[]; in_stock: boolean;
  subcategory: string;
  related_product_ids: number[];
};

const EMPTY: Form = {
  title: "", brand: "", model: "", car_model: "", year: "",
  price: "", price_eur: "", sku: "", category: "rubber_mats",
  description: "", description_sq: "", image: "", images: [], in_stock: true,
  subcategory: "", related_product_ids: [],
};

export function CatalogView({ scope, openNew: openNewReq, onNewClosed }: {
  scope?: Category; openNew?: boolean; onNewClosed?: () => void;
}) {
  const {
    products, subcategories, saveProduct, removeProduct, toast, loading,
    addSubcategory, patchSubcategory, removeSubcategory, moveSubcategory,
  } = useAdmin();
  const [cat, setCat] = useState<Category | "">(scope ?? "");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [onlyOut, setOnlyOut] = useState(false);
  const [subFilter, setSubFilter] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // accessories are a separate view — never mixed into the products list
  const base = useMemo(
    () => products.filter((p) => (scope === "auto_accessories"
      ? categoryOf(p) === "auto_accessories"
      : categoryOf(p) !== "auto_accessories")),
    [products, scope],
  );

  // Subcategories only exist for accessories today.
  const inAccessories = scope === "auto_accessories" || (!scope && cat === "auto_accessories");
  const availableSubs = useMemo(
    () => subcategories.filter((s) => s.category === "auto_accessories"),
    [subcategories],
  );

  // Every vehicle model already used by a mat — offered as suggestions when
  // pinning an accessory to one model.
  const modelSuggestions = useMemo(
    () => [...new Set(
      products
        .filter((p) => categoryOf(p) === "rubber_mats" && p.car_model)
        .map((p) => String(p.car_model).trim()),
    )].sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const counts = useMemo(() => ({
    rubber: base.filter((p) => categoryOf(p) === "rubber_mats").length,
    fabric: base.filter((p) => categoryOf(p) === "fabric_mats").length,
    auto: base.filter((p) => categoryOf(p) === "auto_accessories").length,
    out: base.filter((p) => p.in_stock === false).length,
  }), [base]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return base.filter((p) => {
      if (cat && categoryOf(p) !== cat) return false;
      if (brand && p.brand !== brand) return false;
      if (onlyOut && p.in_stock !== false) return false;
      if (inAccessories && subFilter) {
        if (subFilter === "__none__") { if (p.subcategory) return false; }
        else if (p.subcategory !== subFilter) return false;
      }
      if (needle) {
        const hay = [p.title, p.brand, p.model, p.car_model, p.sku].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [base, cat, brand, onlyOut, q, inAccessories, subFilter]);

  const usedBrands = useMemo(
    () => [...new Set(base.map((p) => p.brand).filter(Boolean))].sort(),
    [base],
  );

  const grouped = useMemo(
    () => {
      if (inAccessories && availableSubs.length > 0) {
        const bySlug = new Map(availableSubs.map((s) => [s.slug, s.name]));
        return groupBy(filtered, (p) => (p.subcategory && bySlug.get(p.subcategory)) || "Останато");
      }
      return groupBy(filtered, (p) => p.brand || "—");
    },
    [filtered, inAccessories, availableSubs],
  );

  const openNew = useCallback(() => {
    setEditId(null);
    setForm({
      ...EMPTY,
      category: scope === "auto_accessories" ? "auto_accessories" : (cat || "rubber_mats"),
    });
    setSubFilter("");
    setOpen(true);
  }, [scope, cat]);

  // The shell's "+" button raises this flag.
  useEffect(() => {
    if (openNewReq) { openNew(); onNewClosed?.(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNewReq]);

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      title: p.title ?? "", brand: p.brand ?? "", model: p.model ?? "",
      car_model: p.car_model ?? "", year: p.year ?? "",
      price: p.price ?? "", price_eur: p.price_eur ?? "", sku: p.sku ?? "",
      category: categoryOf(p),
      description: p.description ?? "", description_sq: p.description_sq ?? "",
      image: p.image ?? "",
      images: p.images?.length ? p.images : (p.image ? [p.image] : []),
      in_stock: p.in_stock !== false,
      subcategory: p.subcategory ?? "",
      related_product_ids: p.related_product_ids ?? (p.related_product_id != null ? [p.related_product_id] : []),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast("Називот е задолжителен", false); return; }
    setSaving(true);
    const ok = await saveProduct({
      ...form,
      brand: form.brand,
      car_model: form.car_model || "",
      images: form.images,
      image: form.image || form.images[0] || "",
      in_stock: form.in_stock,
      price_eur: form.price_eur || null,
      subcategory: form.category === "auto_accessories" ? (form.subcategory || null) : null,
      related_product_ids: form.category === "auto_accessories" ? form.related_product_ids : [],
    }, editId);
    setSaving(false);
    if (ok) setOpen(false);
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const pw = localStorage.getItem("adminPw") ?? sessionStorage.getItem("adminPw") ?? "";
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": pw }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "upload failed");
      setForm((f) => ({ ...f, image: f.image || data.path, images: [...f.images, data.path] }));
      toast(`Прикачено · ${data.savedPercent}% помало`);
    } catch {
      toast("Грешка при прикачување", false);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleStock = (p: Product) => saveProduct({ ...p, in_stock: p.in_stock === false }, p.id);

  const suggestedEur = form.price ? eurValue(form.price, form.price_eur) : 0;
  const suggestedAll = form.price ? allValue(form.price, form.price_eur) : 0;

  return (
    <div className="space-y-4">
      {!scope && (
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Гумени" value={counts.rubber} />
          <Stat label="Платнени" value={counts.fabric} tone="info" />
          <Stat label="Додатоци" value={counts.auto} tone="ok" />
        </div>
      )}

      <Card className="space-y-3 p-3.5">
        {!scope && (
          <Segmented value={cat} onChange={(v) => { setCat(v as Category | ""); setBrand(""); }}
            options={[
              { v: "" as const, label: "Сите" },
              { v: "rubber_mats" as const, label: "Гумени" },
              { v: "fabric_mats" as const, label: "Платнени" },
              { v: "auto_accessories" as const, label: "Додатоци" },
            ]} />
        )}
        <div className="relative">
          <IcSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4e4e58]" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Назив, SKU, модел…" className="pl-9" />
          {q && <button onClick={() => setQ("")} aria-label="Исчисти" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5a5a64]"><IcX size={15} /></button>}
        </div>
        <div className="flex gap-2">
          <Btn className="flex-1" onClick={openNew}><IcPlus size={16} /> {scope === "auto_accessories" ? "Нов додаток" : "Нов производ"}</Btn>
          {inAccessories && (
            <Btn variant="outline" onClick={() => setCatOpen(true)}>
              <IcLayers size={15} /> Категории
            </Btn>
          )}
          <Btn variant={onlyOut ? "danger" : "outline"} onClick={() => setOnlyOut((v) => !v)}>
            <IcAlert size={15} /> {counts.out}
          </Btn>
        </div>

        {/* Subcategory filter — only meaningful for accessories */}
        {inAccessories && availableSubs.length > 0 && (
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            <button onClick={() => setSubFilter("")}
              className={cx("shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                !subFilter ? "border-[#d72026] bg-[#1a0e10] text-white" : "border-[#25252d] text-[#8a8a95]")}>
              Сите
            </button>
            {availableSubs.map((s) => {
              const n = base.filter((p) => p.subcategory === s.slug).length;
              return (
                <button key={s.id} onClick={() => setSubFilter(subFilter === s.slug ? "" : s.slug)}
                  className={cx("shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                    subFilter === s.slug ? "border-[#d72026] bg-[#1a0e10] text-white" : "border-[#25252d] text-[#8a8a95]")}>
                  {s.name}{n > 0 && <span className="ml-1.5 opacity-60">{n}</span>}
                </button>
              );
            })}
            {base.some((p) => !p.subcategory) && (
              <button onClick={() => setSubFilter(subFilter === "__none__" ? "" : "__none__")}
                className={cx("shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                  subFilter === "__none__" ? "border-[#e0b04a] bg-[#241d10] text-white" : "border-[#25252d] text-[#8a8a95]")}>
                Без категорија
              </button>
            )}
          </div>
        )}
        {usedBrands.length > 1 && (
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            <button onClick={() => setBrand("")}
              className={cx("shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                !brand ? "border-[#d72026] bg-[#1a0e10] text-white" : "border-[#25252d] text-[#8a8a95]")}>Сите</button>
            {usedBrands.map((b) => (
              <button key={b} onClick={() => setBrand(brand === b ? "" : b)}
                className={cx("shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                  brand === b ? "border-[#d72026] bg-[#1a0e10] text-white" : "border-[#25252d] text-[#8a8a95]")}>
                {brands.find((x) => x.id === b)?.name ?? b}
              </button>
            ))}
          </div>
        )}
      </Card>

      {(q || cat || brand || onlyOut) && (
        <p className="px-1 text-[11.5px] text-[#6c6c78]">{filtered.length} од {base.length} {base.length === 1 ? "производ" : "производи"}</p>
      )}

      {loading && !products.length ? (
        <div className="flex justify-center py-20 text-[#d72026]"><IcSpinner size={26} /></div>
      ) : filtered.length === 0 ? (
        <Card><Empty icon={<IcBox size={34} />} title="Нема производи"
          sub={q || cat || brand || onlyOut ? "Пробај со друг филтер." : "Додај го првиот производ."}
          action={<Btn onClick={openNew}><IcPlus size={16} /> Додај</Btn>} /></Card>
      ) : (
        grouped.map(([b, list]) => (
          <section key={b}>
            <SectionTitle action={<span className="text-[11px] text-[#5a5a64]">{list.length}</span>}>
              {inAccessories && availableSubs.length > 0
                ? b
                : (brands.find((x) => x.id === b)?.name ?? b)}
            </SectionTitle>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
              {list.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="relative aspect-[4/3] bg-[#0c0c0f]">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className={cx("h-full w-full object-cover", p.in_stock === false && "opacity-45 grayscale")} loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#2f2f38]"><IcBox size={30} /></div>
                    )}
                    {p.in_stock === false && (
                      <span className="absolute left-2 top-2"><Pill tone="red">Нема</Pill></span>
                    )}
                    {p.in_stock !== false && p.sku && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-[#b8b8c2] backdrop-blur-sm">{p.sku}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-tight text-white">{p.title}</p>
                    <p className="mt-1.5 font-heading text-[17px] font-bold tabular-nums text-[#e5454a]">{p.price}</p>
                    <p className="mt-0.5 text-[10.5px] text-[#5a5a64]">
                      {p.model}{p.year ? ` · ${p.year}` : ""}
                    </p>
                    <div className="mt-2.5 flex gap-1.5">
                      <IconBtn label="Уреди" size={36} onClick={() => openEdit(p)}><IcPencil size={15} /></IconBtn>
                      <IconBtn label={p.in_stock === false ? "Врати залиха" : "Нема залиха"} size={36}
                        tone={p.in_stock === false ? "ok" : "neutral"} onClick={() => toggleStock(p)}>
                        {p.in_stock === false ? <IcCheck size={15} /> : <IcAlert size={15} />}
                      </IconBtn>
                      <IconBtn label="Избриши" size={36} tone="red"
                        onClick={() => { if (confirm(`Избриши „${p.title}“?`)) removeProduct(p.id); }}>
                        <IcTrash size={15} />
                      </IconBtn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}

      <CategoryManager
        open={catOpen}
        onClose={() => setCatOpen(false)}
        list={availableSubs}
        counts={(slug) => base.filter((p) => p.subcategory === slug).length}
        onAdd={addSubcategory}
        onPatch={patchSubcategory}
        onRemove={removeSubcategory}
        onMove={moveSubcategory}
        toast={toast}
      />

      {/* ── editor ── */}
      <Sheet open={open} onClose={() => setOpen(false)}
        title={editId ? "Уреди производ" : (scope === "auto_accessories" ? "Нов додаток" : "Нов производ")}
        footer={<Btn className="w-full" size="lg" loading={saving} onClick={save}>Зачувај</Btn>}>
        <div className="space-y-3">
          {/* images */}
          <div>
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Слики</p>
            <div className="flex flex-wrap gap-2">
              {form.images.map((src, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-[68px] w-[88px] rounded-xl border border-[#25252d] object-cover" />
                  <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, x) => x !== i) }))}
                    aria-label="Отстрани" className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#d72026] text-white">
                    <IcX size={12} />
                  </button>
                  {form.image === src && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1 text-[9px] font-semibold text-white">главна</span>
                  )}
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex h-[68px] w-[88px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#2f2f38] text-[#6c6c78] transition active:scale-95">
                {uploading ? <IcSpinner size={18} /> : <IcUpload size={18} />}
                <span className="text-[9.5px]">Додај</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            {form.images.length > 1 && (
              <p className="mt-1.5 text-[10.5px] text-[#5a5a64]">Првата е главна — отстрани ја за да смениш.</p>
            )}
          </div>

          <Field label="Назив *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="пр. Audi A3 Патосници" /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Бренд">
              <Select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                <option value="">— избери —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Категорија">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
                <option value="rubber_mats">Гумени</option>
                <option value="fabric_mats">Платнени</option>
                <option value="auto_accessories">Авто додатоци</option>
              </Select>
            </Field>
          </div>

          {form.category === "auto_accessories" && (
            <Field label="Поткатегорија" hint="Каде оди овој додаток во продавницата">
              <Select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}>
                <option value="">— без поткатегорија —</option>
                {availableSubs.map((s) => (
                  <option key={s.id} value={s.slug}>{s.name}</option>
                ))}
              </Select>
            </Field>
          )}

          {form.category === "auto_accessories" ? (
            <LinkPicker
              products={products}
              value={form.related_product_ids}
              onChange={(ids) => setForm({ ...form, related_product_ids: ids })}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Модел возило">
                <Input value={form.car_model} onChange={(e) => setForm({ ...form, car_model: e.target.value })} placeholder="A3" />
              </Field>
              <Field label="Варијанта"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="A3 8V" /></Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Цена (ден) *" hint={form.price ? `Косово ≈ ${suggestedEur} € · Албанија ≈ ${suggestedAll.toLocaleString("mk-MK")} Lekë` : undefined}>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2.490 ден" />
            </Field>
            <Field label="Години"><Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2019 – 2023" /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="EUR отстапување" hint="празно = автоматски">
              <Input value={form.price_eur} onChange={(e) => setForm({ ...form, price_eur: e.target.value })} placeholder="35" />
            </Field>
            <Field label="SKU"><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="444805" /></Field>
          </div>

          <button onClick={() => setForm((f) => ({ ...f, in_stock: !f.in_stock }))}
            className={cx("flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-[13px] font-semibold transition",
              form.in_stock ? "border-[#2c5c43] bg-[#12241a] text-[#5fc48f]" : "border-[#5c2024] bg-[#240f11] text-[#e5454a]")}>
            <span className="inline-flex items-center gap-2"><IcTag size={15} /> {form.in_stock ? "Достапно" : "Нема залиха"}</span>
            <span className="text-[11px] opacity-70">допре за промена</span>
          </button>

          <Field label="Опис"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Опис (албански)"><Textarea rows={3} value={form.description_sq} onChange={(e) => setForm({ ...form, description_sq: e.target.value })} /></Field>
        </div>
      </Sheet>
    </div>
  );
}

/* ── category manager ──────────────────────────────────────────────── */

function CategoryManager({ open, onClose, list, counts, onAdd, onPatch, onRemove, onMove, toast }: {
  open: boolean; onClose: () => void;
  list: Array<{ id: number; slug: string; name: string; name_sq: string | null }>;
  counts: (slug: string) => number;
  onAdd: (p: { name: string; name_sq?: string; category: string }) => Promise<boolean>;
  onPatch: (id: number, patch: { name?: string; name_sq?: string | null }) => Promise<boolean>;
  onRemove: (id: number) => Promise<boolean>;
  onMove: (id: number, dir: -1 | 1) => Promise<void>;
  toast: (m: string, ok?: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [nameSq, setNameSq] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<number, { name: string; name_sq: string }>>({});

  useEffect(() => { if (!open) { setName(""); setNameSq(""); setDraft({}); } }, [open]);

  const add = async () => {
    if (!name.trim()) { toast("Внеси име", false); return; }
    setAdding(true);
    const ok = await onAdd({ name: name.trim(), name_sq: nameSq.trim() || undefined, category: "auto_accessories" });
    setAdding(false);
    if (ok) { setName(""); setNameSq(""); }
  };

  const save = async (id: number) => {
    const d = draft[id];
    if (!d) return;
    const ok = await onPatch(id, { name: d.name, name_sq: d.name_sq || null });
    if (ok) setDraft((s) => { const n = { ...s }; delete n[id]; return n; });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Категории на додатоци"
      footer={<Btn className="w-full" size="lg" onClick={onClose}>Готово</Btn>}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#1f1f26] bg-[#0c0c0f] p-3.5">
          <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Нова категорија</p>
          <div className="space-y-2.5">
            <Input value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Име (пр. Организери)" />
            <Input value={nameSq} onChange={(e) => setNameSq(e.target.value)}
              placeholder="Албански (опционално)" />
            <Btn className="w-full" loading={adding} onClick={add}><IcPlus size={15} /> Додај</Btn>
          </div>
        </div>

        {list.length === 0 ? (
          <Empty icon={<IcLayers size={30} />} title="Нема категории"
            sub="Додај прва категорија за да можеш да ги распоредиш додатоците." />
        ) : (
          <div className="space-y-2">
            {list.map((s, idx) => {
              const d = draft[s.id];
              const dirty = !!d;
              return (
                <div key={s.id} className="rounded-2xl border border-[#1f1f26] bg-[#101014] p-3">
                  <div className="flex items-center gap-2">
                    <Pill tone="muted">{counts(s.slug)}</Pill>
                    <span className="min-w-0 flex-1" />
                    <IconBtn label="Погоре" size={32} onClick={() => onMove(s.id, -1)}><IcUp size={13} /></IconBtn>
                    <IconBtn label="Подолу" size={32} onClick={() => onMove(s.id, 1)}><IcDown size={13} /></IconBtn>
                  </div>
                  <div className="mt-2.5 space-y-2">
                    <Input value={d ? d.name : s.name}
                      onChange={(e) => setDraft((st) => ({ ...st, [s.id]: { name: e.target.value, name_sq: st[s.id]?.name_sq ?? (s.name_sq ?? "") } }))} />
                    <Input value={d ? d.name_sq : (s.name_sq ?? "")} placeholder="Албански (опционално)"
                      onChange={(e) => setDraft((st) => ({ ...st, [s.id]: { name: st[s.id]?.name ?? s.name, name_sq: e.target.value } }))} />
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    {dirty && <Btn size="sm" className="flex-1" onClick={() => save(s.id)}>Зачувај</Btn>}
                    <Btn size="sm" variant="danger" className="flex-1"
                      onClick={async () => {
                        const n = counts(s.slug);
                        const msg = n > 0
                          ? `Избриши „${s.name}“?\n\n${n} ${n === 1 ? "производ" : "производи"} ќе останат, само без категорија.`
                          : `Избриши „${s.name}“?`;
                        if (confirm(msg)) await onRemove(s.id);
                      }}>
                      <IcTrash size={14} /> Избриши
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="px-1 text-[11px] leading-relaxed text-[#5a5a64]">
          Бришење на категорија <b className="text-[#8a8a95]">не ги брише производите</b> — тие само остануваат без ознака.
        </p>
      </div>
    </Sheet>
  );
}

/* ── link an accessory to one or more exact products ─────────────── */

function LinkPicker({ products, value, onChange }: {
  products: Array<{ id: number; title: string; sku?: string | null; car_model?: string | null; category?: string | null; brand?: string | null }>;
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const [q, setQ] = useState("");
  const chosen = value.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Array<{ id: number; title: string; sku?: string | null }>;

  // Only mats are linkable targets — an accessory points at products to sit beside.
  const candidates = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return products
      .filter((p) => p.category !== "auto_accessories" && !value.includes(p.id))
      .filter((p) => [p.title, p.sku, p.car_model, p.brand]
        .filter(Boolean).join(" ").toLowerCase().includes(needle))
      .slice(0, 12);
  }, [products, q, value]);

  return (
    <Field
      label="Поврзани производи"
      hint={chosen.length
        ? `Се прикажува како препорачан само на ${chosen.length === 1 ? "оваа страница" : "овие страници"}.`
        : "Празно = на сите патосници од истиот бренд."}
    >
      {chosen.length > 0 && (
        <div className="mb-2.5 space-y-1.5">
          {chosen.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-xl border border-[#2c5c43] bg-[#12241a] px-3.5 py-2.5">
              <IcCheck size={15} className="shrink-0 text-[#5fc48f]" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[#8fe0b2]">{p.title}</span>
              {p.sku && <span className="shrink-0 font-mono text-[10.5px] text-[#5a5a64]">{p.sku}</span>}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== p.id))}
                aria-label="Отстрани" className="shrink-0 rounded-lg border border-[#25252d] p-1.5 text-[#8a8a95] active:scale-95">
                <IcX size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Input value={q} onChange={(e) => setQ(e.target.value)}
        placeholder={chosen.length ? "Додај уште (пр. Roomster)" : "Пребарај производ (пр. Fabia)"} />

      {q.trim() && (
        <div className="mt-2 max-h-[240px] space-y-1.5 overflow-y-auto">
          {candidates.length === 0 ? (
            <p className="rounded-xl border border-[#25252d] px-3.5 py-3 text-[12px] text-[#5a5a64]">
              Ништо не најдено за „{q.trim()}"
            </p>
          ) : candidates.map((p) => (
            <button key={p.id} type="button"
              onClick={() => { onChange([...value, p.id]); setQ(""); }}
              className="flex w-full items-center gap-2 rounded-xl border border-[#1f1f26] bg-[#0c0c0f] px-3.5 py-2.5 text-left transition active:scale-[.99]">
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-white">{p.title}</span>
              {p.sku && <span className="shrink-0 font-mono text-[10.5px] text-[#5a5a64]">{p.sku}</span>}
              <IcPlus size={13} className="shrink-0 text-[#e5454a]" />
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}
