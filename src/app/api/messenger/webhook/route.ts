import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  askYearText, detectLang, extractVehicle, lookup, productUrl, replyText, sendText,
} from "@/lib/messenger";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Meta Messenger webhook.
 *
 * Lives here rather than on a third-party host because Meta needs three things
 * only this app can give it: a public HTTPS URL, a GET handshake, and the RAW
 * request body so the signature can be checked. A forwarding webhook re-encodes
 * the body, which breaks the signature on every message.
 */

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.FB_VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge") ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return new NextResponse("forbidden", { status: 403 });
}

type Pending = { brand: string; model: string; lang: "mk" | "sq" };

async function readPending(psid: string): Promise<Pending | null> {
  try {
    const { data } = await supabaseAdmin()
      .from("messenger_state")
      .select("brand, model, lang, updated_at")
      .eq("psid", psid)
      .maybeSingle();
    if (!data) return null;
    const age = (Date.now() - new Date(data.updated_at).getTime()) / 1000;
    return age > 1800 ? null : (data as Pending);
  } catch {
    return null;
  }
}

async function savePending(psid: string, value: Pending | null) {
  try {
    if (!value) {
      await supabaseAdmin().from("messenger_state").delete().eq("psid", psid);
      return;
    }
    await supabaseAdmin()
      .from("messenger_state")
      .upsert({ psid, ...value, updated_at: new Date().toISOString() });
  } catch {
    /* state is a convenience: without it we simply ask for the year again */
  }
}

async function handle(psid: string, text: string) {
  const pending = await readPending(psid);
  const lang = detectLang(text, pending?.lang);
  const { brand, model, year } = extractVehicle(text, pending);

  if (!brand) return { action: "silent", reason: "no_vehicle" };

  let results = await lookup(brand, model, year);

  if (year === null) {
    if (results.length !== 1) {
      const question = askYearText(lang, model || brand);
      await savePending(psid, { brand, model, lang });
      await sendText(psid, question);
      return { action: "ask_year", question, candidates: results.length };
    }
  } else if (results.length === 0) {
    // A year nothing covers: say nothing, let the shop answer.
    return { action: "silent", reason: "year_not_found" };
  }

  if (results.length === 0) return { action: "silent", reason: "no_product" };

  const url = productUrl(results[0].slug, lang);
  const body = replyText(lang, url);
  await savePending(psid, null);
  const ok = await sendText(psid, body);
  return ok
    ? { action: "replied", product: results[0].title, slug: results[0].slug, lang }
    : { action: "send_failed" };
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  const secret = process.env.FB_APP_SECRET;
  const signature = req.headers.get("x-hub-signature-256") ?? "";
  if (secret) {
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return NextResponse.json({ error: "bad signature" }, { status: 403 });
    }
  }

  let payload: any = {};
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    return NextResponse.json({ ok: true });
  }

  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const message = event.message ?? {};
      if (message.is_echo || event.read) continue;
      const text = String(message.text ?? "").trim();
      const psid = event.sender?.id;
      if (!text || !psid) continue;

      // Awaited on purpose: the sandbox ends when the handler returns.
      await handle(psid, text);
    }
  }

  return NextResponse.json({ ok: true });
}
