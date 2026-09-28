"use client";

/**
 * Client composer for the admin app: provider, auth gate, shell and views.
 *
 * The active tab is passed in from the server (read from ?tab=), so a PWA
 * shortcut or a deep link renders the right screen on the FIRST paint — no
 * dashboard flash, and no hydration mismatch. Tab changes then update the URL
 * via replaceState, so switching never navigates or reloads.
 */

import { useCallback, useEffect, useState } from "react";
import { AdminProvider, useAdmin } from "../_lib/store";
import { Shell, type Tab } from "./Shell";
import { Toaster, Btn, Field, Input, Pill, IcSpinner, IcLock, IcShare, IcCheck } from "./kit";
import { Dashboard } from "../_views/Dashboard";
import { OrdersView } from "../_views/Orders";
import { CatalogView } from "../_views/Catalog";
import { StockView } from "../_views/Stock";
import { StatsView } from "../_views/Stats";
import { SettingsView } from "../_views/Settings";

export const TABS: Tab[] = ["home", "orders", "products", "stock", "accessories", "showcase", "stats", "settings"];

/** Validate a value coming from the URL. */
export function asTab(v: string | undefined): Tab {
  return (TABS as string[]).includes(v ?? "") ? (v as Tab) : "home";
}

export function AdminAppShell({ initialTab }: { initialTab: Tab }) {
  return (
    <AdminProvider>
      <AdminApp initialTab={initialTab} />
    </AdminProvider>
  );
}

function AdminApp({ initialTab }: { initialTab: Tab }) {
  const { authed } = useAdmin();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [newOpen, setNewOpen] = useState(false);

  // Keep the URL in step without triggering navigation.
  const go = useCallback((t: Tab) => {
    setTab(t);
    try { window.history.replaceState(null, "", t === "home" ? "/admin-app" : `/admin-app?tab=${t}`); } catch {}
  }, []);

  useEffect(() => { document.title = "OP Admin"; }, []);

  if (!authed) return <LoginScreen />;

  return (
    <>
      <Shell tab={tab} setTab={go} onNew={() => setNewOpen(true)}>
        {tab === "home" && <Dashboard goto={go} />}
        {tab === "orders" && <OrdersView openNew={newOpen} onNewClosed={() => setNewOpen(false)} />}
        {tab === "products" && <CatalogView openNew={newOpen} onNewClosed={() => setNewOpen(false)} />}
        {tab === "accessories" && <CatalogView scope="auto_accessories" openNew={newOpen} onNewClosed={() => setNewOpen(false)} />}
        {tab === "stock" && <StockView />}
        {tab === "showcase" && <StockView initialTab="gal" />}
        {tab === "stats" && <StatsView />}
        {tab === "settings" && <SettingsView />}
      </Shell>
      <Toasts />
    </>
  );
}

function Toasts() {
  const { toasts, dismiss } = useAdmin();
  return <Toaster toasts={toasts} onDismiss={dismiss} />;
}

/* ── login ─────────────────────────────────────────────────────────── */

function LoginScreen() {
  const { signIn } = useAdmin();
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    setBusy(true);
    setErr("");
    const ok = await signIn(pw, remember);
    setBusy(false);
    if (!ok) setErr("Погрешна лозинка");
  };

  return (
    <div className="admin-app relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#08080a] px-6 text-[#e9e9ee]">
      <style>{`
        .admin-app{ font-family: var(--font-body), "DM Sans", system-ui, sans-serif; }
        .font-heading{ font-family: var(--font-heading), "Barlow Condensed", system-ui, sans-serif; }
        @keyframes floatIn { from{ opacity:0; transform: translateY(14px) } to{ opacity:1; transform:none } }
      `}</style>

      {/* atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 8%, rgba(215,32,38,.22), transparent 62%)," +
            "radial-gradient(50% 40% at 85% 90%, rgba(215,32,38,.08), transparent 60%)",
        }} />

      <div className="relative w-full max-w-[360px]" style={{ animation: "floatIn .5s cubic-bezier(.2,.9,.25,1)" }}>
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/admin-app/icon-192.png" alt="" width={92} height={92}
            className="rounded-[26px] shadow-[0_20px_60px_rgba(215,32,38,.3)]" />
          <h1 className="font-heading mt-5 text-[30px] font-bold uppercase tracking-[.14em] text-white">OP Admin</h1>
          <p className="mt-1 text-[12.5px] text-[#6c6c78]">Original Patosnici · управување</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-3">
          <Field label="Лозинка">
            <div className="relative">
              <IcLock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4e4e58]" />
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••" autoFocus autoComplete="current-password" className="pl-9" />
            </div>
          </Field>

          {err && (
            <div className="rounded-xl border border-[#4a1d21] bg-[#1c0d0f] px-3.5 py-2.5 text-[12.5px] font-medium text-[#e5454a]">
              {err}
            </div>
          )}

          <button type="button" onClick={() => setRemember((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-[#1f1f26] bg-[#0c0c0f] px-3.5 py-3 text-left transition active:scale-[.99]">
            <span className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
              remember ? "border-[#d72026] bg-[#d72026] text-white" : "border-[#2f2f38]"}`}>
              {remember && <IcCheck size={12} />}
            </span>
            <span className="text-[12.5px] text-[#9a9aa5]">Запомни ме на овој уред</span>
          </button>

          <Btn type="submit" size="lg" className="w-full" loading={busy} disabled={!pw}>
            Влези
          </Btn>
        </form>

        <div className="mt-6 rounded-2xl border border-[#1f1f26] bg-[#0c0c0f] p-3.5">
          <p className="flex items-center gap-2 text-[11.5px] font-semibold text-[#7c7c88]">
            <IcShare size={14} className="text-[#d72026]" /> Совет за iPhone
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#5a5a64]">
            Отвори во Safari → Сподели → „Додај на почетен екран“ за да работи како вистинска апликација.
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <a href="/admin" className="text-[11.5px] text-[#4e4e58] underline decoration-[#2a2a33]">класичен панел</a>
        </div>
      </div>
    </div>
  );
}
