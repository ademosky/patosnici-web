"use client";

/**
 * App shell: header, bottom tab bar (mobile), sidebar (desktop),
 * PWA install prompt and service-worker registration.
 *
 * Mobile follows the iOS convention — a fixed tab bar at the bottom with
 * safe-area padding, and a "More" sheet for the secondary sections.
 */

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  IcHome, IcOrders, IcBox, IcLayers, IcSpark, IcImage, IcChart, IcSettings,
  IcX, IcShare, IcPlus, IcAlert, IconBtn, Sheet, IcSpinner,
} from "./kit";

import type { Tab } from "../_lib/core";

export type { Tab };

const PRIMARY: Array<{ t: Tab; label: string; icon: (p: { size?: number; className?: string }) => ReactNode }> = [
  { t: "home",     label: "Почетна",   icon: IcHome },
  { t: "orders",   label: "Нарачки",   icon: IcOrders },
  { t: "products", label: "Производи", icon: IcBox },
  { t: "stats",    label: "Статистики",icon: IcChart },
];

const SECONDARY: Array<{ t: Tab; label: string; desc: string; icon: (p: { size?: number; className?: string }) => ReactNode }> = [
  { t: "stock",       label: "Залиха",   desc: "Состојба на лагер",        icon: IcLayers },
  { t: "accessories", label: "Додатоци", desc: "Авто додатоци",            icon: IcSpark },
  { t: "showcase",    label: "Галерија", desc: "Прикажани на почетна",     icon: IcImage },
  { t: "settings",    label: "Подесувања", desc: "Апликација и одјава",    icon: IcSettings },
];

const ALL: Array<{ t: Tab; label: string; icon: (p: { size?: number; className?: string }) => ReactNode }> =
  [...PRIMARY, ...SECONDARY.map(({ t, label, icon }) => ({ t, label, icon }))];

/* ── pull to refresh ───────────────────────────────────────────────── */

/**
 * Drag down from the very top to refresh the data.
 *
 * Deliberately hand-rolled rather than relying on the browser: iOS shows its
 * own indicator only in some contexts, and inside a standalone PWA it is easy
 * to lose. This gesture works identically in Safari and when installed.
 */
function usePullToRefresh(onRefresh?: () => Promise<void>) {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!onRefresh) return;

    const THRESHOLD = 70;   // px of drag that arms the refresh
    const MAX = 110;

    const onStart = (e: TouchEvent) => {
      // only arm when the page is already scrolled to the top
      if (window.scrollY > 0 || busy) { startY.current = null; return; }
      startY.current = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) { setPull(0); return; }
      // rubber-band so the indicator never runs away
      setPull(Math.min(MAX, dy * 0.55));
    };

    const onEnd = async () => {
      if (startY.current === null) return;
      const armed = pull >= THRESHOLD * 0.55;
      startY.current = null;
      if (!armed) { setPull(0); return; }
      setBusy(true);
      setPull(THRESHOLD * 0.75);
      try { await onRefresh(); } finally {
        setBusy(false);
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [onRefresh, pull, busy]);

  return { pull, busy };
}

/* ── install prompt ────────────────────────────────────────────────── */

function useInstall() {
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIos(isIos);
    setStandalone(isStandalone);

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", onPrompt);

    try { setHidden(localStorage.getItem("adminAppInstallHidden") === "1"); } catch {}

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem("adminAppInstallHidden", "1"); } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  // Show only when not already installed and not dismissed.
  const show = !standalone && !hidden;
  return { show, ios, deferred, dismiss, install };
}

/* ── shell ─────────────────────────────────────────────────────────── */

export function Shell({ tab, setTab, onNew, onRefresh, children }: {
  tab: Tab; setTab: (t: Tab) => void; onNew?: () => void;
  onRefresh?: () => Promise<void>; children: ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pull, busy: refreshing } = usePullToRefresh(onRefresh);
  const { show, ios, deferred, dismiss, install } = useInstall();
  const current = ALL.find((x) => x.t === tab);

  // Register the service worker (scope is /admin-app only).
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/admin-app/sw.js", { scope: "/admin-app" }).catch(() => {});
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const isPrimary = PRIMARY.some((p) => p.t === tab);

  return (
    <>
      {/* Typography + token layer for the whole admin app */}
      <style>{`
        :root{
          --op-bg:#08080a; --op-surface:#101014; --op-surface2:#16161b;
          --op-line:#1f1f26; --op-line2:#2a2a33; --op-red:#d72026;
        }
        .font-heading{ font-family: var(--font-heading), "Barlow Condensed", system-ui, sans-serif; }
        .admin-app{ font-family: var(--font-body), "DM Sans", system-ui, sans-serif; }
        .admin-app ::-webkit-scrollbar{ width:8px; height:8px }
        .admin-app ::-webkit-scrollbar-thumb{ background:#24242c; border-radius:99px }
        .admin-app ::-webkit-scrollbar-track{ background:transparent }
        .admin-app input[type=date]::-webkit-calendar-picker-indicator{ filter:invert(.7) }
      `}</style>

      <div className="admin-app min-h-[100dvh] bg-[#08080a] text-[#e9e9ee] antialiased">

        {/* ── pull-to-refresh indicator ── */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-center"
          style={{
            height: Math.max(pull, refreshing ? 54 : 0),
            transition: pull === 0 ? "height .26s cubic-bezier(.2,.9,.25,1)" : "none",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          {(pull > 6 || refreshing) && (
            <div className="flex items-center gap-2 rounded-full border border-[#25252d] bg-[#101014] px-3.5 py-2 shadow-2xl">
              {refreshing ? <IcSpinner size={15} /> : (
                <span className="text-[13px] text-[#e5454a] transition-transform"
                  style={{ transform: `rotate(${pull >= 38 ? 180 : 0}deg)` }}>↓</span>
              )}
              <span className="text-[11.5px] font-semibold text-[#9a9aa5]">
                {refreshing ? "Се освежува…" : pull >= 38 ? "Пуштете за освежување" : "Влечете надолу"}
              </span>
            </div>
          )}
        </div>

        {/* ── desktop sidebar ── */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-[#1c1c23] bg-[#0b0b0e] lg:flex">
          <div className="flex items-center gap-3 px-5 py-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/admin-app/icon-192.png" alt="" width={38} height={38} className="rounded-[11px]" />
            <div className="leading-tight">
              <p className="font-heading text-[15px] font-bold uppercase tracking-[.12em] text-white">OP Admin</p>
              <p className="text-[10.5px] text-[#5a5a64]">Original Patosnici</p>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
            {ALL.map(({ t, label, icon: Ico }) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition ${
                  tab === t ? "bg-[#d72026] text-white" : "text-[#9a9aa5] hover:bg-[#141419] hover:text-white"}`}>
                <Ico size={18} /> {label}
              </button>
            ))}
          </nav>
          {show && (
            <div className="m-3 rounded-xl border border-[#25252d] bg-[#101014] p-3">
              <p className="text-[11.5px] font-semibold text-white">Инсталирај како апликација</p>
              <p className="mt-1 text-[10.5px] leading-snug text-[#6c6c78]">
                {ios ? "Safari → Сподели → Додај на почетен екран" : "Отвори ја како самостојна апликација."}
              </p>
              <div className="mt-2 flex gap-2">
                {!ios && deferred && <button onClick={install} className="rounded-lg bg-[#d72026] px-2.5 py-1.5 text-[11px] font-semibold text-white">Инсталирај</button>}
                <button onClick={dismiss} className="rounded-lg border border-[#25252d] px-2.5 py-1.5 text-[11px] text-[#8a8a95]">Подоцна</button>
              </div>
            </div>
          )}
        </aside>

        {/* ── main column ── */}
        <div className="lg:pl-[232px]">

          {/* header */}
          <header className="sticky top-0 z-20 border-b border-[#1c1c23] bg-[#08080a]/92 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-3 pt-[max(12px,env(safe-area-inset-top))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/admin-app/icon-192.png" alt="" width={30} height={30} className="rounded-[9px] lg:hidden" />
              <h1 className="font-heading text-[19px] font-bold uppercase tracking-[.1em] text-white">{current?.label ?? "OP Admin"}</h1>
              <div className="ml-auto flex items-center gap-2">
                {onNew && (
                  <IconBtn label="Ново" onClick={onNew} size={38} tone="red"><IcPlus size={18} /></IconBtn>
                )}
                <IconBtn label="Подесувања" onClick={() => setTab("settings")} size={38}><IcSettings size={18} /></IconBtn>
              </div>
            </div>
          </header>

          {/* install banner (mobile) */}
          {show && (
            <div className="flex items-start gap-3 border-b border-[#25252d] bg-[#101014] px-4 py-3 lg:hidden">
              <IcShare size={18} className="mt-0.5 shrink-0 text-[#d72026]" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-white">Инсталирај на iPhone</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-[#7c7c88]">
                  {ios
                    ? "Во Safari допрете Сподели, па „Додај на почетен екран“ — апликацијата ќе се отвора како вистинска."
                    : "Додај ја на почетниот екран за да се отвора како апликација."}
                </p>
                {!ios && deferred && (
                  <button onClick={install} className="mt-2 rounded-lg bg-[#d72026] px-3 py-1.5 text-[11.5px] font-semibold text-white">Инсталирај сега</button>
                )}
              </div>
              <button onClick={dismiss} aria-label="Затвори" className="shrink-0 p-1 text-[#5a5a64]"><IcX size={16} /></button>
            </div>
          )}

          {/* content */}
          <main className="px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-4 lg:px-7 lg:pb-12">
            {children}
          </main>
        </div>

        {/* ── mobile tab bar ── */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#1c1c23] bg-[#0b0b0e]/96 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-5 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
            {PRIMARY.map(({ t, label, icon: Ico }) => {
              const on = tab === t;
              return (
                <button key={t} onClick={() => setTab(t)} aria-current={on ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 rounded-xl py-1.5 transition ${on ? "text-[#e5454a]" : "text-[#6c6c78]"}`}>
                  <Ico size={22} />
                  <span className="text-[10px] font-semibold tracking-tight">{label}</span>
                  <span className={`h-[3px] w-5 rounded-full transition ${on ? "bg-[#d72026]" : "bg-transparent"}`} />
                </button>
              );
            })}
            <button onClick={() => setMoreOpen(true)}
              className={`flex flex-col items-center gap-1 rounded-xl py-1.5 transition ${!isPrimary ? "text-[#e5454a]" : "text-[#6c6c78]"}`}>
              <IcLayers size={22} />
              <span className="text-[10px] font-semibold tracking-tight">Повеќе</span>
              <span className={`h-[3px] w-5 rounded-full transition ${!isPrimary ? "bg-[#d72026]" : "bg-transparent"}`} />
            </button>
          </div>
        </nav>

        {/* ── "more" sheet ── */}
        <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Повеќе">
          <div className="space-y-2">
            {SECONDARY.map(({ t, label, desc, icon: Ico }) => (
              <button key={t} onClick={() => { setTab(t); setMoreOpen(false); }}
                className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition active:scale-[.985] ${
                  tab === t ? "border-[#d72026] bg-[#1a0e10]" : "border-[#1f1f26] bg-[#101014]"}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16161b] text-[#e5454a]"><Ico size={21} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-white">{label}</span>
                  <span className="block text-[11.5px] text-[#6c6c78]">{desc}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-[#1f1f26] bg-[#0c0c0f] p-4">
            <p className="font-heading text-[13px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">За апликацијата</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#6c6c78]">
              OP Admin работи самостојно, без интернет меморија за податоци — секогаш прикажува точна состојба.
            </p>
          </div>
        </Sheet>
      </div>
    </>
  );
}
