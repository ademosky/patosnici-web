import { NextRequest, NextResponse } from "next/server";
import { detectLang, extractVehicle, lookup, productUrl, replyText, askYearText } from "@/lib/messenger";

export const dynamic = "force-dynamic";

/**
 * Dry run. Shows exactly what the assistant would do with a message,
 * without sending anything to Messenger.
 */
export async function POST(req: NextRequest) {
  if (!process.env.FB_PAGE_TOKEN && process.env.NODE_ENV === "production") {
    // Anything is fine here: nothing is sent.
  }
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "");
  const lang = detectLang(text);
  const { brand, model, year } = extractVehicle(text);

  if (!brand) return NextResponse.json({ action: "silent", reason: "no_vehicle", text });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ action: "error", reason: "missing_service_role_key" }, { status: 500 });
  }

  const results = await lookup(brand, model, year);

  if (year === null) {
    if (results.length !== 1) {
      return NextResponse.json({
        action: "ask_year",
        question: askYearText(lang, model || brand),
        candidates: results.length,
      });
    }
  } else if (results.length === 0) {
    return NextResponse.json({ action: "silent", reason: "year_not_found", brand, model, year });
  }

  if (results.length === 0) return NextResponse.json({ action: "silent", reason: "no_product" });

  return NextResponse.json({
    action: "replied",
    product: results[0].title,
    year: results[0].year,
    lang,
    text: replyText(lang, productUrl(results[0].slug, lang)),
  });
}
