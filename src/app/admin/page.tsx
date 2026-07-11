"use client";

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
  year: string;
  price: string;
  image: string;
  description: string;
  sku?: string;
};

const EMPTY_FORM = {
  title: "", brand: "", model: "", year: "",
  price: "", image: "", description: "", sku: "",
};

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": getPw() },
        body: fd,
      });
     if (res.ok) {
        const { path, originalKB, compressedKB, savedPercent } = await res.json();
        setForm((prev) => ({ ...prev, image: path }));
        showToast(`✓ ${originalKB}KB → ${compressedKB}KB (-${savedPercent}%)`);
  } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error ?? "Грешка при прикачување!", false);
      }
    } catch (err) {
      showToast(`Грешка: ${String(err)}`, false);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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
      title: p.title,
      brand: p.brand,
      model: p.model,
      year: p.year,
      price: p.price,
      image: p.image,
      description: p.description,
      sku: p.sku ?? "",
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
        body: JSON.stringify(form),
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

          {/* ЛИСТА */}
          <div>
            <h2 className="mb-6 text-xl font-black uppercase text-white">Производи</h2>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id}
                  className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition ${editId === p.id ? "border-red-600 bg-[#1a0808]" : "border-zinc-800 bg-[#111] hover:border-zinc-700"}`}
                >
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                    {p.image ? (
                      <Image src={p.image} alt={p.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon size={18} className="text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{p.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="text-xs text-zinc-500">{p.model} · {p.year}</p>
                      {p.sku && (
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-400">
                          {p.sku}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 font-bold text-red-500">{p.price}</span>
                  <button
                    onClick={() => editId === p.id ? cancelEdit() : handleEditClick(p)}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition ${editId === p.id ? "border-red-600 bg-red-600/20 text-red-400" : "border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400"}`}
                  >
                    {editId === p.id ? <X size={15} /> : <Pencil size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-700 text-zinc-500 transition hover:border-red-600 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {products.length === 0 && (
                <p className="py-10 text-center text-zinc-600">Нема производи.</p>
              )}
            </div>
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
              {/* Назив */}
              <div>
                <label className={labelClass}>Назив *</label>
                <input required value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="пр. Toyota Corolla Патосници"
                  className={inputClass}
                />
              </div>

              {/* Бренд */}
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

              {/* Модел */}
              <div>
                <label className={labelClass}>Модел *</label>
                <input required value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder="пр. Corolla E210"
                  className={inputClass}
                />
              </div>

              {/* Години */}
              <div>
                <label className={labelClass}>Години</label>
                <input value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  placeholder="пр. 2019 – 2023"
                  className={inputClass}
                />
              </div>

              {/* Цена */}
              <div>
                <label className={labelClass}>Цена *</label>
                <input required value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="пр. 2.490 ден"
                  className={inputClass}
                />
              </div>

              {/* ✅ SKU */}
              <div>
                <label className={labelClass}>SKU број</label>
                <input
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  placeholder="пр. PAT-BMW-003"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-zinc-600">
                  Интерен код за идентификација на производот
                </p>
              </div>

              {/* Слика */}
              <div>
                <label className={labelClass}>Слика на производот</label>
                <label className={`group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 bg-[#151515] py-7 text-sm text-zinc-400 transition hover:border-red-600 hover:text-white ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileUpload} disabled={uploading} className="hidden"
                  />
                  {uploading ? (
                    <><Loader2 size={20} className="animate-spin text-red-500" /><span>Прикачување...</span></>
                  ) : (
                    <><Upload size={20} className="text-zinc-500 group-hover:text-red-500 transition" /><span>Кликни за прикачување слика</span></>
                  )}
                </label>
                <p className="mt-2 text-center text-xs text-zinc-600">JPG, PNG, WebP · max 5MB</p>
                <div className="my-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <span className="text-xs text-zinc-600">или рачно</span>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
                <input value={form.image}
                  onChange={(e) => update("image", e.target.value)}
                  placeholder="/images/products/naziv.webp"
                  className={inputClass}
                />
                {form.image ? (
                  <div className="relative mt-3 h-36 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                    <Image src={form.image} alt="preview" fill className="object-cover" />
                    <button type="button" onClick={() => update("image", "")}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex h-36 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <div className="text-center text-zinc-600">
                      <ImageIcon size={26} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs">Нема слика</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Опис */}
              <div>
                <label className={labelClass}>Опис</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Краток опис на производот..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Submit */}
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