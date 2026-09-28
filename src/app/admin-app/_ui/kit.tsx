"use client";

/**
 * Design kit for the admin app.
 *
 * Aesthetic: industrial precision. Deep charcoal, one brand-red accent,
 * hairline borders, condensed numerals for data. Tap targets are ≥44px and
 * every surface respects the iPhone safe area.
 *
 * Icons are hand-rolled SVG so the app stays independent of the icon package
 * version and ships nothing unused.
 */

import { ReactNode, useEffect, useRef, useState } from "react";
import { cx } from "../_lib/core";

/* ── icons ─────────────────────────────────────────────────────────── */

type IP = { size?: number; className?: string };
const S = ({ size = 20, className, children }: IP & { children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
       className={className} aria-hidden="true">{children}</svg>
);

export const IcHome = (p: IP) => <S {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></S>;
export const IcOrders = (p: IP) => <S {...p}><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 17h4.5"/></S>;
export const IcBox = (p: IP) => <S {...p}><path d="M12 2.8 21 7v10l-9 4.2L3 17V7Z"/><path d="M3 7l9 4.2L21 7"/><path d="M12 11.2V21"/></S>;
export const IcLayers = (p: IP) => <S {...p}><path d="M12 3 3 7.5l9 4.5 9-4.5Z"/><path d="M3 12.5 12 17l9-4.5"/><path d="M3 17 12 21.5 21 17"/></S>;
export const IcSpark = (p: IP) => <S {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></S>;
export const IcImage = (p: IP) => <S {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3 16 5-4 4 3 3-2.5 6 5"/></S>;
export const IcChart = (p: IP) => <S {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></S>;
export const IcSettings = (p: IP) => <S {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 2.6 14H2.4a2 2 0 1 1 0-4h.2A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 2.6V2.4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1.1Z"/></S>;
export const IcSearch = (p: IP) => <S {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></S>;
export const IcPlus = (p: IP) => <S {...p}><path d="M12 5v14M5 12h14"/></S>;
export const IcMinus = (p: IP) => <S {...p}><path d="M5 12h14"/></S>;
export const IcPencil = (p: IP) => <S {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></S>;
export const IcTrash = (p: IP) => <S {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v6M14 11v6"/></S>;
export const IcX = (p: IP) => <S {...p}><path d="M18 6 6 18M6 6l12 12"/></S>;
export const IcCheck = (p: IP) => <S {...p}><path d="M20 6 9 17l-5-5"/></S>;
export const IcLeft = (p: IP) => <S {...p}><path d="m15 18-6-6 6-6"/></S>;
export const IcRight = (p: IP) => <S {...p}><path d="m9 18 6-6-6-6"/></S>;
export const IcDown = (p: IP) => <S {...p}><path d="m6 9 6 6 6-6"/></S>;
export const IcUp = (p: IP) => <S {...p}><path d="m18 15-6-6-6 6"/></S>;
export const IcDownLoad = (p: IP) => <S {...p}><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/></S>;
export const IcUpload = (p: IP) => <S {...p}><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 21h16"/></S>;
export const IcRefresh = (p: IP) => <S {...p}><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></S>;
export const IcLogout = (p: IP) => <S {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></S>;
export const IcLock = (p: IP) => <S {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></S>;
export const IcPhone = (p: IP) => <S {...p}><path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/></S>;
export const IcMail = (p: IP) => <S {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></S>;
export const IcPin = (p: IP) => <S {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></S>;
export const IcTruck = (p: IP) => <S {...p}><path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7z"/><circle cx="7" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/></S>;
export const IcClock = (p: IP) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></S>;
export const IcAlert = (p: IP) => <S {...p}><path d="M12 3 2 20h20Z"/><path d="M12 9v5M12 17.5v.5"/></S>;
export const IcInfo = (p: IP) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/></S>;
export const IcShare = (p: IP) => <S {...p}><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></S>;
export const IcStar = (p: IP) => <S {...p}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/></S>;
export const IcTag = (p: IP) => <S {...p}><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.4"/></S>;

export function IcSpinner({ size = 18, className }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cx("animate-spin", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity=".22" fill="none"/>
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── surfaces ──────────────────────────────────────────────────────── */

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick}
      className={cx("rounded-2xl border border-[#1f1f26] bg-[#101014]",
        onClick && "cursor-pointer transition active:scale-[.985] active:bg-[#15151a]", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <h2 className="font-heading text-[15px] font-semibold uppercase tracking-[.14em] text-[#6c6c78]">{children}</h2>
      {action}
    </div>
  );
}

/* ── stat ──────────────────────────────────────────────────────────── */

export function Stat({ label, value, sub, tone = "default", icon, onClick }: {
  label: string; value: ReactNode; sub?: ReactNode;
  tone?: "default" | "ok" | "warn" | "info" | "red"; icon?: ReactNode; onClick?: () => void;
}) {
  const color = { default: "text-[#e9e9ee]", ok: "text-[#5fc48f]", warn: "text-[#e0b04a]", info: "text-[#6fa3e0]", red: "text-[#e5454a]" }[tone];
  return (
    <Card onClick={onClick} className="p-3.5">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">
        {icon}{label}
      </div>
      <div className={cx("mt-1.5 font-heading text-[27px] font-bold leading-none tabular-nums", color)}>{value}</div>
      {sub && <div className="mt-1.5 text-[11.5px] leading-tight text-[#8a8a95]">{sub}</div>}
    </Card>
  );
}

export function Pill({ children, tone = "neutral", className }: {
  children: ReactNode; tone?: "neutral" | "ok" | "warn" | "info" | "red" | "muted"; className?: string;
}) {
  const map = {
    neutral: "border-[#2a2a33] text-[#a8a8b2]",
    muted: "border-[#22222a] text-[#6c6c78]",
    ok: "border-[#2c5c43] bg-[#12241a] text-[#5fc48f]",
    warn: "border-[#5c4a1e] bg-[#241d10] text-[#e0b04a]",
    info: "border-[#2c4a6b] bg-[#101d2a] text-[#6fa3e0]",
    red: "border-[#5c2024] bg-[#240f11] text-[#e5454a]",
  }[tone];
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[.08em]", map, className)}>
      {children}
    </span>
  );
}

/* ── buttons ───────────────────────────────────────────────────────── */

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, loading, className, type = "button" }: {
  children: ReactNode; onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "ok" | "danger"; size?: "sm" | "md" | "lg";
  disabled?: boolean; loading?: boolean; className?: string; type?: "button" | "submit";
}) {
  const v = {
    primary: "bg-[#d72026] text-white hover:bg-[#bf1c22] active:bg-[#a8181d]",
    ok: "bg-[#2b6b48] text-white hover:bg-[#25603f]",
    danger: "border border-[#5c2024] text-[#e5454a] hover:bg-[#240f11]",
    outline: "border border-[#2a2a33] text-[#c9c9d1] hover:border-[#3a3a46] hover:text-white",
    ghost: "text-[#a8a8b2] hover:bg-[#16161b] hover:text-white",
  }[variant];
  const s = { sm: "h-9 px-3 text-[12.5px]", md: "h-11 px-4 text-[13.5px]", lg: "h-13 px-5 text-[15px]" }[size];
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={cx("inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-45",
        v, s, className)}>
      {loading && <IcSpinner size={15} />}
      {children}
    </button>
  );
}

export function IconBtn({ children, onClick, label, tone = "neutral", size = 40 }: {
  children: ReactNode; onClick?: () => void; label: string;
  tone?: "neutral" | "red" | "ok" | "info"; size?: number;
}) {
  const c = { neutral: "text-[#8a8a95] border-[#25252d]", red: "text-[#e5454a] border-[#4a1d21]", ok: "text-[#5fc48f] border-[#2c5c43]", info: "text-[#6fa3e0] border-[#2c4a6b]" }[tone];
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      style={{ width: size, height: size }}
      className={cx("inline-flex shrink-0 items-center justify-center rounded-xl border transition active:scale-95", c)}>
      {children}
    </button>
  );
}

/* ── form ──────────────────────────────────────────────────────────── */

const FIELD = "w-full rounded-xl border border-[#25252d] bg-[#0c0c0f] px-3.5 py-3 text-[15px] text-white outline-none transition placeholder:text-[#4e4e58] focus:border-[#d72026]";

export function Field({ label, hint, children }: { label?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">{label}</span>}
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-[#5a5a64]">{hint}</span>}
    </label>
  );
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(FIELD, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(FIELD, "resize-none", props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(FIELD, "appearance-none bg-[#0c0c0f]", props.className)} />;
}

/* ── bottom sheet / modal ──────────────────────────────────────────── */

export function Sheet({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", esc); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] animate-[fade_.18s_ease-out]" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-[#25252d] bg-[#0e0e12] sm:max-w-lg sm:rounded-3xl animate-[slideUp_.24s_cubic-bezier(.2,.9,.25,1)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#1c1c23] px-4 py-3.5">
          <h3 className="font-heading text-[17px] font-semibold uppercase tracking-[.1em] text-white">{title}</h3>
          <IconBtn label="Затвори" onClick={onClose} size={36}><IcX size={17} /></IconBtn>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        {footer && <div className="border-t border-[#1c1c23] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
      <style>{`
        @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(14px); opacity: .6 } to { transform: translateY(0); opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .animate-\[slideUp_\.24s_cubic-bezier\(\.2\,\.9\,\.25\,1\)\] { animation: none } }
      `}</style>
    </div>
  );
}

/* ── states ────────────────────────────────────────────────────────── */

export function Empty({ icon, title, sub, action }: { icon?: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-3 text-[#2f2f38]">{icon}</div>}
      <p className="font-heading text-[17px] font-semibold uppercase tracking-[.1em] text-[#7c7c88]">{title}</p>
      {sub && <p className="mt-1.5 max-w-[34ch] text-[12.5px] text-[#5a5a64]">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toaster({ toasts, onDismiss }: { toasts: Array<{ id: number; msg: string; ok: boolean }>; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((t) => (
        <button key={t.id} onClick={() => onDismiss(t.id)}
          style={{ animation: "toastIn .22s cubic-bezier(.2,.9,.25,1)" }}
          className={cx("pointer-events-auto flex max-w-[92vw] items-center gap-2.5 rounded-2xl border px-4 py-3 text-[13px] font-semibold shadow-2xl",
            t.ok ? "border-[#2c5c43] bg-[#12241a] text-[#8fe0b2]" : "border-[#5c2024] bg-[#240f11] text-[#f0a2a5]")}>
          {t.ok ? <IcCheck size={16} /> : <IcAlert size={16} />}
          {t.msg}
        </button>
      ))}
      <style>{`@keyframes toastIn { from { transform: translateY(-10px); opacity: 0 } to { transform: none; opacity: 1 } }
        @media (prefers-reduced-motion: reduce){ [style*="toastIn"]{ animation:none } }`}</style>
    </div>
  );
}

/* ── charts (hand-rolled SVG, no library) ──────────────────────────── */

export function Spark({ data, height = 44, tone = "#d72026" }: { data: number[]; height?: number; tone?: string }) {
  const w = 260;
  if (!data.length) return <div style={{ height }} />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const pts = data.map((v, i) => [i * step, height - ((v - min) / span) * (height - 6) - 3] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${height} L0 ${height} Z`;
  const id = `sp${tone.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity=".34" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={tone} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Bars({ items, max, tone = "#d72026" }: {
  items: Array<{ label: string; value: number }>; max?: number; tone?: string;
}) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2.5">
          <span className="w-[52px] shrink-0 truncate text-right text-[11px] text-[#7c7c88]">{it.label}</span>
          <div className="h-[26px] flex-1 overflow-hidden rounded-lg bg-[#14141a]">
            <div className="h-full rounded-lg transition-[width] duration-500"
                 style={{ width: `${Math.max((it.value / top) * 100, it.value ? 3 : 0)}%`, background: tone, opacity: .85 }} />
          </div>
          <span className="w-[62px] shrink-0 text-right font-heading text-[14px] font-bold tabular-nums text-[#e9e9ee]">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── segmented control ─────────────────────────────────────────────── */

export function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: Array<{ v: T; label: string }>;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(options.findIndex((o) => o.v === value));
  useEffect(() => { setIdx(options.findIndex((o) => o.v === value)); }, [value, options]);

  return (
    <div ref={wrap} className="relative flex rounded-xl border border-[#25252d] bg-[#0c0c0f] p-[3px]">
      <span className="absolute inset-y-[3px] rounded-[10px] bg-[#d72026] transition-transform duration-200"
        style={{ width: `calc((100% - 6px) / ${options.length})`, transform: `translateX(calc(${Math.max(idx, 0)} * 100%))`, left: 3 }} />
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)}
          className={cx("relative z-10 flex-1 rounded-[10px] px-2 py-2 text-[12px] font-semibold uppercase tracking-[.06em] transition",
            value === o.v ? "text-white" : "text-[#7c7c88]")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
