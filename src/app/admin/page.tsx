"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { brands } from "../data/brands";
import { getEurValue } from "@/lib/pricing";
import {
  Lock, Plus, Trash2, LogOut, Package, ShoppingCart, Warehouse,
  CheckCircle, AlertCircle, Loader2, Pencil,
  X, Upload, ImageIcon, Phone, Mail as MailIcon, Clock, Minus, Download,
  ChevronUp, ChevronDown,
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

type Order = {
  id: number;
  name: string;
  surname: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  items?: Array<{ title: string; price: string; quantity: number; sku?: string; price_eur?: string }>;
  product_title?: string;
  product_price?: string;
  product_sku?: string;
  status: "new" | "in_process" | "sent";
  created_at: string;
  note?: string;
  source?: string;
  currency?: string;
};

// Convert an ISO timestamp to the user's local calendar date (Europe/Skopje).
// created_at is stored as UTC (+00:00); slicing the string gives the UTC date,
// which is off by one day for evening orders. This returns the true local date.
function skopjeDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

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
  const [rememberMe, setRememberMe] = useState(true);
  const [authed, setAuthed]       = useState(false);
  const [authError, setAuthError] = useState("");
  const [products, setProducts]   = useState<Product[]>([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [listSearch, setListSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "out_of_stock">("all");
  const [expandedBrands, setExpandedBrands] = useState<Record<string,boolean>>({});
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "inventory" | "showcase">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersMonth, setOrdersMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [ordersStatus, setOrdersStatus] = useState("");
  const [ordersDay, setOrdersDay] = useState("");
  const [ordersCurrency, setOrdersCurrency] = useState("");

  // Orders filtered by day + currency. Status and search are applied on top
  // of this in the list; the status counters + summary card use this so they
  // always reflect only the selected day/currency, not the whole month.
  const dayFilteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (ordersDay && (!order.created_at || skopjeDate(order.created_at) !== ordersDay)) return false;
      if (ordersCurrency) {
        const cur = order.currency || "MKD";
        if (cur !== ordersCurrency) return false;
      }
      return true;
    });
  }, [orders, ordersDay, ordersCurrency]);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "", surname: "", address: "", city: "", phone: "", email: "",
    sku: "", product_title: "", product_price: "", product_sku: "",
    note: "", source: "facebook",
  });
  const [manualSkuFound, setManualSkuFound] = useState<null | { title: string; price: string; sku: string }>(null);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState("");

  // ── Залиха state ──
  type InvItem = { id: number; sku: string; name: string; quantity: number; created_at: string };
  const [inventory, setInventory]       = useState<InvItem[]>([]);
  const [invLoading, setInvLoading]     = useState(false);
  const [invForm, setInvForm]           = useState({ sku: "", name: "", quantity: "1" });
  const [invSkuResult, setInvSkuResult] = useState<null | { found: boolean; title?: string; sku?: string }>(null);
  const [invError, setInvError]         = useState("");
  const [invAdding, setInvAdding]       = useState(false);
  const [invSearch, setInvSearch]       = useState("");
  const [showcaseItems, setShowcaseItems] = useState<Array<{ id: number; image: string; brand: string; model: string; sort_order: number }>>([]);
  const [showcaseForm, setShowcaseForm]   = useState<{ image: string; brand: string; model: string }>({ image: "", brand: "", model: "" });
  const [showcaseEditId, setShowcaseEditId] = useState<number | null>(null);
  const [showcaseLoading, setShowcaseLoading] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Auto-expand brands that have out-of-stock products when filter is active
  useEffect(() => {
    if (stockFilter === "out_of_stock") {
      const expand: Record<string, boolean> = {};
      products.filter((p) => p.in_stock === false).forEach((p) => {
        if (p.brand) expand[p.brand] = true;
      });
      setExpandedBrands((prev) => ({ ...prev, ...expand }));
    }
  }, [stockFilter, products]);

  const getPw = () =>
    typeof window !== "undefined" ? (localStorage.getItem("adminPw") ?? sessionStorage.getItem("adminPw") ?? "") : "";

  const fetchProducts = useCallback(async (pw: string) => {
    const res = await fetch("/api/admin/products", {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) setProducts(await res.json());
  }, []);

  useEffect(() => {
    const pw = getPw();
    if (pw) {
      setAuthed(true);
      fetchProducts(pw);
      fetchOrders();
      fetchInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts]);

  const fetchOrders = async (month = ordersMonth) => {
    const pw = getPw();
    if (!pw) return;
    setOrdersLoading(true);
    const params = new URLSearchParams();
    if (month) params.set("month", month);
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

  const openEditOrder = (order: Order) => {
    setEditingOrder({ ...order, items: order.items ? order.items.map((i) => ({ ...i })) : undefined });
  };

  const closeEditOrder = () => setEditingOrder(null);

  const updateEditingItem = (idx: number, key: string, value: string | number) => {
    setEditingOrder((prev) => {
      if (!prev || !prev.items) return prev;
      const items = prev.items.map((it, i) => (i === idx ? { ...it, [key]: value } : it));
      return { ...prev, items };
    });
  };

  const saveOrderEdit = async () => {
    if (!editingOrder) return;
    setEditSaving(true);
    const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": getPw() },
      body: JSON.stringify(editingOrder),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setEditingOrder(null);
      showToast("Нарачката е ажурирана", true);
    } else {
      showToast("Грешка при ажурирање", false);
    }
    setEditSaving(false);
  };

  const exportOrders = async () => {
    const pw = getPw();
    if (!pw) return;
    const params = new URLSearchParams();
    if (ordersMonth) params.set("month", ordersMonth);
    try {
      const res = await fetch(`/api/admin/orders/export?${params}`, {
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) {
        showToast("Грешка при експорт", false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `naracki-${ordersMonth || "site"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Експортот е подготвен", true);
    } catch {
      showToast("Грешка при експорт", false);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Сигурно сакаш да ја избришеш оваа нарачка?")) return;
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getPw() },
    });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setToast({ msg: "Нарачката е избришана", ok: true });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ── MANUAL ORDER functions ──────────────────────────────────────────
  const lookupSku = (sku: string) => {
    const found = products.find(
      (p) => p.sku && p.sku.toLowerCase() === sku.toLowerCase()
    );
    if (found) {
      setManualSkuFound({ title: found.title, price: found.price, sku: found.sku || "" });
      setManualForm((p) => ({
        ...p, product_title: found.title, product_price: found.price, product_sku: found.sku || "",
      }));
    } else {
      setManualSkuFound(null);
    }
  };

  const saveManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(""); setManualSaving(true);
    const pw = getPw();
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify(manualForm),
    });
    if (res.ok) {
      const newOrder = await res.json();
      setOrders((prev) => [newOrder, ...prev]);
      setManualForm({ name: "", surname: "", address: "", city: "", phone: "", email: "",
        sku: "", product_title: "", product_price: "", product_sku: "", note: "", source: "facebook" });
      setManualSkuFound(null);
      setShowManualForm(false);
      showToast("Нарачката е зачувана!", true);
    } else {
      const d = await res.json();
      setManualError(d.error || "Грешка при зачувување");
    }
    setManualSaving(false);
  };

  // ── ЗАЛИХА functions ──────────────────────────────────────────────
  const fetchInventory = async () => {
    const pw = getPw(); if (!pw) return;
    setInvLoading(true);
    const res = await fetch("/api/admin/inventory", { headers: { "x-admin-password": pw } });
    if (res.ok) setInventory(await res.json());
    setInvLoading(false);
  };

  const fetchShowcase = async () => {
    const pw = getPw();
    if (!pw) return;
    setShowcaseLoading(true);
    const res = await fetch("/api/admin/showcase", { headers: { "x-admin-password": pw } });
    if (res.ok) setShowcaseItems(await res.json());
    setShowcaseLoading(false);
  };

  const addInvItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvError(""); setInvAdding(true);
    const pw = getPw();
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ sku: invForm.sku, name: invForm.name, quantity: parseInt(invForm.quantity) || 1 }),
    });
    if (res.ok) {
      const item = await res.json();
      setInventory((prev) => [item, ...prev]);
      setInvForm({ sku: "", name: "", quantity: "1" });
    } else {
      const d = await res.json();
      setInvError(d.error || "Грешка");
    }
    setInvAdding(false);
  };

  // Auto-search product by SKU as the admin types
  const lookupInvSku = (sku: string) => {
    const s = sku.trim().toLowerCase();
    if (!s) {
      setInvSkuResult(null);
      return;
    }
    const found = products.find(
      (p) => p.sku && p.sku.toLowerCase() === s
    );
    if (found) {
      setInvSkuResult({ found: true, title: found.title, sku: found.sku });
      // Auto-fill name field with the product title
      setInvForm((prev) => ({ ...prev, name: found.title }));
    } else {
      setInvSkuResult({ found: false });
    }
  };

  const deleteInvItem = async (id: number) => {
    if (!confirm("Избриши ја оваа ставка?")) return;
    const pw = getPw();
    const res = await fetch(`/api/admin/inventory/${id}`, {
      method: "DELETE", headers: { "x-admin-password": pw },
    });
    if (res.ok) setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const updateInvQty = async (id: number, qty: number) => {
    if (qty < 0) return;
    const pw = getPw();
    const res = await fetch(`/api/admin/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ quantity: qty }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInventory((prev) => prev.map((i) => i.id === id ? updated : i));
    }
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
      if (rememberMe) {
        localStorage.setItem("adminPw", password);
      } else {
        sessionStorage.setItem("adminPw", password);
      }
      setAuthed(true);
      setProducts(await res.json());
      fetchOrders();
      fetchInventory();
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

  const handleMoveProduct = async (id: number, direction: "up" | "down") => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === products.length - 1) return;
    const newOrder = [...products];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    const pw = getPw();
    await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ orderedIds: newOrder.map((p) => p.id) }),
    });
    fetchProducts(pw);
  };

  const handleShowcaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowcaseLoading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = file.name
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9-]/g, "-")
        .slice(0, 40) || "slika";
      let uploadBlob: Blob = file;
      let filename = `${safeName}-${Date.now()}.${ext}`;
      let contentType = file.type || `image/${ext}`;
      const compressed = await compressImage(file);
      if (compressed.size < file.size) {
        uploadBlob = compressed;
        filename = `${safeName}-${Date.now()}.webp`;
        contentType = "image/webp";
      }
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
      if (uploadRes.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
        setShowcaseForm((p) => ({ ...p, image: publicUrl }));
      }
    } catch (err) {
      console.error("Showcase upload error:", err);
    }
    setShowcaseLoading(false);
  };

  const handleShowcaseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw = getPw();
    const isEdit = showcaseEditId !== null;
    setShowcaseLoading(true);
    const res = await fetch(
      isEdit ? `/api/admin/showcase/${showcaseEditId}` : "/api/admin/showcase",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify(showcaseForm),
      }
    );
    if (res.ok) {
      setShowcaseForm({ image: "", brand: "", model: "" });
      setShowcaseEditId(null);
      fetchShowcase();
    }
    setShowcaseLoading(false);
  };

  const handleShowcaseEdit = (item: { id: number; image: string; brand: string; model: string }) => {
    setShowcaseEditId(item.id);
    setShowcaseForm({ image: item.image, brand: item.brand, model: item.model });
  };

  const handleShowcaseDelete = async (id: number) => {
    if (!confirm("Избриши ставка?")) return;
    const pw = getPw();
    await fetch(`/api/admin/showcase/${id}`, { method: "DELETE", headers: { "x-admin-password": pw } });
    if (showcaseEditId === id) { setShowcaseEditId(null); setShowcaseForm({ image: "", brand: "", model: "" }); }
    fetchShowcase();
  };

  const handleShowcaseMoveUp = async (id: number) => {
    const idx = showcaseItems.findIndex((item) => item.id === id);
    if (idx <= 0) return;
    const newOrder = [...showcaseItems];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    const pw = getPw();
    await fetch("/api/admin/showcase/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ orderedIds: newOrder.map((item) => item.id) }),
    });
    fetchShowcase();
  };

  const handleShowcaseMoveDown = async (id: number) => {
    const idx = showcaseItems.findIndex((item) => item.id === id);
    if (idx < 0 || idx >= showcaseItems.length - 1) return;
    const newOrder = [...showcaseItems];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    const pw = getPw();
    await fetch("/api/admin/showcase/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ orderedIds: newOrder.map((item) => item.id) }),
    });
    fetchShowcase();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminPw");
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

  // Make a specific image the main one (move to front + set as image)
  const setMainImage = (idx: number) =>
    setForm((prev) => {
      const imgs = [...(prev.images || [])];
      if (idx <= 0 || idx >= imgs.length) return prev;
      const [chosen] = imgs.splice(idx, 1);
      imgs.unshift(chosen);
      return { ...prev, images: imgs, image: chosen };
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
          <form onSubmit={handleLogin} className="rounded-2xl border border-zinc-800 bg-[#111] p-5 sm:p-7">
            <label className={labelClass}>Лозинка</label>
            <input type="password" value={password} autoFocus required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Внеси ја лозинката..."
              className={inputClass}
            />
            {authError && <p className="mt-3 text-sm text-red-500">{authError}</p>}
            <label className="mt-4 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-zinc-400">Запомни ме</span>
            </label>
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
        <div className={`fixed right-2 left-2 sm:right-4 sm:left-auto top-3 sm:top-4 z-50 flex items-center justify-center sm:justify-start gap-3 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-lg ${toast.ok ? "bg-green-700" : "bg-red-700"}`}>
          {toast.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/90 backdrop-blur">
        {/* Main row */}
        <div className="mx-auto flex h-12 sm:h-16 max-w-6xl items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Package size={20} className="text-red-600" />
            <span className="font-black uppercase tracking-wide text-white text-sm sm:text-base">Admin Панел</span>
            <span className="hidden sm:inline rounded-full bg-zinc-800 px-3 py-0.5 text-xs text-zinc-400">
              {products.length} производи
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tabs — desktop only (mobile tabs are below) */}
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
              <button onClick={() => { setActiveTab("inventory"); fetchInventory(); }}
                className={`px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "inventory" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                <Warehouse size={13} className="mr-1 inline" /> Залиха
              </button>
              <button onClick={() => { setActiveTab("showcase"); fetchShowcase(); }}
                className={`px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "showcase" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                <ImageIcon size={13} className="mr-1 inline" /> Платнени
              </button>
            </div>
            <Link href="/" className="hidden sm:block text-sm text-zinc-400 transition hover:text-white">
              ← Кон сајтот
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-red-600 hover:text-white sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Излез</span>
            </button>
          </div>
        </div>
        {/* Mobile tab bar — visible only on portrait/small screens */}
        <div className="flex border-t border-zinc-800 sm:hidden">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase transition ${activeTab === "products" ? "bg-red-600 text-white" : "text-zinc-400 active:bg-zinc-800"}`}
          >
            <Package size={14} /> Производи
          </button>
          <div className="w-px bg-zinc-800" />
          <button
            onClick={() => { setActiveTab("orders"); fetchOrders(); }}
            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase transition ${activeTab === "orders" ? "bg-red-600 text-white" : "text-zinc-400 active:bg-zinc-800"}`}
          >
            <ShoppingCart size={14} /> Нарачки
            {orders.filter(o => o.status === "new").length > 0 && (
              <span className="rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] text-black font-bold">
                {orders.filter(o => o.status === "new").length}
              </span>
            )}
          </button>
          <div className="w-px bg-zinc-800" />
          <button
            onClick={() => { setActiveTab("inventory"); fetchInventory(); }}
            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase transition ${activeTab === "inventory" ? "bg-red-600 text-white" : "text-zinc-400 active:bg-zinc-800"}`}
          >
            <Warehouse size={14} /> Залиха
          </button>
          <div className="w-px bg-zinc-800" />
          <button
            onClick={() => { setActiveTab("showcase"); fetchShowcase(); }}
            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase transition ${activeTab === "showcase" ? "bg-red-600 text-white" : "text-zinc-400"}`}
          >
            <ImageIcon size={14} /> Платнени
          </button>
        </div>
      </header>

      {activeTab === "products" && (
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10">
        <div className="grid gap-6 sm:gap-10 lg:grid-cols-[1fr_420px]">

          {/* ЛИСТА — групирана по бренд */}
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black uppercase text-white">
                Производи{" "}
                <span className="text-base font-normal text-zinc-500">
                  ({stockFilter === "out_of_stock"
                    ? products.filter((p) => p.in_stock === false).length
                    : products.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Out-of-stock filter toggle */}
                <button
                  type="button"
                  onClick={() => setStockFilter((f) => f === "out_of_stock" ? "all" : "out_of_stock")}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold uppercase transition ${
                    stockFilter === "out_of_stock"
                      ? "border-orange-500 bg-orange-600/20 text-orange-400"
                      : "border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400"
                  }`}
                >
                  Нема залиха
                  {products.filter((p) => p.in_stock === false).length > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      stockFilter === "out_of_stock"
                        ? "bg-orange-500 text-black"
                        : "bg-zinc-800 text-zinc-300"
                    }`}>
                      {products.filter((p) => p.in_stock === false).length}
                    </span>
                  )}
                </button>
                <input
                  type="text"
                  placeholder="Пребарај..."
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  className="w-36 rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2 text-sm text-white outline-none transition focus:border-red-600"
                />
              </div>
            </div>

            {products.length === 0 && (
              <p className="py-10 text-center text-zinc-600">Нема производи.</p>
            )}

            {Object.entries(
              products
                .filter((p) =>
                  stockFilter === "all" || p.in_stock === false
                )
                .filter((p) =>
                  !listSearch ||
                  p.title.toLowerCase().includes(listSearch.toLowerCase()) ||
                  p.brand.toLowerCase().includes(listSearch.toLowerCase()) ||
                  (p.car_model || "").toLowerCase().includes(listSearch.toLowerCase()) ||
                  (p.sku || "").toLowerCase().includes(listSearch.toLowerCase())
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
                <label className={labelClass}>
                  Цена во EUR{" "}
                  <span className="font-normal normal-case text-zinc-600">(опционално — за /ks)</span>
                </label>
                <input value={form.price_eur}
                  onChange={(e) => update("price_eur", e.target.value)}
                  placeholder="пр. 45 (само број)"
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
                  JPG, PNG, WebP · Автоматски компресира · Кликни слика за главна
                </p>

                {(form.images || []).length > 0 ? (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {(form.images || []).map((img, idx) => (
                      <div key={idx}
                        onClick={() => idx !== 0 && setMainImage(idx)}
                        title={idx === 0 ? "Главна слика" : "Кликни за главна слика"}
                        className={`relative cursor-pointer overflow-hidden rounded-xl border bg-zinc-900 transition ${idx === 0 ? "border-red-600 ring-1 ring-red-600" : "border-zinc-700 hover:border-red-500"}`}
                        style={{height:"90px"}}
                      >
                        <Image src={img} alt={`slika ${idx+1}`} fill className="object-cover" unoptimized />
                        {idx === 0 && (
                          <div className="absolute left-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            ГЛАВНА
                          </div>
                        )}
                        {idx !== 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/40 hover:opacity-100">
                            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">★ Главна</span>
                          </div>
                        )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
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
      )}

      {/* ── НАРАЧКИ ТАБ ── */}
      {activeTab === "orders" && (
        <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">

          {/* ── Рачна нарачка toggle ── */}
          <div className="mb-4">
            <button
              onClick={() => setShowManualForm((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${showManualForm ? "border-red-600 bg-red-600/10 text-red-400" : "border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"}`}
            >
              <Plus size={15} /> Рачна нарачка
            </button>

            {showManualForm && (
              <form onSubmit={saveManualOrder}
                className="mt-3 rounded-2xl border border-zinc-700 bg-[#111] p-4 sm:p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Нова рачна нарачка</p>

                {/* Source selector */}
                <div className="mb-4 flex gap-2">
                  {[
                    { v: "facebook", label: "🔵 Facebook" },
                    { v: "phone",    label: "📞 Телефон" },
                    { v: "manual",   label: "✏️ Рачно" },
                  ].map(({ v, label }) => (
                    <button key={v} type="button"
                      onClick={() => setManualForm((p) => ({ ...p, source: v }))}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition ${manualForm.source === v ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-400 hover:border-red-500"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* SKU lookup */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">SKU број (авто-пополнување)</label>
                  <div className="flex gap-2">
                    <input
                      value={manualForm.sku}
                      onChange={(e) => setManualForm((p) => ({ ...p, sku: e.target.value }))}
                      onBlur={(e) => lookupSku(e.target.value)}
                      placeholder="Пр. 212807"
                      className="flex-1 rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600"
                    />
                    <button type="button" onClick={() => lookupSku(manualForm.sku)}
                      className="rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-400 transition hover:border-red-600 hover:text-white">
                      Пронајди
                    </button>
                  </div>
                  {manualSkuFound && (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-green-800 bg-green-950/20 px-3 py-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-sm text-green-400 font-semibold">{manualSkuFound.title}</span>
                    </div>
                  )}
                  {manualForm.sku && !manualSkuFound && (
                    <p className="mt-1.5 text-xs text-zinc-500">SKU не е пронајден — внеси рачно подолу</p>
                  )}
                </div>

                {/* Product fields — title editable only if SKU not found, price ALWAYS editable */}
                {manualForm.sku && (
                  <div className="mb-4 grid gap-2 sm:grid-cols-3">
                    {!manualSkuFound && (
                      <input value={manualForm.product_title}
                        onChange={(e) => setManualForm((p) => ({ ...p, product_title: e.target.value }))}
                        placeholder="Назив на производот"
                        className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600 sm:col-span-2" />
                    )}
                    <input value={manualForm.product_price}
                      onChange={(e) => setManualForm((p) => ({ ...p, product_price: e.target.value }))}
                      placeholder="Цена (пр. 1500 ден)"
                      className={`rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600 ${manualSkuFound ? "sm:col-span-3" : ""}`} />
                  </div>
                )}

                {/* Customer fields */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <input required value={manualForm.name}
                    onChange={(e) => setManualForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ime *"
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600" />
                  <input required value={manualForm.surname}
                    onChange={(e) => setManualForm((p) => ({ ...p, surname: e.target.value }))}
                    placeholder="Prezime *"
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600" />
                  <input value={manualForm.address}
                    onChange={(e) => setManualForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Adresa"
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600" />
                  <input value={manualForm.city}
                    onChange={(e) => setManualForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Grad"
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600" />
                  <input required value={manualForm.phone}
                    onChange={(e) => setManualForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Telefon *"
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600" />
                  <input value={manualForm.note}
                    onChange={(e) => setManualForm((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Напомена (опционално)"
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-600" />
                </div>

                {manualError && <p className="mt-2 text-sm text-red-400">{manualError}</p>}

                <div className="mt-4 flex gap-2">
                  <button type="submit" disabled={manualSaving}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
                    {manualSaving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    Зачувај нарачка
                  </button>
                  <button type="button" onClick={() => setShowManualForm(false)}
                    className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 transition hover:border-red-600 hover:text-white">
                    Откажи
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Filters */}
          <div className="mb-4 rounded-2xl border border-zinc-800 bg-[#111] p-4">
            <div className="flex flex-col gap-3">

              {/* Row 1: Title + Month nav + Search */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black uppercase text-white">Нарачки</h2>
                  <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs text-zinc-400">
                    {orders.length}
                  </span>
                  {/* Back to All Orders — lives here (title row), fully separate
                      from the status/filter buttons below so it never shifts them */}
                  {(ordersDay || ordersCurrency || ordersStatus || ordersSearch) && (
                    <button
                      onClick={() => { setOrdersDay(""); setOrdersCurrency(""); setOrdersStatus(""); setOrdersSearch(""); }}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-700/60 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-600/20 hover:text-white"
                      title="Врати се на сите нарачки"
                    >
                      <X size={12} /> Врати на сите
                    </button>
                  )}
                </div>

                {/* Month navigation — prev/next + current month */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const [y,m] = ordersMonth.split("-").map(Number);
                      const d = new Date(y, m-2, 1);
                      const nm = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
                      setOrdersMonth(nm); setOrdersStatus(""); fetchOrders(nm);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-red-600 hover:text-white"
                    title="Претходен месец"
                  >←</button>

                  <input type="month" value={ordersMonth}
                    onChange={(e) => { setOrdersMonth(e.target.value); fetchOrders(e.target.value, ordersStatus); }}
                    className="rounded-lg border border-zinc-700 bg-[#1a1a1a] px-3 py-1.5 text-sm font-semibold text-white outline-none transition focus:border-red-600"
                  />

                  <button
                    onClick={() => {
                      const [y,m] = ordersMonth.split("-").map(Number);
                      const d = new Date(y, m, 1);
                      const nm = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
                      setOrdersMonth(nm); setOrdersStatus(""); fetchOrders(nm);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-red-600 hover:text-white"
                    title="Следен месец"
                  >→</button>
                </div>

                {/* Customer search */}
                <input
                  type="text"
                  placeholder="🔍  Пребарај по Ime / Telefon / SKU..."
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2 text-sm text-white outline-none transition focus:border-red-600 sm:w-56"
                />
              </div>

              {/* Row 2: Status filter + Count */}
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { v: "",         label: "Сите" },
                    { v: "new",        label: "🆕 Нови" },
                    { v: "in_process", label: "⚙️ Во процес" },
                    { v: "sent",       label: "✅ Испратени" },
                  ].map(({ v, label }) => (
                    <button key={v}
                      onClick={() => setOrdersStatus(v)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase transition ${
                        ordersStatus === v
                          ? "bg-red-600 text-white"
                          : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"
                      }`}>
                      {label}
                      <span className={`ml-1 ${ordersStatus === v ? "" : "opacity-60"}`}>
                        ({v === "" ? dayFilteredOrders.length : dayFilteredOrders.filter(o => o.status === v).length})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Day filter */}
                <input
                  type="date"
                  value={ordersDay}
                  onChange={(e) => setOrdersDay(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-[#1a1a1a] px-2.5 py-1.5 text-sm text-white outline-none transition focus:border-red-600"
                  title="Филтрирај по ден"
                />

                {/* Market/currency filter */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { v: "",    label: "🌐 Сите" },
                    { v: "MKD", label: "🇲🇰 МКД" },
                    { v: "EUR", label: "🇽🇰 ЕУР" },
                  ].map(({ v, label }) => (
                    <button key={v}
                      onClick={() => setOrdersCurrency(v)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase transition ${
                        ordersCurrency === v
                          ? "bg-red-600 text-white"
                          : "border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-white"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Export button */}
                <button
                  onClick={exportOrders}
                  className="ml-auto flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-400 transition hover:border-green-600 hover:text-white"
                  title="Експортирај ги нарачките за овој месец во Excel"
                >
                  <Download size={14} /> Експорт
                </button>
              </div>
            </div>
          </div>

          {/* ── Summary card ── */}
          {!ordersLoading && dayFilteredOrders.length > 0 && (
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-[#111] px-4 py-3 text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Вкупно нарачки</p>
                <p className="mt-1 text-2xl font-black text-white">{dayFilteredOrders.length}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-[#111] px-4 py-3 text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Нови</p>
                <p className="mt-1 text-2xl font-black text-yellow-400">{dayFilteredOrders.filter(o => o.status === "new").length}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-[#111] px-4 py-3 text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Испратени</p>
                <p className="mt-1 text-2xl font-black text-green-400">{dayFilteredOrders.filter(o => o.status === "sent").length}</p>
              </div>
            </div>
          )}

          {/* Orders list */}
          {ordersLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-red-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-zinc-600">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
              <p>Нема нарачки</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayFilteredOrders
                .filter((order) => !ordersStatus || order.status === ordersStatus)
                .filter((order) =>
                  !ordersSearch ||
                  `${order.name} ${order.surname}`.toLowerCase().includes(ordersSearch.toLowerCase()) ||
                  (order.phone || "").includes(ordersSearch) ||
                  (order.product_sku || "").toLowerCase().includes(ordersSearch.toLowerCase()) ||
                  (order.items || []).some((it) => (it.sku || "").toLowerCase().includes(ordersSearch.toLowerCase()))
                )
                .map((order) => (
                <div key={order.id}
                  className={`rounded-2xl border bg-[#111] p-3 sm:p-5 transition ${
                    order.status === "new" ? "border-yellow-700/50" :
                    order.status === "in_process" ? "border-blue-700/50" :
                    "border-green-700/50"
                  }`}
                >
                  {/* Order header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status badge */}
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${
                        order.status === "new" ? "bg-yellow-600/20 text-yellow-400" :
                        order.status === "in_process" ? "bg-blue-600/20 text-blue-400" :
                        "bg-green-600/20 text-green-400"
                      }`}>
                        {order.status === "new" ? "🆕 Нова" :
                         order.status === "in_process" ? "⚙️ Во процес" :
                         "✅ Испратена"}
                      </span>
                      {/* Source badge — FB/Phone/Manual */}
                      {order.source && order.source !== "web" && (
                        <span className={`rounded-lg px-2 py-1 text-xs font-bold ${
                          order.source === "facebook" ? "bg-blue-600/20 text-blue-400" :
                          order.source === "phone"    ? "bg-purple-600/20 text-purple-400" :
                          "bg-zinc-700/50 text-zinc-400"
                        }`}>
                          {order.source === "facebook" ? "🔵 FB" :
                           order.source === "phone"    ? "📞" : "✏️"}
                        </span>
                      )}
                      <span className="text-xs text-zinc-500">
                        <Clock size={11} className="mr-1 inline" />
                        {new Date(order.created_at).toLocaleDateString("mk-MK", {
                          day: "numeric", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      <span className="text-xs text-zinc-600">#{order.id}</span>
                    </div>

                    {/* Status buttons */}
                    <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, "in_process")}
                        disabled={order.status === "in_process"}
                        className="rounded-xl border border-blue-700 px-3 py-2.5 sm:py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/20 disabled:opacity-40 active:bg-blue-600/30"
                      >
                        ⚙️ Во процес
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "sent")}
                        disabled={order.status === "sent"}
                        className="rounded-xl border border-green-700 px-3 py-2.5 sm:py-1.5 text-xs font-semibold text-green-400 transition hover:bg-green-600/20 disabled:opacity-40 active:bg-green-600/30"
                      >
                        ✅ Испратена
                      </button>
                      <button
                        onClick={() => openEditOrder(order)}
                        className="rounded-xl border border-zinc-600 px-3 py-2.5 sm:py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700/40 active:bg-zinc-700"
                        title="Уреди нарачка"
                      >
                        <Pencil size={13} className="inline" />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="rounded-xl border border-red-900 px-3 py-2.5 sm:py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-600/20 active:bg-red-600/30"
                        title="Избриши нарачка"
                      >
                        <Trash2 size={13} className="inline" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {/* Customer info */}
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Купувач</p>
                      <p className="font-semibold text-white">{order.name} {order.surname}</p>
                      <p className="mt-1 text-sm text-zinc-400">{order.address}, {order.city}</p>
                      <a href={`tel:${order.phone}`} className="mt-1 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400">
                        <Phone size={13} /> {order.phone}
                      </a>
                      {order.email && (
                        <a href={`mailto:${order.email}`} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                          <MailIcon size={11} /> {order.email}
                        </a>
                      )}
                      {(order as any).note && (
                        <div className="mt-2 rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-600/80">Напомена</p>
                          <p className="mt-0.5 text-sm italic text-amber-300">{(order as any).note}</p>
                        </div>
                      )}
                    </div>

                    {/* Ordered items */}
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Нарачано</p>
                      {order.items && order.items.length > 0 ? (
                        <ul className="space-y-1">
                          {order.items.map((item, i) => (
                            <li key={i} className="text-sm text-zinc-300">
                              <span className="font-semibold">{item.quantity}×</span> {item.title}
                              <span className="ml-2 font-bold text-red-500">{order.currency === "EUR" ? `${getEurValue(item.price, item.price_eur)} €` : item.price}</span>
                              {item.sku && <span className="ml-1 font-mono text-xs text-zinc-600">({item.sku})</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-zinc-300">
                          {order.product_title}
                          <span className="ml-2 font-bold text-red-500">{order.currency === "EUR" ? `${getEurValue(order.product_price || "")} €` : order.product_price}</span>
                          {order.product_sku && <span className="ml-1 font-mono text-xs text-zinc-600">({order.product_sku})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ЕДИТ НАРАЧКА МОДАЛ ── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeEditOrder}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-[#111] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-black uppercase text-white">
                <Pencil size={16} className="mr-2 inline text-red-500" />
                Уреди нарачка #{editingOrder.id}
              </h3>
              <button onClick={closeEditOrder} className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition hover:border-red-600 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Customer info */}
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Купувач</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={editingOrder.name} onChange={(e) => setEditingOrder((p) => p ? { ...p, name: e.target.value } : p)}
                placeholder="Ime" className={inputClass} />
              <input value={editingOrder.surname} onChange={(e) => setEditingOrder((p) => p ? { ...p, surname: e.target.value } : p)}
                placeholder="Prezime" className={inputClass} />
              <input value={editingOrder.address} onChange={(e) => setEditingOrder((p) => p ? { ...p, address: e.target.value } : p)}
                placeholder="Adresa" className={inputClass} />
              <input value={editingOrder.city} onChange={(e) => setEditingOrder((p) => p ? { ...p, city: e.target.value } : p)}
                placeholder="Grad" className={inputClass} />
              <input value={editingOrder.phone} onChange={(e) => setEditingOrder((p) => p ? { ...p, phone: e.target.value } : p)}
                placeholder="Telefon" className={inputClass} />
              <input value={editingOrder.email || ""} onChange={(e) => setEditingOrder((p) => p ? { ...p, email: e.target.value } : p)}
                placeholder="Email" className={inputClass} />
            </div>

            {/* Products — cart order vs single product */}
            <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Производи</p>
            {editingOrder.items && editingOrder.items.length > 0 ? (
              <div className="space-y-2">
                {editingOrder.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_90px_70px] gap-2">
                    <input value={item.title} onChange={(e) => updateEditingItem(idx, "title", e.target.value)}
                      className={inputClass} placeholder="Назив" />
                    <input value={item.price} onChange={(e) => updateEditingItem(idx, "price", e.target.value)}
                      className={inputClass} placeholder="Цена" />
                    <input type="number" value={item.quantity} onChange={(e) => updateEditingItem(idx, "quantity", parseInt(e.target.value) || 0)}
                      className={inputClass} placeholder="Кол." />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <input value={editingOrder.product_title || ""} onChange={(e) => setEditingOrder((p) => p ? { ...p, product_title: e.target.value } : p)}
                  className={inputClass} placeholder="Назив на производот" />
                <input value={editingOrder.product_price || ""} onChange={(e) => setEditingOrder((p) => p ? { ...p, product_price: e.target.value } : p)}
                  className={inputClass} placeholder="Цена" />
              </div>
            )}

            {/* Note + Status */}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Напомена</label>
                <textarea value={editingOrder.note || ""} onChange={(e) => setEditingOrder((p) => p ? { ...p, note: e.target.value } : p)}
                  rows={2} className="w-full resize-none rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2 text-sm text-white outline-none transition focus:border-red-600" />
              </div>
              <div>
                <label className={labelClass}>Статус</label>
                <select value={editingOrder.status} onChange={(e) => setEditingOrder((p) => p ? { ...p, status: e.target.value as Order["status"] } : p)}
                  className={inputClass}>
                  <option value="new">🆕 Нова</option>
                  <option value="in_process">⚙️ Во процес</option>
                  <option value="sent">✅ Испратена</option>
                </select>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="mt-6 flex gap-2">
              <button onClick={saveOrderEdit} disabled={editSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
                {editSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Зачувај
              </button>
              <button onClick={closeEditOrder}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-400 transition hover:border-red-600 hover:text-white">
                Откажи
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ЗАЛИХА ТАБ ── */}
      {activeTab === "inventory" && (
        <div className="mx-auto max-w-4xl px-3 py-3 sm:px-6 sm:py-8">

          {/* ── Search ── full width on mobile */}
          <input
            type="text"
            placeholder="🔍  Пребарај по SKU или Ime..."
            value={invSearch}
            onChange={(e) => setInvSearch(e.target.value)}
            className="mb-4 w-full rounded-xl border border-zinc-700 bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
          />

          {/* ── Add form ── */}
          <div className="mb-4 rounded-2xl border border-zinc-800 bg-[#111] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Warehouse size={12} className="mr-1 inline text-red-600" /> Додај ставка
            </p>
            <form onSubmit={addInvItem} className="flex flex-col gap-2">
              {/* Row 1: SKU + Количина */}
              <div className="grid grid-cols-[1fr_90px] gap-2">
                <input
                  required
                  placeholder="SKU број *"
                  value={invForm.sku}
                  onChange={(e) => {
                    setInvForm((p) => ({ ...p, sku: e.target.value }));
                    lookupInvSku(e.target.value);
                  }}
                  className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Кол."
                  value={invForm.quantity}
                  onChange={(e) => setInvForm((p) => ({ ...p, quantity: e.target.value }))}
                  className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-3 py-3 text-center text-sm text-white outline-none transition focus:border-red-600"
                />
              </div>
              {/* SKU lookup result */}
              {invSkuResult && (
                invSkuResult.found ? (
                  <div className="flex items-center gap-2 rounded-xl border border-green-800 bg-green-950/20 px-3 py-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="truncate text-sm font-semibold text-green-400">{invSkuResult.title}</span>
                    <span className="ml-auto shrink-0 font-mono text-xs text-zinc-500">({invSkuResult.sku})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-red-800 bg-red-950/20 px-3 py-2">
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-400">Производот не е пронајден</span>
                  </div>
                )
              )}

              {/* Row 2: Name + Submit */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  required
                  placeholder="Ime / Опис *"
                  value={invForm.name}
                  onChange={(e) => setInvForm((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                />
                <button type="submit" disabled={invAdding}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-60">
                  {invAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span className="hidden sm:inline">Додај</span>
                </button>
              </div>
            </form>
            {invError && <p className="mt-2 text-sm text-red-400">{invError}</p>}
          </div>

          {/* ── Inventory list ── */}
          {invLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-red-600" />
            </div>
          ) : inventory.length === 0 ? (
            <div className="py-16 text-center text-zinc-600">
              <Warehouse size={48} className="mx-auto mb-4 opacity-30" />
              <p>Нема ставки во залиха</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inventory
                .filter((item) =>
                  !invSearch ||
                  item.sku.toLowerCase().includes(invSearch.toLowerCase()) ||
                  item.name.toLowerCase().includes(invSearch.toLowerCase())
                )
                .map((item) => (
                  <div key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-[#111] px-4 py-3">
                    {/* Top row: SKU + Delete */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-red-500">{item.sku}</span>
                      <button
                        onClick={() => deleteInvItem(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 text-zinc-500 transition active:bg-red-600/20 hover:border-red-600 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {/* Name */}
                    <p className="mt-0.5 text-sm text-white">{item.name}</p>
                    {/* Bottom row: Quantity controls */}
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Количина</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateInvQty(item.id, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition active:bg-zinc-700 hover:border-red-600 hover:text-white"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-10 text-center text-lg font-black text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateInvQty(item.id, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition active:bg-zinc-700 hover:border-red-600 hover:text-white"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              }

              {/* Total */}
              <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-[#111] px-4 py-3">
                <span className="text-xs text-zinc-500">
                  {invSearch
                    ? `${inventory.filter(i => i.sku.toLowerCase().includes(invSearch.toLowerCase()) || i.name.toLowerCase().includes(invSearch.toLowerCase())).length} / ${inventory.length} ставки`
                    : `${inventory.length} ставки`}
                </span>
                <span className="text-sm font-bold text-white">
                  Вкупно: <span className="text-red-500">{inventory.reduce((s, i) => s + i.quantity, 0)} ком</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

        {/* ── SHOWCASE tab (Платнени) ── */}
        {activeTab === "showcase" && (
          <div className="mx-auto max-w-4xl px-3 py-3 sm:px-6 sm:py-8">

            <div className="mb-4 rounded-2xl border border-zinc-800 bg-[#111] p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <ImageIcon size={12} className="mr-1 inline text-red-600" />
                {showcaseEditId ? "Измени галерија ставка" : "Додај во галерија"}
              </p>
              <form onSubmit={handleShowcaseSave} className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    required
                    placeholder="URL на слика *"
                    value={showcaseForm.image}
                    onChange={(e) => setShowcaseForm((p) => ({ ...p, image: e.target.value }))}
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                  />
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95">
                    <Upload size={16} />
                    <span className="hidden sm:inline">Upload</span>
                    <input type="file" accept="image/*" onChange={handleShowcaseUpload} className="hidden" />
                  </label>
                </div>
                {showcaseForm.image && (
                  <div className="mt-1 rounded-xl border border-zinc-700 bg-[#1a1a1a] p-3">
                    <Image src={showcaseForm.image} alt="Preview" width={200} height={150} className="max-h-32 rounded-lg object-cover" unoptimized />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    placeholder="Марка *"
                    value={showcaseForm.brand}
                    onChange={(e) => setShowcaseForm((p) => ({ ...p, brand: e.target.value }))}
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                  />
                  <input
                    required
                    placeholder="Модел *"
                    value={showcaseForm.model}
                    onChange={(e) => setShowcaseForm((p) => ({ ...p, model: e.target.value }))}
                    className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={showcaseLoading}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-60">
                    {showcaseLoading ? <Loader2 size={16} className="animate-spin" /> : showcaseEditId ? <CheckCircle size={16} /> : <Plus size={16} />}
                    {showcaseEditId ? "Зачувај" : "Додај"}
                  </button>
                  {showcaseEditId && (
                    <button type="button" onClick={() => { setShowcaseEditId(null); setShowcaseForm({ image: "", brand: "", model: "" }); }}
                      className="rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-400 transition hover:border-red-600 hover:text-white">
                      Откажи
                    </button>
                  )}
                </div>
              </form>
            </div>

            {showcaseLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-red-600" />
              </div>
            ) : showcaseItems.length === 0 ? (
              <div className="py-16 text-center text-zinc-600">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p>Нема ставки во галерија</p>
              </div>
            ) : (
              <div className="space-y-2">
                {showcaseItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#111] px-4 py-3">
                    <Image src={item.image} alt={item.brand} width={64} height={48} className="h-12 w-16 shrink-0 rounded-lg object-cover" unoptimized />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">{item.brand}</p>
                      <p className="text-xs text-zinc-400">{item.model}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button type="button"
                        onClick={() => handleShowcaseMoveUp(item.id)}
                        disabled={idx === 0}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 transition hover:border-red-600 hover:text-red-500 disabled:opacity-30">
                        <ChevronUp size={14} />
                      </button>
                      <button type="button"
                        onClick={() => handleShowcaseMoveDown(item.id)}
                        disabled={idx === showcaseItems.length - 1}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 transition hover:border-red-600 hover:text-red-500 disabled:opacity-30">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <button type="button"
                      onClick={() => handleShowcaseEdit(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 text-zinc-500 transition hover:border-red-600 hover:text-red-500">
                      <Pencil size={15} />
                    </button>
                    <button type="button"
                      onClick={() => handleShowcaseDelete(item.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 text-zinc-500 transition hover:border-red-600 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <div className="rounded-2xl border border-zinc-700 bg-[#111] px-4 py-3 text-center">
                  <span className="text-xs text-zinc-500">{showcaseItems.length} ставки во галерија</span>
                </div>
              </div>
            )}
          </div>
        )}

    </div>
  );
}