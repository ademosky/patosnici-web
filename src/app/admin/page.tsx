"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { brands } from "../data/brands";
import {
  Lock, Plus, Trash2, LogOut, Package,
  CheckCircle, AlertCircle, Loader2, Pencil,
  X, Upload, ImageIcon,
} from "lucide-react";

type Product = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  model: string;
  car_model: string;
  year: string;
  price: string;
  image: string;
  description: string;
  sku?: string;
  images?: string[];
  car_model?: string;
  in_stock?: boolean;
};

const EMPTY_FORM = {
  title: "", brand: "", car_model: "", model: "", year: "",
  price: "", image: "", description: "", description_sq: "", sku: "", images: [] as string[], in_stock: true,
};

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const MAX_W = 1200;
      const MAX_H = 1600;

      // Scale down to fit within 1200x1600 keeping aspect ratio
      let w = img.width;
      let h = img.height;

      if (w > MAX_W || h > MAX_H) {
        const ratioW = MAX_W / w;
        const ratioH = MAX_H / h;
        const ratio  = Math.min(ratioW, ratioH);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, w, h);

      // WebP at 82% quality — targets ~200–300KB for typical product photos
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/webp",
        0.82
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}


export default function AdminPage() {
  const [password, setPassword]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authError, setAuthError] = useState("");
  const [products, setProducts]   = useState<Product[]>([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [listSearch, setListSearch] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Record<string,boolean>>({});
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersMonth, setOrdersMonth] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const getPw = () =>
    typeof window !== "undefined" ? sessionStorage.getItem("adminPw") ?? "" : "";

  const fetchProducts = useCallback(async (pw: string) => {
    const res = await fetch("/api/admin/products", {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) setProducts(await res.json());
  }, []);

  useEffect(() => {
    const pw = getPw();
    if (pw) { setAuthed(true); fetchProducts(pw); }
  }, [fetchProducts]);

  const fetchOrders = async (month = ordersMonth, status = ordersStatus) => {
    const pw = getPw();
    if (!pw) return;
    setOrdersLoading(true);
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/orders?${params}`, {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) setOrders(await res.json());
    setOrdersLoading(false);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": getPw() },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchOrders();
  };

  // ── UPLOAD — компресија во браузер + директно кон Supabase ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Detect extension and content type
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = file.name
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9-]/g, "-")
        .slice(0, 40) || "slika";

      let uploadBlob: Blob = file;
      let filename = `${safeName}-${Date.now()}.${ext}`;
      let contentType = file.type || `image/${ext}`;
      const originalKB = Math.round(file.size / 1024);
      let finalKB = originalKB;
      let savedPct = 0;

      // Always compress to WebP (smaller result wins)
      const compressed = await compressImage(file);
      if (compressed.size < file.size) {
        uploadBlob = compressed;
        filename = `${safeName}-${Date.now()}.webp`;
        contentType = "image/webp";
        finalKB = Math.round(compressed.size / 1024);
        savedPct = Math.round((1 - compressed.size / file.size) * 100);
      }

      // Upload to Supabase Storage
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const arrayBuffer = await uploadBlob.arrayBuffer();
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/products/${filename}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": contentType,
            "x-upsert": "false",
          },
          body: arrayBuffer,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(errText || uploadRes.statusText);
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
      addImage(publicUrl);

      showToast(
        savedPct > 0
          ? `Прикачено: ${originalKB}KB → ${finalKB}KB (-${savedPct}%)`
          : `Прикачено: ${finalKB}KB`
      );

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Upload грешка: ${msg}`, false);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

    const toggleBrand = (brand: string) =>
    setExpandedBrands((prev) => ({ ...prev, [brand]: !prev[brand] }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/products", {
      headers: { "x-admin-password": password },
    });
    setLoading(false);
    if (res.ok) {
      sessionStorage.setItem("adminPw", password);
      setAuthed(true);
      setProducts(await res.json());
    } else {
      setAuthError("Погрешна лозинка!");
    }
  };

  const handleEditClick = (p: Product) => {
    setEditId(p.id);
    setForm({
      title: p.title, brand: p.brand, car_model: p.car_model ?? "", model: p.model,
      year: p.year, price: p.price, image: p.image,
      description: p.description, sku: p.sku ?? "",
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      in_stock: p.in_stock !== false,
      description_sq: p.description_sq ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditId(null); setForm(EMPTY_FORM); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw     = getPw();
    const isEdit = editId !== null;
    setLoading(true);
    const res = await fetch(
      isEdit ? `/api/admin/products/${editId}` : "/api/admin/products",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify({
          ...form,
          images: form.images || [],
        }),
      },
    );
    setLoading(false);
    if (res.ok) {
      showToast(isEdit ? "Ажурирано! ✓" : "Производот е додаден! ✓");
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchProducts(pw);
    } else {
      showToast("Грешка — обиди се пак.", false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Избриши "${title}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getPw() },
    });
    if (res.ok) {
      showToast("Избришан.");
      if (editId === id) cancelEdit();
      fetchProducts(getPw());
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPw");
    setAuthed(false);
    setPassword("");
  };

  const update = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const addImage = (url: string) =>
    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
      image: prev.image || url,
    }));

  const removeImage = (idx: number) =>
    setForm((prev) => {
      const imgs = (prev.images || []).filter((_, i) => i !== idx);
      return { ...prev, images: imgs, image: imgs[0] || "" };
    });

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600";
  const labelClass =
    "mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400";

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-[#111]">
              <Lock size={28} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-black uppercase text-white">Admin Панел</h1>
            <p className="mt-2 text-sm text-zinc-500">Original Patosnici</p>
          </div>
          <form onSubmit={handleLogin} className="rounded-2xl border border-zinc-800 bg-[#111] p-7">
            <label className={labelClass}>Лозинка</label>
            <input type="password" value={password} autoFocus required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Внеси ја лозинката..."
              className={inputClass}
            />
            {authError && <p className="mt-3 text-sm text-red-500">{authError}</p>}
            <button type="submit" disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Влез
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b]">

      {toast && (
        <div className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${toast.ok ? "bg-green-700" : "bg-red-700"}`}>
          {toast.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-red-600" />
            <span className="font-black uppercase tracking-wide text-white">Admin Панел</span>
            <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs text-zinc-400">
              {products.length} производи
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="hidden items-center overflow-hidden rounded-xl border border-zinc-700 sm:flex">
              <button onClick={() => setActiveTab("products")}
                className={`px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "products" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                <Package size={13} className="mr-1 inline" /> Производи
              </button>
              <button onClick={() => { setActiveTab("orders"); fetchOrders(); }}
                className={`px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "orders" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                <ShoppingCart size={13} className="mr-1 inline" /> Нарачки
                {orders.filter(o => o.status === "new").length > 0 && (
                  <span className="ml-1 rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] text-black font-bold">
                    {orders.filter(o => o.status === "new").length}
                  </span>
                )}
              </button>
            </div>
            <Link href="/" className="text-sm text-zinc-400 transition hover:text-white">
              ← Кон сајтот
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-red-600 hover:text-white"
            >
              <LogOut size={14} /> Излез
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">

          {/* ЛИСТА — групирана по бренд */}
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black uppercase text-white">
                Производи <span className="text-base font-normal text-zinc-500">({products.length})</span>
              </h2>
              <input
                type="text"
                placeholder="Пребарај..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="w-36 rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2 text-sm text-white outline-none transition focus:border-red-600"
              />
            </div>

            {products.length === 0 && (
              <p className="py-10 text-center text-zinc-600">Нема производи.</p>
            )}

            {Object.entries(
              products
                .filter((p) =>
                  !listSearch ||
                  p.title.toLowerCase().includes(listSearch.toLowerCase()) ||
                  p.brand.toLowerCase().includes(listSearch.toLowerCase()) ||
                  (p.car_model || "").toLowerCase().includes(listSearch.toLowerCase())
                )
                .reduce((acc: Record<string, typeof products>, p) => {
                  const key = p.brand || "other";
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(p);
                  return acc;
                }, {})
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([brand, brandProducts]) => (
                <div key={brand} className="mb-6">
                  {/* Collapsible brand header */}
                  <button
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className="mb-2 flex w-full items-center gap-3 text-left"
                  >
                    <div className="h-px flex-1 bg-zinc-800" />
                    <span className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-700">
                      {brand}
                      <span className="text-zinc-500">({brandProducts.length})</span>
                      <span className="ml-1 text-zinc-600">{expandedBrands[brand] ? "▲" : "▼"}</span>
                    </span>
                    <div className="h-px flex-1 bg-zinc-800" />
                  </button>
                  {expandedBrands[brand] && (
                  <div className="space-y-2">
                    {brandProducts.map((p) => (
                      <div key={p.id}
                        className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition ${editId === p.id ? "border-red-600 bg-[#1a0808]" : "border-zinc-800 bg-[#111] hover:border-zinc-700"}`}
                      >
                        <div className="relative flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900" style={{width:"72px",height:"56px"}}>
                          {p.image ? (
                            <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon size={16} className="text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{p.title}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="text-xs text-zinc-500">
                              {p.car_model && <span className="text-zinc-400">{p.car_model} · </span>}
                              {p.model} · {p.year}
                            </p>
                            {p.sku && (
                              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-400">{p.sku}</span>
                            )}
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-sm font-bold text-red-500">{p.price}</span>
                        <button onClick={() => editId === p.id ? cancelEdit() : handleEditClick(p)}
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition ${editId === p.id ? "border-red-600 bg-red-600/20 text-red-400" : "border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400"}`}
                        >
                          {editId === p.id ? <X size={15} /> : <Pencil size={15} />}
                        </button>
                        <button onClick={() => handleDelete(p.id, p.title)}
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-700 text-zinc-500 transition hover:border-red-600 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              ))}
          </div>

          {/* ФОРМА */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase text-white">
                {editId !== null ? "Едитувај производ" : "Додај нов производ"}
              </h2>
              {editId !== null && (
                <button onClick={cancelEdit}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-red-600 hover:text-white"
                >
                  <X size={12} /> Откажи
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}
              className={`space-y-4 rounded-2xl border bg-[#111] p-6 ${editId !== null ? "border-blue-800/50" : "border-zinc-800"}`}
            >
              <div>
                <label className={labelClass}>Назив *</label>
                <input required value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="пр. Toyota Corolla Патосници"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Бренд *</label>
                <select required value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Избери бренд —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              {/* Car Model */}
              <div>
                  <label className={labelClass}>Модел на возило *</label>
                  <input required value={form.car_model}
                    onChange={(e) => update("car_model", e.target.value)}
                          placeholder="пр. A3, Golf, Seria 3, C-Klasse"
                        className={inputClass}
                        />
                    <p className="mt-1 text-xs text-zinc-600">
                  Само основниот модел — без варијанта
                  </p>
                    </div>

              <div>
                <label className={labelClass}>Модел *</label>
                <input required value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder="пр. Corolla E210"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Години</label>
                <input value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  placeholder="пр. 2019 – 2023"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Цена *</label>
                <input required value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="пр. 2.490 ден"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>SKU број</label>
                <input value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  placeholder="пр. PAT-BMW-003"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-zinc-600">Интерен код за идентификација</p>
              </div>

              {/* СЛИКИ — повеќе слики */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelClass}>
                    Слики ({(form.images || []).length} прикачени)
                  </label>
                </div>

                <label className={`group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 bg-[#151515] py-6 text-sm text-zinc-400 transition hover:border-red-600 hover:text-white ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic"
                    onChange={handleFileUpload} disabled={uploading} className="hidden"
                  />
                  {uploading ? (
                    <><Loader2 size={18} className="animate-spin text-red-500" /><span>Прикачување...</span></>
                  ) : (
                    <><Upload size={18} className="text-zinc-500 group-hover:text-red-500 transition" />
                    <span>+ Додај слика {(form.images || []).length > 0 ? `(${(form.images || []).length} додадени)` : ""}</span></>
                  )}
                </label>
                <p className="mt-1.5 text-center text-xs text-zinc-600">
                  JPG, PNG, WebP · Автоматски компресира · Прва слика = главна
                </p>

                {(form.images || []).length > 0 ? (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {(form.images || []).map((img, idx) => (
                      <div key={idx} className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900" style={{height:"90px"}}>
                        <Image src={img} alt={`slika ${idx+1}`} fill className="object-cover" unoptimized />
                        {idx === 0 && (
                          <div className="absolute left-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            ГЛАВНА
                          </div>
                        )}
                        <button type="button" onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex h-20 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <div className="text-center text-zinc-600">
                      <ImageIcon size={20} className="mx-auto mb-1 opacity-40" />
                      <p className="text-xs">Нема слики</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Опис{" "}
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">МКД</span>
                </label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Краток опис на производот..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Опис{" "}
                  <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-xs text-red-400">SHQ — Shqip</span>
                </label>
                <textarea rows={3} value={form.description_sq}
                  onChange={(e) => update("description_sq", e.target.value)}
                  placeholder="Përshkrim i shkurtër i produktit... (Albanski)"
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Залиха */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-700 bg-[#1a1a1a] px-5 py-4 transition hover:border-zinc-600">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {form.in_stock ? "Има залиха" : "Нема залиха"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {form.in_stock ? "Производот е достапен" : "Ke se prikaze badge Nema zaliha"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.in_stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, in_stock: e.target.checked }))}
                  className="h-5 w-5 accent-red-600 cursor-pointer"
                />
              </label>

              <button type="submit" disabled={loading || uploading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold uppercase tracking-wide text-white transition disabled:opacity-60 ${editId !== null ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> :
                  editId !== null ? <Pencil size={16} /> : <Plus size={16} />}
                {editId !== null ? "Ажурирај производ" : "Додај производ"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}