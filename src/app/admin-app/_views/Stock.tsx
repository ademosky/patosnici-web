"use client";

/**
 * Stock — warehouse counts and the storefront showcase gallery.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { InvItem, Product, ShowcaseItem, prettyDate, toCsv, download, cx } from "../_lib/core";
import { useAdmin } from "../_lib/store";
import {
  Card, SectionTitle, Stat, Pill, Btn, IconBtn, Sheet, Field, Input,
  Segmented, Empty, IcSpinner, IcSearch, IcX, IcPlus, IcMinus, IcPencil,
  IcTrash, IcLayers, IcImage, IcUpload, IcUp, IcDown, IcAlert,
} from "../_ui/kit";

export function StockView({ initialTab = "inv" }: { initialTab?: "inv" | "gal" }) {
  const {
    inventory, showcase, products, loading,
    addInventory, patchInventory, removeInventory,
    addShowcase, patchShowcase, removeShowcase, moveShowcase, toast,
  } = useAdmin();

  const [tab, setTab] = useState<"inv" | "gal">(initialTab);

  return (
    <div className="space-y-4">
      <Segmented value={tab} onChange={setTab}
        options={[{ v: "inv" as const, label: "Залиха" }, { v: "gal" as const, label: "Галерија" }]} />
      {tab === "inv"
        ? <InventoryPanel {...{ inventory, products, loading, addInventory, patchInventory, removeInventory, toast }} />
        : <ShowcasePanel {...{ showcase, loading, addShowcase, patchShowcase, removeShowcase, moveShowcase, toast }} />}
    </div>
  );
}

/* ── inventory ─────────────────────────────────────────────────────── */

function InventoryPanel({ inventory, products, loading, addInventory, patchInventory, removeInventory, toast }: any) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", quantity: "1" });
  const [skuMatch, setSkuMatch] = useState<null | { title: string; sku: string } | "none">(null);

  /**
   * Look the typed SKU up in the catalog and fill the name automatically —
   * the same behaviour as the classic panel, so stock entries stay consistent.
   */
  const lookupSku = (sku: string) => {
    const needle = sku.trim().toLowerCase();
    if (!needle) { setSkuMatch(null); return; }
    const found = (products as Product[]).find((p) => (p.sku ?? "").trim().toLowerCase() === needle);
    if (found) {
      setSkuMatch({ title: found.title, sku: found.sku ?? "" });
      setForm((f) => ({ ...f, name: found.title }));
    } else {
      setSkuMatch("none");
    }
  };

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return !n ? inventory : inventory.filter((i: InvItem) =>
      `${i.name} ${i.sku}`.toLowerCase().includes(n));
  }, [inventory, q]);

  const totalUnits = useMemo(
    () => inventory.reduce((s: number, i: InvItem) => s + (i.quantity || 0), 0), [inventory]);
  const lowCount = useMemo(
    () => inventory.filter((i: InvItem) => i.quantity <= 2).length, [inventory]);

  const save = async () => {
    if (!form.sku.trim() || !form.name.trim()) { toast("SKU и име се задолжителни", false); return; }
    setSaving(true);
    const ok = await addInventory(form);
    setSaving(false);
    if (ok) { setOpen(false); setForm({ sku: "", name: "", quantity: "1" }); setSkuMatch(null); }
  };

  const closeSheet = () => { setOpen(false); setSkuMatch(null); };

  const step = (item: InvItem, delta: number) => {
    const next = Math.max(0, (item.quantity || 0) + delta);
    if (next !== item.quantity) patchInventory(item.id, { quantity: next });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Ставки" value={inventory.length} icon={<IcLayers size={13} />} />
        <Stat label="Вкупно" value={totalUnits} tone="info" sub="парчиња" />
        <Stat label="Ниско" value={lowCount} tone={lowCount ? "red" : "default"} icon={<IcAlert size={13} />} />
      </div>

      <Card className="space-y-3 p-3.5">
        <div className="relative">
          <IcSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4e4e58]" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пребарај по SKU или име…" className="pl-9" />
          {q && <button onClick={() => setQ("")} aria-label="Исчисти" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5a5a64]"><IcX size={15} /></button>}
        </div>
        <Btn className="w-full" onClick={() => setOpen(true)}><IcPlus size={16} /> Додај ставка</Btn>
      </Card>

      {loading && !inventory.length ? (
        <div className="flex justify-center py-20 text-[#d72026]"><IcSpinner size={26} /></div>
      ) : filtered.length === 0 ? (
        <Card><Empty icon={<IcLayers size={34} />} title="Нема ставки"
          sub={q ? "Нема резултати за пребарувањето." : "Евидентирај ја состојбата на лагерот."} /></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((i: InvItem) => (
            <Card key={i.id} className={cx("p-3", i.quantity <= 2 && "border-[#4a1d21]")}>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-white">{i.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md bg-[#16161b] px-1.5 py-0.5 font-mono text-[10.5px] text-[#8a8a95]">{i.sku}</span>
                    {i.quantity <= 2 && <Pill tone="red">ниско</Pill>}
                    <span className="text-[10px] text-[#4e4e58]">{prettyDate(i.created_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn label="Намали" size={34} onClick={() => step(i, -1)}><IcMinus size={14} /></IconBtn>
                  <span className="w-9 text-center font-heading text-[19px] font-bold tabular-nums text-white">{i.quantity}</span>
                  <IconBtn label="Зголеми" size={34} onClick={() => step(i, 1)}><IcPlus size={14} /></IconBtn>
                </div>
                <IconBtn label="Избриши" size={34} tone="red"
                  onClick={() => { if (confirm(`Избриши „${i.name}“?`)) removeInventory(i.id); }}>
                  <IcTrash size={14} />
                </IconBtn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onClose={closeSheet} title="Нова ставка"
        footer={<Btn className="w-full" size="lg" loading={saving} onClick={save}>Додај</Btn>}>
        <div className="space-y-3">
          <Field label="SKU *" hint="Внеси SKU — името се пополнува автоматски">
            <Input
              value={form.sku}
              onChange={(e) => { setForm({ ...form, sku: e.target.value }); lookupSku(e.target.value); }}
              placeholder="444805"
              inputMode="numeric"
              autoFocus
            />
          </Field>

          {skuMatch === "none" && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#5c2024] bg-[#240f11] px-3.5 py-3">
              <IcAlert size={16} className="shrink-0 text-[#e5454a]" />
              <span className="text-[12.5px] font-semibold text-[#f0a2a5]">
                Производот со овој SKU не е пронајден
              </span>
            </div>
          )}
          {skuMatch && skuMatch !== "none" && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#2c5c43] bg-[#12241a] px-3.5 py-3">
              <IcCheck size={16} className="shrink-0 text-[#5fc48f]" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[#8fe0b2]">{skuMatch.title}</span>
              <span className="shrink-0 font-mono text-[10.5px] text-[#5a5a64]">{skuMatch.sku}</span>
            </div>
          )}

          <Field label="Име *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VW Golf 5 — гумени" /></Field>
          <Field label="Количина"><Input type="number" inputMode="numeric" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
        </div>
      </Sheet>
    </div>
  );
}

/* ── showcase ──────────────────────────────────────────────────────── */

function ShowcasePanel({ showcase, addShowcase, patchShowcase, removeShowcase, moveShowcase, toast }: any) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ image: "", brand: "", model: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setEditId(null); setForm({ image: "", brand: "", model: "" }); }
  }, [open]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const pw = localStorage.getItem("adminPw") ?? sessionStorage.getItem("adminPw") ?? "";
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": pw }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setForm((f) => ({ ...f, image: data.path }));
      toast("Сликата е прикачена");
    } catch { toast("Грешка при прикачување", false); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async () => {
    if (!form.image || !form.brand || !form.model) { toast("Сите полиња се задолжителни", false); return; }
    setSaving(true);
    const ok = editId ? await patchShowcase(editId, form) : await addShowcase(form);
    setSaving(false);
    if (ok) setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-3.5">
        <p className="text-[12px] leading-relaxed text-[#7c7c88]">
          Овие слики се прикажуваат во галеријата на почетната страна. Редоследот е важен — првата е највисоко.
        </p>
        <Btn className="mt-3 w-full" onClick={() => setOpen(true)}><IcPlus size={16} /> Додај во галерија</Btn>
      </Card>

      {showcase.length === 0 ? (
        <Card><Empty icon={<IcImage size={34} />} title="Галеријата е празна" sub="Додај слики што ќе се прикажат на почетната." /></Card>
      ) : (
        <div className="space-y-2">
          {showcase.map((s: ShowcaseItem, idx: number) => (
            <Card key={s.id} className="flex items-center gap-3 p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" className="h-[52px] w-[68px] shrink-0 rounded-lg object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-white">{s.brand}</p>
                <p className="truncate text-[11.5px] text-[#6c6c78]">{s.model}</p>
                <p className="mt-0.5 text-[10px] text-[#4e4e58]">позиција {idx + 1}</p>
              </div>
              <div className="flex flex-col gap-1">
                <IconBtn label="Погоре" size={30} onClick={() => moveShowcase(s.id, -1)}><IcUp size={13} /></IconBtn>
                <IconBtn label="Подолу" size={30} onClick={() => moveShowcase(s.id, 1)}><IcDown size={13} /></IconBtn>
              </div>
              <IconBtn label="Уреди" size={34} onClick={() => { setEditId(s.id); setForm({ image: s.image, brand: s.brand, model: s.model }); setOpen(true); }}>
                <IcPencil size={14} />
              </IconBtn>
              <IconBtn label="Избриши" size={34} tone="red"
                onClick={() => { if (confirm(`Избриши „${s.brand} ${s.model}“?`)) removeShowcase(s.id); }}>
                <IcTrash size={14} />
              </IconBtn>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={editId ? "Уреди ставка" : "Нова ставка"}
        footer={<Btn className="w-full" size="lg" loading={saving} onClick={save}>Зачувај</Btn>}>
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Слика *</p>
            {form.image ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="" className="h-[110px] w-[150px] rounded-xl border border-[#25252d] object-cover" />
                <button onClick={() => setForm((f) => ({ ...f, image: "" }))} aria-label="Отстрани"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#d72026] text-white"><IcX size={12} /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex h-[110px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#2f2f38] text-[#6c6c78]">
                {uploading ? <IcSpinner size={20} /> : <IcUpload size={20} />}
                <span className="text-[11.5px]">Прикачи слика</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          </div>
          <Field label="Бренд *"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Audi" /></Field>
          <Field label="Модел *"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="A3" /></Field>
        </div>
      </Sheet>
    </div>
  );
}
