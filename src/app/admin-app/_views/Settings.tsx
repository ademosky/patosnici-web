"use client";

/**
 * Settings — install guidance, session, and app information.
 */

import { useEffect, useState } from "react";
import { useAdmin } from "../_lib/store";
import { prettyDateTime, today } from "../_lib/core";
import {
  Card, SectionTitle, Pill, Btn, Field, Input,
  IcShare, IcLogout, IcInfo, IcCheck, IcStar, IcBox, IcOrders, IcLayers, IcImage, IcChart, IcRight,
} from "../_ui/kit";

export function SettingsView() {
  const { signOut, products, orders, inventory, showcase, toast } = useAdmin();
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIos(/iphone|ipad|ipod/i.test(ua));
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true,
    );
  }, []);

  const stats = [
    { label: "Производи", value: products.length, icon: <IcBox size={16} /> },
    { label: "Нарачки (месец)", value: orders.length, icon: <IcOrders size={16} /> },
    { label: "Ставки залиха", value: inventory.length, icon: <IcLayers size={16} /> },
    { label: "Галерија", value: showcase.length, icon: <IcImage size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* install */}
      <section>
        <SectionTitle>Апликација</SectionTitle>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#16161b] text-[#d72026]">
              <IcShare size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-white">
                {standalone ? "Инсталирана е" : "Инсталирај на почетен екран"}
              </p>
              {standalone ? (
                <p className="mt-1 text-[12px] leading-relaxed text-[#7c7c88]">
                  Апликацијата работи самостојно, без адресна лента — како вистинска native апликација.
                </p>
              ) : (
                <ol className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-[#9a9aa5]">
                  {ios ? (
                    <>
                      <li className="flex gap-2"><span className="text-[#d72026]">1.</span> Отвори ја оваа страница во <b className="text-white">Safari</b>.</li>
                      <li className="flex gap-2"><span className="text-[#d72026]">2.</span> Допрете <b className="text-white">Сподели</b> (квадратче со стрелка долу).</li>
                      <li className="flex gap-2"><span className="text-[#d72026]">3.</span> Изберете <b className="text-white">„Додај на почетен екран“</b>.</li>
                      <li className="flex gap-2"><span className="text-[#d72026]">4.</span> Отворете ја од почетниот екран — сега е апликација.</li>
                    </>
                  ) : (
                    <>
                      <li className="flex gap-2"><span className="text-[#d72026]">1.</span> Отвори го менито на прелистувачот.</li>
                      <li className="flex gap-2"><span className="text-[#d72026]">2.</span> Изберете <b className="text-white">„Инсталирај апликација“</b> или „Додај на почетен екран“.</li>
                    </>
                  )}
                </ol>
              )}
              {standalone && (
                <div className="mt-2"><Pill tone="ok"><IcCheck size={11} /> активно</Pill></div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* data at a glance */}
      <section>
        <SectionTitle>Преглед на податоци</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <Card key={s.label} className="flex items-center gap-3 p-3.5">
              <span className="text-[#e5454a]">{s.icon}</span>
              <div>
                <p className="font-heading text-[21px] font-bold leading-none tabular-nums text-white">{s.value}</p>
                <p className="mt-1 text-[10.5px] uppercase tracking-[.1em] text-[#6c6c78]">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* about */}
      <section>
        <SectionTitle>За апликацијата</SectionTitle>
        <Card className="divide-y divide-[#1a1a20]">
          {[
            ["Верзија", "App 1.0"],
            ["Компанија", "Original Patosnici"],
            ["Валути", "МКД · ЕУР · Лек"],
            ["Пазари", "Македонија · Косово · Албанија"],
            ["Денес", today()],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-[12.5px] text-[#7c7c88]">{k}</span>
              <span className="text-[12.5px] font-medium text-white">{v}</span>
            </div>
          ))}
        </Card>
        <p className="mt-2.5 px-1 text-[11px] leading-relaxed text-[#5a5a64]">
          Податоците никогаш не се кешираат локално — апликацијата секогаш прикажува точна состојба од серверот.
        </p>
      </section>

      {/* session */}
      <section>
        <SectionTitle>Сесија</SectionTitle>
        <Card className="p-4 space-y-3">
          <Field label="Лозинка" hint="Зачувана на овој уред. За промена, одјави се и влези повторно.">
            <Input type="password" value="••••••••" readOnly disabled />
          </Field>
          <Btn variant="danger" className="w-full" onClick={() => { signOut(); toast("Одјавен"); }}>
            <IcLogout size={16} /> Одјави се
          </Btn>
        </Card>
        <div className="mt-2.5 rounded-2xl border border-[#1f1f26] bg-[#0c0c0f] p-4">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-[#7c7c88]">
            <IcInfo size={14} /> Класичниот панел е сè уште достапен
          </p>
          <a href="/admin" className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#e5454a]">
            Отвори /admin <IcRight size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
