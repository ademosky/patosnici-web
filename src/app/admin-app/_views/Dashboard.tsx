"use client";

/**
 * Dashboard — the first thing you see.
 *
 * Answers, in order: what needs action now, how the day is going, and how the
 * month is tracking. Revenue is normalised to MKD because the three
 * storefronts price in different currencies.
 */

import { useMemo } from "react";
import {
  Order, Product, money, orderTotal, orderTotalMkd, orderPieces, orderCurrency,
  skopjeDate, today, relTime, STATUS_LABEL, CATEGORY_SHORT, categoryOf, prettyDate,
} from "../_lib/core";
import { useAdmin } from "../_lib/store";
import {
  Card, SectionTitle, Stat, Pill, Bars, Spark, Btn, Empty,
  IcOrders, IcBox, IcTruck, IcAlert, IcClock, IcStar, IcRight, IcPhone, IcSpinner,
} from "../_ui/kit";
import type { Tab } from "../_ui/Shell";

export function Dashboard({ goto }: { goto: (t: Tab) => void }) {
  const { orders, products, inventory, loading, month } = useAdmin();

  const d = useMemo(() => {
    const t = today();
    const todays = orders.filter((o) => o.created_at && skopjeDate(o.created_at) === t);
    const pending = orders.filter((o) => o.status === "new");
    const inProcess = orders.filter((o) => o.status === "in_process");
    const sent = orders.filter((o) => o.status === "sent");

    // Exact: every line stores its MKD base price, so this needs no conversion.
    const rev = (list: Order[]) => list.reduce((s, o) => s + orderTotalMkd(o), 0);

    // last 14 days, oldest → newest
    const days: Array<{ key: string; label: string; count: number; revenue: number }> = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const dt = new Date(now.getTime() - i * 86400000);
      const key = skopjeDate(dt.toISOString());
      const list = orders.filter((o) => o.created_at && skopjeDate(o.created_at) === key);
      days.push({ key, label: prettyDate(dt.toISOString()), count: list.length, revenue: rev(list) });
    }

    // best sellers inside the loaded month
    const tally = new Map<string, { title: string; qty: number; category: string }>();
    for (const o of orders) {
      if (o.items && o.items.length) {
        for (const it of o.items) {
          const k = (it.sku || it.title || "").trim();
          if (!k) continue;
          const cur = tally.get(k) || { title: it.title || k, qty: 0, category: "" };
          cur.qty += it.quantity || 1;
          tally.set(k, cur);
        }
      } else if (o.product_title) {
        const k = (o.product_sku || o.product_title).trim();
        const cur = tally.get(k) || { title: o.product_title, qty: 0, category: "" };
        cur.qty += 1;
        tally.set(k, cur);
      }
    }
    const productBySku = new Map(products.map((p) => [String(p.sku || "").trim(), p]));
    const productByTitle = new Map(products.map((p) => [String(p.title || "").trim(), p]));
    const top = [...tally.entries()]
      .map(([k, v]) => {
        const p = productBySku.get(k) || productByTitle.get(v.title);
        return { ...v, category: p ? categoryOf(p) : null };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // stock alerts — inventory entries that are running out
    const low = [...inventory].filter((i) => i.quantity <= 2).sort((a, b) => a.quantity - b.quantity);
    const outOfStock = products.filter((p) => p.in_stock === false).length;

    return {
      todays, pending, inProcess, sent, days, top, low, outOfStock,
      todayCount: todays.length,
      todayPieces: todays.reduce((s, o) => s + orderPieces(o), 0),
      todayRevenue: rev(todays),
      monthRevenue: rev(orders),
      avg: orders.length ? Math.round(rev(orders) / orders.length) : 0,
      newProducts: products.filter((p) => p.category === undefined || p.category === null).length,
    };
  }, [orders, products, inventory]);

  if (loading && !orders.length) {
    return <div className="flex justify-center py-24 text-[#d72026]"><IcSpinner size={26} /></div>;
  }

  const maxDaily = Math.max(...d.days.map((x) => x.count), 1);

  return (
    <div className="space-y-6">
      {/* ── today ── */}
      <section>
        <SectionTitle action={<span className="text-[11px] text-[#5a5a64]">{prettyDate(new Date().toISOString())}</span>}>
          Денес
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <Stat label="Нарачки" value={d.todayCount} icon={<IcOrders size={13} />}
                sub={d.todayCount ? `пред ${relTime(d.todays[0].created_at)}` : "нема денес"} />
          <Stat label="Парчиња" value={d.todayPieces} icon={<IcBox size={13} />} tone="info" />
          <Stat label="Приход" value={money(d.todayRevenue, "MKD", true)} tone="ok" icon={<IcStar size={13} />}
                sub="нормализирано во ден" />
          <Stat label="Чекаат" value={d.pending.length} tone={d.pending.length ? "warn" : "default"}
                icon={<IcClock size={13} />} onClick={() => goto("orders")}
                sub={d.pending.length ? "за обработка" : "сè е обработено"} />
        </div>
      </section>

      {/* ── needs action ── */}
      {(d.pending.length > 0 || d.low.length > 0 || d.outOfStock > 0) && (
        <section>
          <SectionTitle>Бара внимание</SectionTitle>
          <div className="space-y-2.5">
            {d.pending.length > 0 && (
              <Card onClick={() => goto("orders")} className="flex items-center gap-3.5 p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#241d10] text-[#e0b04a]"><IcClock size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white">{d.pending.length} {d.pending.length === 1 ? "нова нарачка" : "нови нарачки"}</p>
                  <p className="truncate text-[11.5px] text-[#6c6c78]">
                    {d.pending.slice(0, 2).map((o) => `${o.name} ${o.surname}`).join(" · ")}
                  </p>
                </div>
                <IcRight size={17} className="shrink-0 text-[#4e4e58]" />
              </Card>
            )}
            {(d.low.length > 0 || d.outOfStock > 0) && (
              <Card onClick={() => goto("stock")} className="flex items-center gap-3.5 p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#240f11] text-[#e5454a]"><IcAlert size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white">
                    {d.low.length ? `${d.low.length} ${d.low.length === 1 ? "ставка" : "ставки"} со ниска залиха` : "Производи без залиха"}
                  </p>
                  <p className="truncate text-[11.5px] text-[#6c6c78]">
                    {d.low.length ? d.low.slice(0, 3).map((i) => i.name).join(" · ") : `${d.outOfStock} производи означени како „нема залиха“`}
                  </p>
                </div>
                <IcRight size={17} className="shrink-0 text-[#4e4e58]" />
              </Card>
            )}
          </div>
        </section>
      )}

      {/* ── trend ── */}
      <section>
        <SectionTitle action={<span className="text-[11px] text-[#5a5a64]">последни 14 дена</span>}>Тренд</SectionTitle>
        <Card className="p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Нарачки</p>
              <p className="font-heading text-[26px] font-bold leading-none tabular-nums text-white">{d.days.reduce((s, x) => s + x.count, 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Приход</p>
              <p className="font-heading text-[26px] font-bold leading-none tabular-nums text-[#5fc48f]">
                {money(d.days.reduce((s, x) => s + x.revenue, 0), "MKD", true)}
              </p>
            </div>
          </div>
          <div className="mt-3"><Spark data={d.days.map((x) => x.count)} /></div>
          <div className="mt-2 flex justify-between text-[10px] text-[#4e4e58]">
            <span>{d.days[0]?.label}</span>
            <span>{d.days[d.days.length - 1]?.label}</span>
          </div>
        </Card>
      </section>

      {/* ── month ── */}
      <section>
        <SectionTitle action={<span className="text-[11px] text-[#5a5a64]">{month}</span>}>Овој месец</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Нарачки" value={orders.length} />
          <Stat label="Приход" value={money(d.monthRevenue, "MKD", true)} tone="ok" />
          <Stat label="Просек" value={money(d.avg, "MKD", true)} tone="info" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Pill tone="ok"><IcTruck size={11} /> {d.sent.length} испратени</Pill>
          <Pill tone="info"><IcClock size={11} /> {d.inProcess.length} во процес</Pill>
          <Pill tone="warn"><IcOrders size={11} /> {d.pending.length} нови</Pill>
        </div>
      </section>

      {/* ── top products ── */}
      <section>
        <SectionTitle action={<button onClick={() => goto("stats")} className="text-[11.5px] font-semibold text-[#e5454a]">Сите →</button>}>
          Најпродавани во {month}
        </SectionTitle>
        <Card className="p-4">
          {d.top.length ? (
            <Bars items={d.top.map((t) => ({ label: t.title.length > 12 ? t.title.slice(0, 12) + "…" : t.title, value: t.qty }))} />
          ) : (
            <p className="py-6 text-center text-[12.5px] text-[#5a5a64]">Нема податоци за овој месец</p>
          )}
        </Card>
      </section>

      {/* ── recent ── */}
      <section>
        <SectionTitle action={<button onClick={() => goto("orders")} className="text-[11.5px] font-semibold text-[#e5454a]">Сите →</button>}>
          Последни нарачки
        </SectionTitle>
        {orders.length === 0 ? (
          <Card><Empty icon={<IcOrders size={34} />} title="Нема нарачки" sub="Нарачките за овој месец ќе се појават тука." /></Card>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <Card key={o.id} onClick={() => goto("orders")} className="flex items-center gap-3 p-3">
                <span className={`h-9 w-1 shrink-0 rounded-full ${
                  o.status === "new" ? "bg-[#e0b04a]" : o.status === "in_process" ? "bg-[#6fa3e0]" : "bg-[#5fc48f]"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-white">{o.name} {o.surname}</p>
                  <p className="truncate text-[11px] text-[#6c6c78]">
                    {o.items?.length
                      ? o.items.map((i) => `${i.quantity}× ${i.title}`).join(", ")
                      : o.product_title}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-[14px] font-bold tabular-nums text-[#e9e9ee]">
                    {money(orderTotal(o), orderCurrency(o))}
                  </p>
                  <p className="text-[10px] text-[#5a5a64]">{relTime(o.created_at)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
