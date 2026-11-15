"use client";

/**
 * Пораки — Messenger drafts waiting for approval.
 *
 * Nothing the assistant matches goes out on its own: a wrong product link is
 * worse than a slow reply. Each card is one customer's question plus the exact
 * link that would be sent, and one button.
 */

import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "../_lib/store";
import { Card, Btn, Pill, Empty, IcSpinner, IcCheck, IcRefresh } from "../_ui/kit";

type Draft = {
  id: number;
  psid: string;
  text: string;
  product: string;
  slug: string;
  lang: "mk" | "sq";
  url: string;
  created_at: string;
};

export function MessagesView() {
  const ctx = useAdmin() as any;
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const password = useCallback(() => {
    return (
      ctx?.password || ctx?.pw || ctx?.session?.password ||
      (typeof window !== "undefined" ? localStorage.getItem("adminPassword") || localStorage.getItem("adminPw") || "" : "")
    );
  }, [ctx]);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/messenger/queue?_t=${Date.now()}`, {
        headers: { "x-admin-password": password() },
        cache: "no-store",
      });
      if (!res.ok) { setError(`HTTP ${res.status}`); setDrafts([]); return; }
      const data = await res.json();
      setDrafts(data.drafts ?? []);
    } catch (err) {
      setError(String(err));
      setDrafts([]);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const send = async (id: number) => {
    setBusy(id);
    try {
      const res = await fetch("/api/messenger/queue", {
        method: "POST",
        headers: { "x-admin-password": password(), "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setDrafts((d) => (d ?? []).filter((x) => x.id !== id));
      else setError(`Не успеа — HTTP ${res.status}`);
    } finally {
      setBusy(null);
    }
  };

  if (drafts === null) {
    return <div className="flex justify-center py-16"><IcSpinner /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[#8a8a95]">
          {drafts.length === 0 ? "Нема чекања" : `${drafts.length} чекаат одобрување`}
        </p>
        <Btn size="sm" tone="neutral" onClick={load}><IcRefresh size={14} /> Освежи</Btn>
      </div>

      {error && <p className="text-[12px] text-[#e5454a]">{error}</p>}

      {drafts.length === 0 && (
        <Empty
          title="Нема пораки што чекаат"
          desc="Кога асистентот ќе најде производ, нацртот ќе се појави тука — и ништо нема да се прати без твоето одобрување."
        />
      )}

      {drafts.map((d) => (
        <Card key={d.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-[#5a5a64]">Купувачот напиша</p>
              <p className="mt-1 text-[14px] font-semibold text-white break-words">{d.text}</p>

              <p className="mt-3 text-[11px] uppercase tracking-wider text-[#5a5a64]">Ќе се прати</p>
              <p className="mt-1 text-[13px] text-[#c9ccd4]">{d.product}</p>
              <a href={d.url} target="_blank" rel="noopener noreferrer"
                 className="mt-1 block break-all text-[12px] text-[#5aa2f0] hover:underline">
                {d.url}
              </a>
            </div>
            <Pill tone={d.lang === "sq" ? "info" : "neutral"}>{d.lang.toUpperCase()}</Pill>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Btn size="sm" tone="ok" onClick={() => send(d.id)} disabled={busy === d.id}>
              {busy === d.id ? <IcSpinner /> : <IcCheck size={14} />} Прати
            </Btn>
            <Btn size="sm" tone="neutral" onClick={() => setDrafts((x) => (x ?? []).filter((y) => y.id !== d.id))}>
              Скокни
            </Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}
