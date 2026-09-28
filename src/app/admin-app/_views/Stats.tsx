"use client";

/**
 * Stats — best sellers over any period, ranked by pieces sold.
 *
 * Quantity comes from every order item (not the number of orders), and the
 * exact same endpoint powers the Excel export, so the file always matches
 * what is on screen.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORY_LABEL, Category, money, toCsv, download, cx } from "../_lib/core";
import { useAdmin } from "../_lib/store";
import {
  Card, SectionTitle, Stat, Pill, Btn, IconBtn, Input, Field,
  Segmented, Empty, IcSpinner, IcSearch, IcX, IcDownLoad, IcStar, IcChart, IcRefresh,
} from "../_ui/kit";

type Row = { rank: number; sku: string; title: string; brand: string; category: string; quantity: number; total: number };

const MEDAL = ["#e0b04a", "#b9b9c4", "#b5793f"];

export function StatsView() {
  const { bestSellers, toast } = useAdmin();
  const [period, setPeriod] = useState<"all" | "range">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);
  const [q, setQ] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const data = await bestSellers(period === "range" ? { from: from || undefined, to: to || undefined } : undefined);
    setRows(data);
    setBusy(false);
  }, [bestSellers, period, from, to]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [period, from, to]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return rows;
    return rows.filter((r) =>
      `${r.sku} ${r.title} ${r.brand}`.toLowerCase().includes(n));
  }, [rows, q]);

  const totals = useMemo(() => ({
    qty: filtered.reduce((s, r) => s + r.quantity, 0),
    value: filtered.reduce((s, r) => s + r.total, 0),
  }), [filtered]);

  const exportXlsx = async () => {
    setExporting(true);
    try {
      const pw = localStorage.getItem("adminPw") ?? sessionStorage.getItem("adminPw") ?? "";
      const p = new URLSearchParams({ format: "xlsx" });
      if (period === "range") { if (from) p.set("from", from); if (to) p.set("to", to); }
      if (q.trim()) p.set("q", q.trim());
      const res = await fetch(`/api/admin/products/best-sellers?${p}`, { headers: { "x-admin-password": pw } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "najprodavani.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast("Excel е подготвен");
    } catch { toast("Грешка при експорт", false); }
    setExporting(false);
  };

  const exportCsv = () => {
    if (!filtered.length) { toast("Нема што да се извезе", false); return; }
    download("najprodavani.csv", toCsv(filtered.map((r) => ({
      Ранг: r.rank, SKU: r.sku, Назив: r.title, Бренд: r.brand,
      Категорија: CATEGORY_LABEL[r.category as Category] ?? r.category,
      Количина: r.quantity, Вкупно: r.total,
    }))));
    toast("CSV е подготвен");
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-3.5">
        <Segmented value={period} onChange={setPeriod}
          options={[{ v: "all" as const, label: "Цела продажба" }, { v: "range" as const, label: "Период" }]} />

        {period === "range" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Од"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="До"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>
        )}

        <div className="relative">
          <IcSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4e4e58]" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пребарај по SKU, назив или бренд…" className="pl-9" />
          {q && <button onClick={() => setQ("")} aria-label="Исчисти" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5a5a64]"><IcX size={15} /></button>}
        </div>

        <div className="flex gap-2">
          <Btn variant="outline" className="flex-1" onClick={load} disabled={busy}>
            {busy ? <IcSpinner size={15} /> : <IcRefresh size={15} />} Освежи
          </Btn>
          <Btn variant="outline" onClick={exportCsv}><IcDownLoad size={15} /> CSV</Btn>
          <Btn variant="ok" loading={exporting} onClick={exportXlsx}><IcDownLoad size={15} /> Excel</Btn>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Производи" value={filtered.length} icon={<IcChart size={13} />} />
        <Stat label="Продадено" value={totals.qty} tone="info" sub="парчиња" />
        <Stat label="Вредност" value={money(totals.value, "MKD", true)} tone="ok" sub="во денари" />
      </div>

      {busy ? (
        <div className="flex justify-center py-20 text-[#d72026]"><IcSpinner size={26} /></div>
      ) : filtered.length === 0 ? (
        <Card><Empty icon={<IcStar size={34} />}
          title={q ? "Нема резултати" : "Нема продажби"}
          sub={q ? `Ништо не одговара на „${q}“.` : "За избраниот период нема продадени производи."} /></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={`${r.sku}-${r.rank}`} className="flex items-center gap-3 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-heading text-[15px] font-bold tabular-nums"
                style={{
                  background: r.rank <= 3 ? MEDAL[r.rank - 1] : "#16161b",
                  color: r.rank <= 3 ? "#0b0b0e" : "#8a8a95",
                }}>
                {r.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-white">{r.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {r.sku && <span className="rounded-md bg-[#16161b] px-1.5 py-0.5 font-mono text-[10px] text-[#8a8a95]">{r.sku}</span>}
                  {r.brand && r.brand !== "—" && <Pill tone="muted">{r.brand}</Pill>}
                  {r.category && CATEGORY_LABEL[r.category as Category] && (
                    <span className="text-[10px] text-[#5a5a64]">{CATEGORY_LABEL[r.category as Category]}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-heading text-[19px] font-bold leading-none tabular-nums text-white">{r.quantity}</p>
                <p className="mt-0.5 text-[10px] text-[#5a5a64]">парчиња</p>
                <p className="mt-1 text-[11px] font-semibold tabular-nums text-[#e5454a]">{money(r.total, "MKD", true)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
