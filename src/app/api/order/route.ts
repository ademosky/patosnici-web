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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, surname, address, city, phone, productTitle, productPrice, productSku } = body;

    await transporter.sendMail({
      from: '"Original Patosnici" <patosnicimk@gmail.com>',
      to: "patosnicimk@gmail.com",
      subject: `🛒 Нова нарачка: ${productTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🛒 НОВА НАРАЧКА</h1>
          </div>

          <div style="background: #111111; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #333;">

            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Производ</td>
                <td style="padding: 12px 0; color: white; font-weight: bold;">${productTitle}</td>
              </tr>
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">SKU</td>
                <td style="padding: 12px 0; color: #aaa; font-family: monospace; font-size: 14px;">${productSku || "—"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Цена</td>
                <td style="padding: 12px 0; color: #dc2626; font-weight: bold; font-size: 18px;">${productPrice}</td>
              </tr>
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Купувач</td>
                <td style="padding: 12px 0; color: white;">${name} ${surname}</td>
              </tr>
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Телефон</td>
                <td style="padding: 12px 0; color: white; font-size: 16px; font-weight: bold;">
                  <a href="tel:${phone}" style="color: #dc2626;">${phone}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Адреса</td>
                <td style="padding: 12px 0; color: white;">${address}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Град</td>
                <td style="padding: 12px 0; color: white;">${city}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background: #1a1a1a; border-radius: 8px; border-left: 4px solid #dc2626;">
              <p style="color: #888; margin: 0; font-size: 13px;">
                Контактирај го купувачот на <strong style="color: white;">${phone}</strong> за потврда на нарачката.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error:", err?.message ?? err);
    return NextResponse.json(
      { error: `Грешка: ${err?.message ?? "непозната"}` },
      { status: 500 }
    );
  }
}