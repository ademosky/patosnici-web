"use client";

/**
 * Single data store for the admin app.
 *
 * Talks to the SAME 12 /api/admin/* routes the legacy panel uses — no backend
 * changes. Auth is the identical password header, so the existing password
 * keeps working.
 *
 * Every mutation updates local state first (optimistic) and rolls back on
 * failure, so the UI never shows a value the server did not store and the
 * screen never reloads.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import {
  InvItem, Order, OrderStatus, Product, ShowcaseItem, monthKey,
} from "./core";

export type Subcategory = {
  id: number;
  category: string;
  slug: string;
  name: string;
  name_sq: string | null;
  sort_order: number;
};

type Toast = { id: number; msg: string; ok: boolean };
type BsRow = { rank: number; sku: string; title: string; brand: string; category: string; quantity: number; total: number };

type Ctx = {
  /* auth */
  /** "checking" while a stored password is verified — so the login screen
   *  never flashes on launch when the user is already signed in. */
  session: "checking" | "authed" | "anon";
  authed: boolean;
  /** Re-fetch everything for the current month (used by pull-to-refresh). */
  refresh: () => Promise<void>;
  signIn: (pw: string, remember: boolean) => Promise<boolean>;
  signOut: () => void;
  /* data */
  orders: Order[];
  products: Product[];
  inventory: InvItem[];
  showcase: ShowcaseItem[];
  subcategories: Subcategory[];
  month: string;
  setMonth: (m: string) => void;
  loading: boolean;
  /* toasts */
  toasts: Toast[];
  toast: (msg: string, ok?: boolean) => void;
  dismiss: (id: number) => void;
  /* orders */
  setOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
  patchOrder: (id: number, patch: Partial<Order>) => Promise<boolean>;
  removeOrder: (id: number) => Promise<boolean>;
  addOrder: (payload: Record<string, unknown>) => Promise<boolean>;
  exportOrders: (month: string) => Promise<void>;
  /* products */
  saveProduct: (form: Record<string, unknown>, editId: number | null) => Promise<boolean>;
  removeProduct: (id: number) => Promise<boolean>;
  /* inventory */
  addInventory: (p: { sku: string; name: string; quantity: string }) => Promise<boolean>;
  patchInventory: (id: number, patch: Partial<InvItem>) => Promise<boolean>;
  removeInventory: (id: number) => Promise<boolean>;
  /* showcase */
  addShowcase: (p: { image: string; brand: string; model: string }) => Promise<boolean>;
  patchShowcase: (id: number, patch: Partial<ShowcaseItem>) => Promise<boolean>;
  removeShowcase: (id: number) => Promise<boolean>;
  moveShowcase: (id: number, dir: -1 | 1) => Promise<void>;
  /* subcategories */
  addSubcategory: (p: { name: string; name_sq?: string; category: string }) => Promise<boolean>;
  patchSubcategory: (id: number, patch: Partial<Subcategory>) => Promise<boolean>;
  removeSubcategory: (id: number) => Promise<boolean>;
  moveSubcategory: (id: number, dir: -1 | 1) => Promise<void>;
  /* stats */
  bestSellers: (opts?: { from?: string; to?: string }) => Promise<BsRow[]>;
};

const AdminCtx = createContext<Ctx | null>(null);

const KEY = "adminPw";

function readPw(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY) ?? "";
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [pw, setPw] = useState<string>(readPw);
  // Start in "checking" when a password is stored — the launch renders a
  // splash, never the login form, and resolves to whichever is correct.
  const [session, setSession] = useState<"checking" | "authed" | "anon">(
    () => (readPw() ? "checking" : "anon"),
  );
  const authed = session === "authed";
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [showcase, setShowcase] = useState<ShowcaseItem[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [month, setMonthState] = useState<string>(() => monthKey());
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((msg: string, ok = true) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, ok }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const authHeaders = useCallback(
    (json = false): Record<string, string> => ({
      ...(json ? { "Content-Type": "application/json" } : {}),
      "x-admin-password": pw,
    }),
    [pw],
  );

  /* ── loaders ─────────────────────────────────────────────────────── */

  const loadOrders = useCallback(async (m: string, password?: string) => {
    const res = await fetch(`/api/admin/orders?month=${m}&_t=${Date.now()}`, {
      headers: { "x-admin-password": password ?? pw },
      cache: "no-store",
    });
    if (res.ok) setOrders(await res.json());
  }, [pw]);

  const loadProducts = useCallback(async (password?: string) => {
    const res = await fetch(`/api/admin/products?_t=${Date.now()}`, {
      headers: { "x-admin-password": password ?? pw },
      cache: "no-store",
    });
    if (res.ok) setProducts(await res.json());
  }, [pw]);

  const loadInventory = useCallback(async (password?: string) => {
    const res = await fetch(`/api/admin/inventory?_t=${Date.now()}`, {
      headers: { "x-admin-password": password ?? pw },
      cache: "no-store",
    });
    if (res.ok) setInventory(await res.json());
  }, [pw]);

  const loadShowcase = useCallback(async (password?: string) => {
    const res = await fetch(`/api/admin/showcase?_t=${Date.now()}`, {
      headers: { "x-admin-password": password ?? pw },
      cache: "no-store",
    });
    if (res.ok) setShowcase(await res.json());
  }, [pw]);

  const loadSubcategories = useCallback(async (password?: string) => {
    const res = await fetch(`/api/admin/subcategories?_t=${Date.now()}`, {
      headers: { "x-admin-password": password ?? pw },
      cache: "no-store",
    });
    if (res.ok) setSubcategories(await res.json());
  }, [pw]);

  const loadAll = useCallback(async (m: string, password?: string) => {
    setLoading(true);
    await Promise.all([
      loadOrders(m, password),
      loadProducts(password),
      loadInventory(password),
      loadShowcase(password),
      loadSubcategories(password),
    ]);
    setLoading(false);
  }, [loadOrders, loadProducts, loadInventory, loadShowcase, loadSubcategories]);

  /* ── session ─────────────────────────────────────────────────────── */

  useEffect(() => {
    const stored = readPw();
    if (!stored) { setSession("anon"); return; }
    // Verify the stored password against the API before trusting it.
    (async () => {
      try {
        const res = await fetch("/api/admin/products", {
          headers: { "x-admin-password": stored }, cache: "no-store",
        });
        if (res.ok) {
          setPw(stored);
          setProducts(await res.json());
          setSession("authed");
          loadOrders(monthKey(), stored);
          loadInventory(stored);
          loadShowcase(stored);
          loadSubcategories(stored);
        } else {
          localStorage.removeItem(KEY);
          sessionStorage.removeItem(KEY);
          setSession("anon");
        }
      } catch {
        // Offline on launch: keep the stored credential and let the user in;
        // every request will retry when the connection returns.
        setPw(stored);
        setSession("authed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(async (password: string, remember: boolean) => {
    const res = await fetch("/api/admin/products", { headers: { "x-admin-password": password } });
    if (!res.ok) return false;
    if (remember) localStorage.setItem(KEY, password);
    else sessionStorage.setItem(KEY, password);
    setPw(password);
    setSession("authed");
    setProducts(await res.json());
    await loadAll(monthKey(), password);
    return true;
  }, [loadAll]);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    setSession("anon");
    setPw("");
    setOrders([]); setProducts([]); setInventory([]); setShowcase([]);
  }, []);

  const setMonth = useCallback((m: string) => {
    setMonthState(m);
    loadOrders(m);
  }, [loadOrders]);

  /** Pull-to-refresh: reload every dataset for the month on screen. */
  const refresh = useCallback(async () => {
    if (!pw) return;
    await loadAll(month, pw);
  }, [pw, month, loadAll]);

  /* ── orders ──────────────────────────────────────────────────────── */

  const setOrderStatus = useCallback(async (id: number, status: OrderStatus) => {
    const prev = orders.find((o) => o.id === id)?.status;
    if (!prev || prev === status) return;
    setOrders((all) => all.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH", headers: authHeaders(true),
        body: JSON.stringify({ status }), cache: "no-store",
      });
      if (!res.ok) throw new Error();
      toast(status === "sent" ? "Означена како испратена" : "Статусот е ажуриран");
    } catch {
      setOrders((all) => all.map((o) => (o.id === id ? { ...o, status: prev } : o)));
      toast("Грешка при ажурирање", false);
    }
  }, [orders, authHeaders, toast]);

  const patchOrder = useCallback(async (id: number, patch: Partial<Order>) => {
    const before = orders.find((o) => o.id === id);
    setOrders((all) => all.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH", headers: authHeaders(true),
        body: JSON.stringify(patch), cache: "no-store",
      });
      if (!res.ok) throw new Error();
      toast("Зачувано");
      return true;
    } catch {
      if (before) setOrders((all) => all.map((o) => (o.id === id ? before : o)));
      toast("Грешка при зачувување", false);
      return false;
    }
  }, [orders, authHeaders, toast]);

  const removeOrder = useCallback(async (id: number) => {
    const before = orders;
    setOrders((all) => all.filter((o) => o.id !== id));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast("Нарачката е избришана");
      return true;
    } catch {
      setOrders(before);
      toast("Грешка при бришење", false);
      return false;
    }
  }, [orders, authHeaders, toast]);

  const addOrder = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST", headers: authHeaders(true), body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast("Нарачката е додадена");
      await loadOrders(month);
      return true;
    } catch {
      toast("Грешка при додавање", false);
      return false;
    }
  }, [authHeaders, toast, loadOrders, month]);

  const exportOrders = useCallback(async (m: string) => {
    try {
      const res = await fetch(`/api/admin/orders/export?month=${m}`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `naracki-${m || "site"}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast("Експортот е подготвен");
    } catch {
      toast("Грешка при експорт", false);
    }
  }, [authHeaders, toast]);

  /* ── products ────────────────────────────────────────────────────── */

  const saveProduct = useCallback(async (form: Record<string, unknown>, editId: number | null) => {
    try {
      const res = await fetch(editId ? `/api/admin/products/${editId}` : "/api/admin/products", {
        method: editId ? "PUT" : "POST", headers: authHeaders(true), body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast(editId ? "Производот е ажуриран" : "Производот е додаден");
      await loadProducts();
      return true;
    } catch {
      toast("Грешка при зачувување", false);
      return false;
    }
  }, [authHeaders, toast, loadProducts]);

  const removeProduct = useCallback(async (id: number) => {
    const before = products;
    setProducts((all) => all.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast("Производот е избришан");
      return true;
    } catch {
      setProducts(before);
      toast("Грешка при бришење", false);
      return false;
    }
  }, [products, authHeaders, toast]);

  /* ── inventory ───────────────────────────────────────────────────── */

  const addInventory = useCallback(async (p: { sku: string; name: string; quantity: string }) => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST", headers: authHeaders(true), body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error();
      toast("Ставката е додадена");
      await loadInventory();
      return true;
    } catch {
      toast("Грешка при додавање", false);
      return false;
    }
  }, [authHeaders, toast, loadInventory]);

  const patchInventory = useCallback(async (id: number, patch: Partial<InvItem>) => {
    const before = inventory.find((i) => i.id === id);
    setInventory((all) => all.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH", headers: authHeaders(true), body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch {
      if (before) setInventory((all) => all.map((i) => (i.id === id ? before : i)));
      toast("Грешка при зачувување", false);
      return false;
    }
  }, [inventory, authHeaders, toast]);

  const removeInventory = useCallback(async (id: number) => {
    const before = inventory;
    setInventory((all) => all.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast("Избришано");
      return true;
    } catch {
      setInventory(before);
      toast("Грешка при бришење", false);
      return false;
    }
  }, [inventory, authHeaders, toast]);

  /* ── showcase ────────────────────────────────────────────────────── */

  const addShowcase = useCallback(async (p: { image: string; brand: string; model: string }) => {
    try {
      const res = await fetch("/api/admin/showcase", {
        method: "POST", headers: authHeaders(true), body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error();
      toast("Додадено во галерија");
      await loadShowcase();
      return true;
    } catch {
      toast("Грешка при додавање", false);
      return false;
    }
  }, [authHeaders, toast, loadShowcase]);

  const patchShowcase = useCallback(async (id: number, patch: Partial<ShowcaseItem>) => {
    try {
      const res = await fetch(`/api/admin/showcase/${id}`, {
        method: "PUT", headers: authHeaders(true), body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      toast("Ажурирано");
      await loadShowcase();
      return true;
    } catch {
      toast("Грешка при зачувување", false);
      return false;
    }
  }, [authHeaders, toast, loadShowcase]);

  const removeShowcase = useCallback(async (id: number) => {
    const before = showcase;
    setShowcase((all) => all.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/admin/showcase/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast("Избришано");
      return true;
    } catch {
      setShowcase(before);
      toast("Грешка при бришење", false);
      return false;
    }
  }, [showcase, authHeaders, toast]);

  const moveShowcase = useCallback(async (id: number, dir: -1 | 1) => {
    const idx = showcase.findIndex((s) => s.id === id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= showcase.length) return;
    const reordered = [...showcase];
    [reordered[idx], reordered[next]] = [reordered[next], reordered[idx]];
    setShowcase(reordered);
    try {
      await fetch("/api/admin/showcase/reorder", {
        method: "POST", headers: authHeaders(true),
        body: JSON.stringify({ orderedIds: reordered.map((s) => s.id) }),
      });
    } catch {
      setShowcase(showcase);
      toast("Грешка при прередување", false);
    }
  }, [showcase, authHeaders, toast]);

  /* ── subcategories ───────────────────────────────────────────────── */

  const addSubcategory = useCallback(async (p: { name: string; name_sq?: string; category: string }) => {
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "POST", headers: authHeaders(true), body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error();
      toast("Категоријата е додадена");
      await loadSubcategories();
      return true;
    } catch {
      toast("Грешка при додавање", false);
      return false;
    }
  }, [authHeaders, toast, loadSubcategories]);

  const patchSubcategory = useCallback(async (id: number, patch: Partial<Subcategory>) => {
    const before = subcategories.find((c) => c.id === id);
    setSubcategories((all) => all.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, {
        method: "PATCH", headers: authHeaders(true), body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch {
      if (before) setSubcategories((all) => all.map((c) => (c.id === id ? before : c)));
      toast("Грешка при зачувување", false);
      return false;
    }
  }, [subcategories, authHeaders, toast]);

  const removeSubcategory = useCallback(async (id: number) => {
    const before = subcategories;
    setSubcategories((all) => all.filter((c) => c.id !== id));
    // products in it are not deleted — they fall back to "Останато"
    setProducts((all) => all.map((p) => {
      const target = before.find((c) => c.id === id);
      return target && p.subcategory === target.slug ? { ...p, subcategory: null } : p;
    }));
    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      toast("Категоријата е избришана");
      return true;
    } catch {
      setSubcategories(before);
      await loadProducts();
      toast("Грешка при бришење", false);
      return false;
    }
  }, [subcategories, authHeaders, toast, loadProducts]);

  const moveSubcategory = useCallback(async (id: number, dir: -1 | 1) => {
    const list = [...subcategories].sort((a, b) => a.sort_order - b.sort_order);
    const i = list.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const renumbered = list.map((c, idx) => ({ ...c, sort_order: idx }));
    setSubcategories(renumbered);
    // two small writes — the list is short and this keeps the API surface tiny
    await Promise.all([
      patchSubcategory(list[i].id, { sort_order: i }),
      patchSubcategory(list[j].id, { sort_order: j }),
    ]);
  }, [subcategories, patchSubcategory]);

  /* ── stats ───────────────────────────────────────────────────────── */

  const bestSellers = useCallback(async (opts?: { from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (opts?.from) q.set("from", opts.from);
    if (opts?.to) q.set("to", opts.to);
    try {
      const res = await fetch(`/api/admin/products/best-sellers?${q}`, { headers: authHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.rows) ? data.rows : [];
    } catch {
      return [];
    }
  }, [authHeaders]);

  const value = useMemo<Ctx>(() => ({
    session, authed, signIn, signOut, refresh,
    orders, products, inventory, showcase, subcategories, month, setMonth, loading,
    toasts, toast, dismiss,
    setOrderStatus, patchOrder, removeOrder, addOrder, exportOrders,
    saveProduct, removeProduct,
    addInventory, patchInventory, removeInventory,
    addShowcase, patchShowcase, removeShowcase, moveShowcase,
    addSubcategory, patchSubcategory, removeSubcategory, moveSubcategory,
    bestSellers,
  }), [
    session, authed, signIn, signOut, refresh, orders, products, inventory, showcase, month, setMonth,
    loading, toasts, toast, dismiss, setOrderStatus, patchOrder, removeOrder, addOrder,
    exportOrders, saveProduct, removeProduct, addInventory, patchInventory,
    removeInventory, addShowcase, patchShowcase, removeShowcase, moveShowcase,
    addSubcategory, patchSubcategory, removeSubcategory, moveSubcategory, bestSellers,
  ]);

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdmin(): Ctx {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
