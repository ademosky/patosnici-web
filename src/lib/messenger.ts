import { supabaseAdmin } from "@/lib/supabase-admin";
import { foldText } from "@/lib/search";

/**
 * The Messenger assistant's brain.
 *
 * It does exactly one clever thing: work out WHICH CAR the customer means.
 * Every product, link and message comes from the shop — it never writes prose.
 */

export const TEMPLATE_MK =
  "Здраво! Моделот за Вашето возило е достапен на нашата официјална веб-страница. " +
  "Нарачката можете да ја направите директно преку веб-страницата или, доколку Ви е полесно, " +
  "и тука преку порака. 😊";

export const TEMPLATE_SQ =
  "Përshëndetje! Modeli për veturën tuaj është në dispozicion në faqen tonë zyrtare. " +
  "Mund ta bëni porosinë direkt në web-faqe, ose nëse e keni më lehtë, " +
  "mund të porosisni edhe këtu me mesazh. 😊";

const ASK_YEAR_MK = "Секако! Која година е Вашето {model}?";
const ASK_YEAR_SQ = "Sigurisht! Cili është viti i {model}?";

const BRANDS: Record<string, string[]> = {
  volkswagen: ["volkswagen", "vw", "фолксваген", "голф", "golf"],
  audi: ["audi", "ауди"], bmw: ["bmw", "бмв"],
  mercedes: ["mercedes", "мерцедес", "benz", "бенц"],
  skoda: ["skoda", "шкода", "škoda"], seat: ["seat", "сеат"],
  renault: ["renault", "рено"], peugeot: ["peugeot", "пежо"],
  citroen: ["citroen", "citroën", "ситроен"], opel: ["opel", "опел"],
  toyota: ["toyota", "тојота"], ford: ["ford", "форд"], fiat: ["fiat", "фиат"],
  dacia: ["dacia", "дачиа"], hyundai: ["hyundai", "хјундаи"], kia: ["kia", "киа"],
  mazda: ["mazda", "мазда"], nissan: ["nissan", "нисан"], porsche: ["porsche", "порше"],
  volvo: ["volvo", "волво"], honda: ["honda", "хонда"], suzuki: ["suzuki", "сузуки"],
  mitsubishi: ["mitsubishi", "митсубиши"], jeep: ["jeep", "џип"],
  "land-rover": ["land rover", "landrover"], lexus: ["lexus", "лексус"],
  mini: ["mini", "мини"], tesla: ["tesla", "тесла"], cupra: ["cupra", "купра"],
  smart: ["smart", "смарт"], iveco: ["iveco", "ивеко"], man: ["man"], ds: ["ds"],
  "alfa-romeo": ["alfa romeo", "alfa", "алфа"],
  chevrolet: ["chevrolet", "шевролет", "chevy"], daewoo: ["daewoo", "деву"],
  genesis: ["genesis", "генезис"], lancia: ["lancia", "ланчиа"],
};

const NOISE = new Set([
  "patosnici", "патосници", "tapete", "tapetet", "mats", "mat", "gome", "гумени",
  "gumeni", "gumene", "a", "li", "ima", "има", "имате", "dali", "дали", "za", "за",
  "keni", "pershendetje", "здраво", "zdravo", "hello", "hi", "me", "men", "mua",
  "molim", "молим", "ve", "ве", "vi", "ви", "do", "до", "od", "од", "e", "eshte",
  "je", "godina", "godiste", "viti", "vit", "kemi", "dua", "desha",
].map((w) => foldText(w)));

export function hasCyrillic(text: string): boolean {
  return /[\u0400-\u04ff]/.test(text || "");
}

export function detectLang(text: string, remembered?: string | null): "mk" | "sq" {
  const lowered = (text || "").toLowerCase();
  if (hasCyrillic(text)) return "mk";
  if (/[ëç]/.test(lowered)) return "sq";
  const words = new Set(lowered.split(/\s+/));
  for (const w of ["keni", "kam", "pershendetje", "përshëndetje", "tapete", "kush", "shume", "sa"]) {
    if (words.has(w)) return "sq";
  }
  return (remembered as "mk" | "sq") || "mk";
}

function findBrand(folded: string): string | null {
  let best: { len: number; brand: string } | null = null;
  for (const [brand, aliases] of Object.entries(BRANDS)) {
    for (const alias of aliases) {
      const a = foldText(alias);
      if (!a) continue;
      if (new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(folded)) {
        if (!best || a.length > best.len) best = { len: a.length, brand };
      }
    }
  }
  return best ? best.brand : null;
}

function findYear(text: string): number | null {
  const m = (text || "").match(/\b(19[89]\d|20[0-4]\d)\b/);
  return m ? parseInt(m[1], 10) : null;
}

function findModel(text: string, brand: string): string {
  const words = (text || "").match(/[A-Za-zА-Яа-яЀ-ӿ0-9\-]+/g) || [];
  const brandOnly = new Set([foldText(brand), foldText((BRANDS[brand] || [brand])[0])]);
  const keep: string[] = [];
  for (const w of words) {
    const f = foldText(w);
    if (!f || NOISE.has(f) || /^(?:19|20)\d{2}$/.test(w)) continue;
    if (brandOnly.has(f)) continue;
    keep.push(w);
  }
  const model = keep.slice(0, 3).join(" ").trim();
  return model && model === model.toLowerCase()
    ? model.split(" ").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ")
    : model;
}

function yearCovers(yearText: string | null | undefined, year: number): boolean {
  if (!yearText) return false;
  const nums = (String(yearText).match(/\b(?:19|20)\d{2}\b/g) || []).map(Number);
  if (!nums.length) return false;
  if (nums.length === 1) return nums[0] === year;
  return year >= Math.min(...nums) && year <= Math.max(...nums);
}

export type Vehicle = { brand: string | null; model: string; year: number | null };

export function extractVehicle(text: string, remembered?: { brand?: string | null; model?: string | null } | null): Vehicle {
  const folded = foldText(text);
  let brand = findBrand(folded);
  let year = findYear(text);
  let model = brand ? findModel(text, brand) : "";

  if (remembered?.brand) {
    if (!brand) {
      brand = remembered.brand;
      model = remembered.model || "";
    } else if (!model && remembered.model) {
      model = remembered.model;
    }
  }
  return { brand, model, year };
}

export type Product = { id: number; slug: string; title: string; year: string | null; brand: string };

/**
 * The customer often names the model without the make: "Patosnici za Q5 2013".
 * Nobody says Audi, but Q5 is an Audi. Search the whole catalogue by the words
 * that are left, and let the row's own title decide.
 */
export async function lookupByText(text: string, year: number | null): Promise<Product[]> {
  const words = (text || "")
    .split(/[^A-Za-zА-Яа-яЀ-ӿ0-9]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !/^(?:19|20)\d{2}$/.test(w) && !NOISE.has(foldText(w)));
  if (!words.length) return [];

  const probe = foldText(words.join(" "));
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("id, slug, title, year, brand")
    .eq("hidden", false)
    .limit(400);
  if (error || !data) return [];

  const hits = data.filter((p) => {
    const title = foldText(p.title || "");
    return words.every((w) => title.includes(foldText(w)));
  });
  if (year === null) return hits;
  return hits.filter((p) => yearCovers(p.year, year));
}

export async function lookup(brand: string, model: string, year: number | null): Promise<Product[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("id, slug, title, year, brand")
    .eq("brand", brand)
    .eq("hidden", false)
    .limit(200);
  if (error || !data) return [];

  const wantModel = foldText(model);
  const matching = wantModel
    ? data.filter((p) => foldText(`${p.title || ""}`).includes(wantModel.split(" ")[0]))
    : data;

  const pool = matching.length ? matching : data;
  if (year === null) return pool;
  const covering = pool.filter((p) => yearCovers(p.year, year));
  return covering;
}

export function productUrl(slug: string, lang: "mk" | "sq"): string {
  return lang === "sq"
    ? `https://www.originalpatosnici.com/ks/products/${slug}`
    : `https://www.originalpatosnici.com/products/${slug}`;
}

export function replyText(lang: "mk" | "sq", url: string): string {
  return `${url}\n\n${lang === "sq" ? TEMPLATE_SQ : TEMPLATE_MK}`;
}

export function askYearText(lang: "mk" | "sq", model: string): string {
  return (lang === "sq" ? ASK_YEAR_SQ : ASK_YEAR_MK).replace("{model}", model);
}

export async function sendText(psid: string, text: string): Promise<boolean> {
  const token = process.env.FB_PAGE_TOKEN;
  if (!token) return false;
  const resp = await fetch(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: psid }, messaging_type: "RESPONSE", message: { text } }),
    },
  );
  if (!resp.ok) {
    console.error("messenger send failed", resp.status, (await resp.text()).slice(0, 300));
    return false;
  }
  return true;
}
