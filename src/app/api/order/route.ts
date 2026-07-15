export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "patosnicimk@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type CartItem = {
  id: number;
  title: string;
  price: string;
  quantity: number;
  sku?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, surname, address, city, phone } = body;

    // Cart order (multiple items) OR single product order
    const isCartOrder = Array.isArray(body.items) && body.items.length > 0;

    let itemsHtml = "";
    let subject = "";

    if (isCartOrder) {
      const items: CartItem[] = body.items;
      subject = `Нарачка (${items.reduce((s: number, i: CartItem) => s + i.quantity, 0)} производи) — ${name} ${surname}`;
      itemsHtml = items.map((item: CartItem) => `
        <tr style="border-bottom: 1px solid #333;">
          <td style="padding: 10px 0; color: white;">${item.title}${item.sku ? ` <span style="color:#888;font-size:12px;">(${item.sku})</span>` : ""}</td>
          <td style="padding: 10px 0; color: #888; text-align:center;">${item.quantity}x</td>
          <td style="padding: 10px 0; color: #dc2626; text-align:right; font-weight:bold;">${item.price}</td>
        </tr>
      `).join("");
    } else {
      const { productTitle, productPrice, productSku } = body;
      subject = `Нарачка: ${productTitle}`;
      itemsHtml = `
        <tr style="border-bottom: 1px solid #333;">
          <td style="padding: 10px 0; color: white;">${productTitle}${productSku ? ` <span style="color:#888;font-size:12px;">(${productSku})</span>` : ""}</td>
          <td style="padding: 10px 0; color: #888; text-align:center;">1x</td>
          <td style="padding: 10px 0; color: #dc2626; text-align:right; font-weight:bold;">${productPrice}</td>
        </tr>
      `;
    }

    await transporter.sendMail({
      from: '"Original Patosnici" <patosnicimk@gmail.com>',
      to: "patosnicimk@gmail.com",
      subject: `🛒 ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🛒 НОВА НАРАЧКА</h1>
          </div>
          <div style="background: #111; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #333;">

            <h3 style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Нарачани производи</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 1px solid #444;">
                  <th style="padding: 8px 0; color: #888; font-size: 12px; text-align:left;">Производ</th>
                  <th style="padding: 8px 0; color: #888; font-size: 12px; text-align:center;">Кол.</th>
                  <th style="padding: 8px 0; color: #888; font-size: 12px; text-align:right;">Цена</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <h3 style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Купувач</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Ime</td>
                <td style="padding: 10px 0; color: white; font-weight: bold;">${name} ${surname}</td>
              </tr>
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Телефон</td>
                <td style="padding: 10px 0; color: white; font-weight: bold; font-size: 16px;">
                  <a href="tel:${phone}" style="color: #dc2626;">${phone}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Адреса</td>
                <td style="padding: 10px 0; color: white;">${address}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Град</td>
                <td style="padding: 10px 0; color: white;">${city}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; padding: 14px; background: #1a1a1a; border-radius: 8px; border-left: 4px solid #dc2626;">
              <p style="color: #888; margin: 0; font-size: 13px;">
                Контактирај го купувачот на <strong style="color: white;">${phone}</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error:", err?.message ?? err);
    return NextResponse.json({ error: `Грешка: ${err?.message ?? "непозната"}` }, { status: 500 });
  }
}
