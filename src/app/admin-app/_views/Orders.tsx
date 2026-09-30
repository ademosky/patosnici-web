"use client";

/**
 * Orders — the module with the most daily interaction.
 *
 * Status changes are optimistic: the card updates instantly, the request
 * happens behind it, and a failure rolls the card back. No reload, no refetch,
 * no lost scroll position.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Order, OrderItem, OrderStatus, Currency,
  money, orderTotal, orderPieces, orderCurrency, unitValue,
  skopjeDate, today, relTime, prettyDateTime, monthKey, orderSkus, orderLines,
  STATUS_LABEL, CURRENCY_LABEL, toCsv, download, cx,
} from "../_lib/core";
import { useAdmin } from "../_lib/store";
import {
  Card, SectionTitle, Stat, Pill, Btn, IconBtn, Sheet, Field, Input, Select, Textarea,
  Segmented, Empty, IcSpinner, IcSearch, IcX, IcPlus, IcMinus, IcPencil, IcTrash,
  IcPhone, IcMail, IcPin, IcDownLoad, IcLeft, IcRight, IcRefresh, IcClock, IcCheck, IcOrders, IcTag,
} from "../_ui/kit";

const MONTH_NAMES = ["јан","фев","мар","апр","мај","јун","јул","авг","сеп","окт","ное","дек"];
function monthLabel(m: string) {
  const [y, mm] = m.split("-");
  return `${MONTH_NAMES[Number(mm) - 1]} ${y}`;
}
function shiftMonth(m: string, delta: number) {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mm - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function OrdersView({ openNew, onNewClosed }: { openNew: boolean; onNewClosed: () => void }) {
  const {
    orders, month, setMonth, loading, toast,
    setOrderStatus, patchOrder, removeOrder, addOrder, exportOrders,
  } = useAdmin();

  const [status, setStatus] = useState<OrderStatus | "">("");
  const [cur, setCur] = useState<Currency | "">("");
  const [day, setDay] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);

  // keep the open detail sheet in sync with store updates
  useEffect(() => {
    if (!detail) return;
    const fresh = orders.find((o) => o.id === detail.id);
    if (fresh && fresh !== detail) setDetail(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (day && (!o.created_at || skopjeDate(o.created_at) !== day)) return false;
      if (status && o.status !== status) return false;
      if (cur && orderCurrency(o) !== cur) return false;
      if (needle) {
        const hay = [
          o.name, o.surname, o.phone, o.city, o.product_title, o.product_sku,
          ...(o.items ?? []).flatMap((i) => [i.title, i.sku]),
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [orders, day, status, cur, q]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, o) => s + orderTotal(o), 0);
    return {
      count: filtered.length,
      pieces: filtered.reduce((s, o) => s + orderPieces(o), 0),
      byCur: (["MKD", "EUR", "ALL"] as Currency[])
        .map((c) => ({ c, n: filtered.filter((o) => orderCurrency(o) === c).length }))
        .filter((x) => x.n > 0),
    };
  }, [filtered]);

  const active = status || cur || day || q;

  const change = async (id: number, s: OrderStatus) => {
    setBusyId(id);
    await setOrderStatus(id, s);
    setBusyId(null);
  };

  const exportCsv = () => {
    const rows = filtered.map((o) => ({
      ID: o.id,
      Датум: o.created_at ? prettyDateTime(o.created_at) : "",
      Статус: STATUS_LABEL[o.status],
      Име: `${o.name} ${o.surname}`,
      Телефон: o.phone,
      Град: o.city ?? "",
      Адреса: o.address ?? "",
      SKU: orderSkus(o).join(" | "),
      Производи: (o.items?.length
        ? o.items.map((i) => `${i.quantity}× ${i.title}${i.sku ? ` (${i.sku})` : ""}`).join(" | ")
        : `${o.product_title ?? ""}${o.product_sku ? ` (${o.product_sku})` : ""}`),
      Валута: orderCurrency(o),
      Вкупно: orderTotal(o),
    }));
    if (!rows.length) { toast("Нема што да се извезе", false); return; }
    download(`naracki-${day || month}.csv`, toCsv(rows));
    toast(`${rows.length} нарачки извезени`);
  };

  return (
    <div className="space-y-4">
      {/* ── month nav ── */}
      <div className="flex items-center gap-2">
        <IconBtn label="Претходен месец" onClick={() => { setMonth(shiftMonth(month, -1)); setDay(""); }}><IcLeft size={18} /></IconBtn>
        <button onClick={() => { setMonth(monthKey()); setDay(""); }}
          className="font-heading flex-1 rounded-xl border border-[#1f1f26] bg-[#101014] py-2.5 text-[15px] font-semibold uppercase tracking-[.12em] text-white">
          {monthLabel(month)}
        </button>
        <IconBtn label="Следен месец" onClick={() => { setMonth(shiftMonth(month, 1)); setDay(""); }}><IcRight size={18} /></IconBtn>
      </div>

      {/* ── filters ── */}
      <Card className="space-y-3 p-3.5">
        <Segmented value={status} onChange={(v) => setStatus(v as OrderStatus | "")}
          options={[
            { v: "" as const, label: "Сите" },
            { v: "new" as const, label: "Нови" },
            { v: "in_process" as const, label: "Процес" },
            { v: "sent" as const, label: "Пратени" },
          ]} />

        {/* Search — full width, tall tap target */}
        <div className="relative">
          <IcSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4e4e58]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пребарај: име, телефон, SKU, град…"
            className="h-[52px] pl-11 pr-11 text-[15px]"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Исчисти"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#5a5a64] active:scale-90">
              <IcX size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setCur(cur === "MKD" ? "" : "MKD")}
            className={cx("rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
              cur === "MKD" ? "border-[#d72026] bg-[#1a0e10] text-white" : "border-[#25252d] text-[#8a8a95]")}>
            {CURRENCY_LABEL.MKD}
          </button>
          <button onClick={() => setCur(cur === "EUR" ? "" : "EUR")}
            className={cx("rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
              cur === "EUR" ? "border-[#d72026] bg-[#1a0e10] text-white" : "border-[#25252d] text-[#8a8a95]")}>
            {CURRENCY_LABEL.EUR}
          </button>
          <button onClick={() => setCur(cur === "ALL" ? "" : "ALL")}
            className={cx("rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
              cur === "ALL" ? "border-[#d72026] bg-[#1a0e10] text-white" : "border-[#25252d] text-[#8a8a95]")}>
            {CURRENCY_LABEL.ALL}
          </button>

          <div className="ml-auto flex gap-2">
            <IconBtn label="Освежи" onClick={() => setMonth(month)}><IcRefresh size={17} /></IconBtn>
            <IconBtn label="Извези CSV" onClick={exportCsv}><IcDownLoad size={17} /></IconBtn>
            <IconBtn label="Извези Excel" tone="ok"
              onClick={async () => { setExporting(true); await exportOrders(month); setExporting(false); }}>
              {exporting ? <IcSpinner size={16} /> : <IcDownLoad size={17} />}
            </IconBtn>
          </div>
        </div>

        {/* Day filter — sits under the currency row, deliberately compact */}
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#5a5a64]">Ден</span>
          <Input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="h-9 w-[150px] py-0 text-[12.5px]"
          />
          {day && (
            <button onClick={() => setDay("")} aria-label="Исчисти датум"
              className="rounded-lg border border-[#25252d] px-2.5 py-2 text-[11px] font-semibold text-[#8a8a95] active:scale-95">
              <IcX size={13} />
            </button>
          )}
        </div>
      </Card>

      {/* ── summary ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Нарачки" value={totals.count} />
          <Stat label="Парчиња" value={totals.pieces} tone="info" />
          <Stat label="Различни" value={totals.byCur.length} sub={totals.byCur.map((x) => x.c).join(" · ")} />
        </div>
      )}

      {/* ── list ── */}
      {loading && !orders.length ? (
        <div className="flex justify-center py-20 text-[#d72026]"><IcSpinner size={26} /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Empty icon={<IcOrders size={34} />}
            title={active ? "Нема резултати" : "Нема нарачки"}
            sub={active ? "Пробај со друг филтер или период." : `Нема нарачки во ${monthLabel(month)}.`}
            action={active ? <Btn variant="outline" onClick={() => { setStatus(""); setCur(""); setDay(""); setQ(""); }}>Исчисти филтри</Btn> : undefined} />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const c = orderCurrency(o);
            const busy = busyId === o.id;
            const skus = orderSkus(o);
            return (
              <Card key={o.id} className="overflow-hidden">
                <button onClick={() => setDetail(o)} className="flex w-full items-start gap-3 p-3.5 text-left">
                  <span className={cx("mt-1 h-10 w-1 shrink-0 rounded-full",
                    o.status === "new" ? "bg-[#e0b04a]" : o.status === "in_process" ? "bg-[#6fa3e0]" : "bg-[#5fc48f]")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14.5px] font-semibold text-white">{o.name} {o.surname}</p>
                      {o.source && o.source !== "web" && (
                        <Pill tone="muted" className="shrink-0">{o.source === "facebook" ? "FB" : o.source === "phone" ? "Тел" : "Рачно"}</Pill>
                      )}
                    </div>

                    {/* SKU — the identifier used when preparing the shipment */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {skus.length > 0 ? (
                        skus.map((s) => (
                          <span key={s}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#3a3a46] bg-[#1b1b21] px-2 py-1 font-mono text-[12px] font-bold tracking-wider text-[#f0b0ae]">
                            <IcTag size={11} className="text-[#e5454a]" />
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[#25252d] px-2 py-1 font-mono text-[11px] text-[#5a5a64]">
                          без SKU
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 truncate text-[11.5px] text-[#7c7c88]">
                      {o.items?.length
                        ? o.items.map((i) => `${i.quantity}× ${i.title}`).join(" · ")
                        : o.product_title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#5a5a64]">
                      <span className="inline-flex items-center gap-1"><IcClock size={11} /> {relTime(o.created_at)}</span>
                      {o.city && <span className="inline-flex items-center gap-1"><IcPin size={11} /> {o.city}</span>}
                      <span className="tabular-nums">#{o.id}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-[16px] font-bold leading-none tabular-nums text-[#e9e9ee]">
                      {money(orderTotal(o), c)}
                    </p>
                    <p className="mt-1 text-[10.5px] text-[#5a5a64]">{c === "MKD" ? "МКД" : c === "EUR" ? "ЕУР" : "ЛЕК"}</p>
                  </div>
                </button>

                <div className="flex gap-2 border-t border-[#1a1a20] px-3.5 py-2.5">
                  <button onClick={() => change(o.id, "in_process")}
                    disabled={o.status === "in_process" || busy}
                    className={cx("flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-[11.5px] font-semibold transition disabled:opacity-35",
                      o.status === "in_process" ? "border-[#2c4a6b] bg-[#101d2a] text-[#6fa3e0]" : "border-[#25252d] text-[#8a8a95]")}>
                    {busy ? <IcSpinner size={13} /> : <IcClock size={13} />} Во процес
                  </button>
                  <button onClick={() => change(o.id, "sent")}
                    disabled={o.status === "sent" || busy}
                    className={cx("flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-[11.5px] font-semibold transition disabled:opacity-35",
                      o.status === "sent" ? "border-[#2c5c43] bg-[#12241a] text-[#5fc48f]" : "border-[#25252d] text-[#8a8a95]")}>
                    {busy ? <IcSpinner size={13} /> : <IcCheck size={13} />} Испратена
                  </button>
                  <a href={`tel:${o.phone}`} aria-label="Јави се"
                    className="flex h-[34px] w-[38px] items-center justify-center rounded-lg border border-[#25252d] text-[#6fa3e0] transition active:scale-95">
                    <IcPhone size={15} />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <OrderDetail order={detail} onClose={() => setDetail(null)}
        onSave={patchOrder} onDelete={removeOrder} onStatus={change} busy={busyId} />

      <NewOrderSheet open={openNew} onClose={onNewClosed} onSave={addOrder} />
    </div>
  );
}

/* ── detail / edit sheet ───────────────────────────────────────────── */

function OrderDetail({ order, onClose, onSave, onDelete, onStatus, busy }: {
  order: Order | null; onClose: () => void;
  onSave: (id: number, patch: Partial<Order>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  onStatus: (id: number, s: OrderStatus) => void;
  busy: number | null;
}) {
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Order>>({});
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (!order) return;
    setForm({
      name: order.name, surname: order.surname, phone: order.phone,
      address: order.address, city: order.city, email: order.email ?? "",
      note: order.note ?? "", status: order.status,
      product_title: order.product_title ?? "",
      product_price: order.product_price ?? "",
      product_sku: order.product_sku ?? "",
    });
    setItems((order.items ?? []).map((i) => ({ ...i })));
    setEdit(false);
  }, [order]);

  if (!order) return null;
  const c = orderCurrency(order);

  const save = async () => {
    setSaving(true);
    const payload: Partial<Order> = { ...form };
    if (order.items?.length) {
      payload.items = items;
      // keep the mirrored single-product fields consistent with the cart
      payload.product_title = items[0]?.title ?? order.product_title ?? null;
      payload.product_price = items[0]?.price ?? order.product_price ?? null;
    }
    const ok = await onSave(order.id, payload);
    setSaving(false);
    if (ok) { setEdit(false); onClose(); }
  };

  const setItem = (i: number, patch: Partial<OrderItem>) =>
    setItems((all) => all.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const liveTotal = order.items?.length
    ? items.reduce((s, it) => s + unitValue(it.price, it.price_eur, c) * (it.quantity || 1), 0)
    : orderTotal(order);

  return (
    <Sheet open={!!order} onClose={onClose} title={`Нарачка #${order.id}`}
      footer={
        <div className="flex gap-2">
          {!edit ? (
            <>
              <Btn variant="outline" className="flex-1" onClick={() => setEdit(true)}><IcPencil size={16} /> Уреди</Btn>
              {order.status !== "sent" && (
                <Btn variant="ok" className="flex-1" loading={busy === order.id}
                  onClick={async () => { await onStatus(order.id, "sent"); onClose(); }}>
                  <IcCheck size={16} /> Испратена
                </Btn>
              )}
            </>
          ) : (
            <>
              <Btn variant="outline" className="flex-1" onClick={() => setEdit(false)}>Откажи</Btn>
              <Btn className="flex-1" loading={saving} onClick={save}>Зачувај</Btn>
            </>
          )}
        </div>
      }>

      {/* status */}
      <div className="mb-4 flex items-center gap-2">
        <Pill tone={order.status === "new" ? "warn" : order.status === "in_process" ? "info" : "ok"}>
          {STATUS_LABEL[order.status]}
        </Pill>
        <Pill tone="muted">{CURRENCY_LABEL[c]}</Pill>
        <span className="ml-auto text-[11px] text-[#5a5a64]">{order.created_at ? prettyDateTime(order.created_at) : ""}</span>
      </div>

      {edit ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Име"><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Презиме"><Input value={form.surname ?? ""} onChange={(e) => setForm({ ...form, surname: e.target.value })} /></Field>
          </div>
          <Field label="Телефон"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Адреса"><Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Град"><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Статус">
              <Select value={form.status ?? "new"} onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}>
                <option value="new">Нова</option>
                <option value="in_process">Во процес</option>
                <option value="sent">Испратена</option>
              </Select>
            </Field>
          </div>
          <Field label="Напомена">
            <Textarea rows={2} value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>

          {order.items?.length ? (
            <div>
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Производи</p>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="rounded-xl border border-[#1f1f26] bg-[#0c0c0f] p-2.5">
                    <p className="mb-2 truncate text-[12.5px] font-medium text-white">{it.title}</p>
                    <div className="mb-2 flex items-center gap-2">
                      <IcTag size={12} className="shrink-0 text-[#e5454a]" />
                      <Input value={it.sku ?? ""} placeholder="SKU"
                        onChange={(e) => setItem(i, { sku: e.target.value })}
                        className="py-2 font-mono text-[13px] tracking-wider" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input value={it.price} onChange={(e) => setItem(i, { price: e.target.value })} className="flex-1 py-2 text-[13px]" />
                      <div className="flex items-center gap-1">
                        <IconBtn label="Помалку" size={34} onClick={() => setItem(i, { quantity: Math.max(1, (it.quantity || 1) - 1) })}><IcMinus size={14} /></IconBtn>
                        <span className="w-7 text-center font-heading text-[15px] font-bold tabular-nums text-white">{it.quantity || 1}</span>
                        <IconBtn label="Повеќе" size={34} onClick={() => setItem(i, { quantity: (it.quantity || 1) + 1 })}><IcPlus size={14} /></IconBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Производ</p>
              <div className="space-y-2.5 rounded-xl border border-[#1f1f26] bg-[#0c0c0f] p-3">
                <Field label="Назив">
                  <Input value={(form.product_title as string) ?? ""} placeholder="Назив на производ"
                    onChange={(e) => setForm({ ...form, product_title: e.target.value })} />
                </Field>
                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <Field label="Цена">
                    <Input value={(form.product_price as string) ?? ""} placeholder="1.590 ден"
                      onChange={(e) => setForm({ ...form, product_price: e.target.value })} />
                  </Field>
                  <Field label="SKU">
                    <Input value={(form.product_sku as string) ?? ""} placeholder="444805" inputMode="numeric"
                      onChange={(e) => setForm({ ...form, product_sku: e.target.value })} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Live total — updates as the prices above are typed */}
          <div className="flex items-center justify-between rounded-xl border border-[#1f1f26] bg-[#0c0c0f] px-3.5 py-3">
            <span className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">
              Вкупно сега
            </span>
            <span className="font-heading text-[19px] font-bold tabular-nums text-[#e5454a]">
              {money(
                order.items?.length
                  ? items.reduce((s, it) => s + unitValue(it.price, it.price_eur, c) * (it.quantity || 1), 0)
                  : unitValue((form.product_price as string) ?? "", null, c),
                c
              )}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <a href={`tel:${order.phone}`} className="flex items-center gap-2.5 rounded-xl border border-[#1f1f26] bg-[#0c0c0f] p-3 transition active:scale-[.98]">
              <IcPhone size={16} className="text-[#6fa3e0]" />
              <span className="truncate text-[12.5px] text-white">{order.phone}</span>
            </a>
            {order.email ? (
              <a href={`mailto:${order.email}`} className="flex items-center gap-2.5 rounded-xl border border-[#1f1f26] bg-[#0c0c0f] p-3 transition active:scale-[.98]">
                <IcMail size={16} className="text-[#6fa3e0]" />
                <span className="truncate text-[12.5px] text-white">{order.email}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#1a1a20] p-3 text-[12.5px] text-[#4e4e58]">
                <IcMail size={16} /> нема email
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#1f1f26] bg-[#0c0c0f] p-3">
            <IcPin size={16} className="mt-0.5 shrink-0 text-[#8a8a95]" />
            <span className="text-[12.5px] leading-snug text-[#c9c9d1]">{order.address}{order.city ? `, ${order.city}` : ""}</span>
          </div>

          <div>
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Нарачано</p>
            <div className="space-y-1.5">
              {orderLines(order).map((line, i) => (
                <div key={i} className="rounded-lg bg-[#0c0c0f] px-3 py-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-[15px] font-bold tabular-nums text-[#e5454a]">{line.quantity}×</span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#c9c9d1]">{line.title}</span>
                    <span className="shrink-0 text-[12.5px] font-semibold tabular-nums text-white">
                      {order.items?.length
                        ? (c === "MKD"
                            ? order.items[i]?.price
                            : money(unitValue(order.items[i]?.price ?? "", order.items[i]?.price_eur, c), c))
                        : order.product_price}
                    </span>
                  </div>
                  {line.sku && (
                    <button
                      onClick={() => { navigator.clipboard?.writeText(line.sku!); }}
                      className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#3a3a46] bg-[#1b1b21] px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-[#f0b0ae] transition active:scale-95"
                      title="Копирај SKU">
                      <IcTag size={10} className="text-[#e5454a]" />
                      {line.sku}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#1f1f26] pt-2.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#6c6c78]">Вкупно</span>
              <span className="font-heading text-[20px] font-bold tabular-nums text-[#e5454a]">{money(orderTotal(order), c)}</span>
            </div>
          </div>

          {order.note && (
            <div className="rounded-xl border border-[#4a3a1a] bg-[#1c1708] p-3">
              <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#a8862f]">Напомена</p>
              <p className="mt-1 text-[12.5px] italic leading-snug text-[#e0c88a]">{order.note}</p>
            </div>
          )}

          <button onClick={async () => { if (confirm(`Избриши нарачка #${order.id}?`)) { await onDelete(order.id); onClose(); } }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#3a1a1d] py-3 text-[12.5px] font-semibold text-[#c9555a] transition active:scale-[.98]">
            <IcTrash size={15} /> Избриши нарачка
          </button>
        </div>
      )}
    </Sheet>
  );
}

/* ── new order ─────────────────────────────────────────────────────── */

function NewOrderSheet({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (p: Record<string, unknown>) => Promise<boolean>;
}) {
  const empty = { name: "", surname: "", phone: "", address: "", city: "", email: "",
                  product_title: "", product_price: "", product_sku: "", note: "", source: "phone" };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { if (open) setForm(empty); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = async () => {
    if (!form.name || !form.surname || !form.phone) return;
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Нова нарачка"
      footer={<Btn className="w-full" size="lg" loading={saving} onClick={save}>Зачувај нарачка</Btn>}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Име *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Име" /></Field>
          <Field label="Презиме *"><Input value={form.surname} onChange={(e) => set("surname", e.target.value)} placeholder="Презиме" /></Field>
        </div>
        <Field label="Телефон *"><Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+389 7X XXX XXX" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Адреса"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Град"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
        </div>
        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="(опционално)" /></Field>

        <div className="border-t border-[#1c1c23] pt-3">
          <Field label="Производ"><Input value={form.product_title} onChange={(e) => set("product_title", e.target.value)} placeholder="пр. VW Golf 5 патосници" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Цена"><Input value={form.product_price} onChange={(e) => set("product_price", e.target.value)} placeholder="2.490 ден" /></Field>
          <Field label="SKU"><Input value={form.product_sku} onChange={(e) => set("product_sku", e.target.value)} placeholder="444805" /></Field>
        </div>

        <Field label="Извор">
          <Select value={form.source} onChange={(e) => set("source", e.target.value)}>
            <option value="phone">Телефон</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="manual">Рачно</option>
          </Select>
        </Field>
        <Field label="Напомена"><Textarea rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} /></Field>
      </div>
    </Sheet>
  );
}
