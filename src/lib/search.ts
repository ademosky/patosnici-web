// Shared search helpers — used by both the server API and client filters.

/** Split a string into normalized search words.
 *  Lowercases and replaces hyphens, underscores, parentheses, slashes and
 *  dots with spaces so "C-KLASSE", "C KLASSE" and "C (KLASSE)" all match.
 */
const CYR_TO_LAT: Record<string, string> = {
  "а":"a","б":"b","в":"v","г":"g","д":"d","ѓ":"gj","е":"e","ж":"z","з":"z","ѕ":"dz",
  "и":"i","ј":"j","к":"k","л":"l","љ":"lj","м":"m","н":"n","њ":"nj","о":"o","п":"p",
  "р":"r","с":"s","т":"t","ќ":"kj","у":"u","ф":"f","х":"h","ц":"c","ч":"c","џ":"dz","ш":"s",
};

/**
 * One spelling for both alphabets.
 *
 * A shopper types "голф" or "golf" and means the same car. Folding Cyrillic to
 * Latin (and stripping accents) means search never asks anyone to switch their
 * keyboard. Applied to BOTH the query and the text being searched, so the
 * comparison is always like-for-like.
 */
export function foldText(value: string | null | undefined): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   /* ë→e, č→c, š→s */
    .split("")
    .map((ch) => CYR_TO_LAT[ch] ?? ch)
    .join("");
}

/**
 * One phone number, many spellings.
 *
 * +38970774945, 070774945 and 70774945 all end in the same digits, so compare
 * the tail rather than the whole string. Country codes and the leading zero
 * then stop mattering — including for Albania (+355) and Kosovo (+383).
 */
export function phoneMatches(phone: string | null | undefined, query: string): boolean {
  const qd = String(query ?? "").replace(/\D/g, "");
  if (qd.length < 6) return false;
  const pd = String(phone ?? "").replace(/\D/g, "");
  if (pd.length < 6) return false;
  const tail = qd.slice(-7);
  return pd.endsWith(tail) || pd.includes(tail);
}

/** Split a string into normalized search words. */
export function normalizeSearchWords(s: string): string[] {
  return foldText(s)
    .replace(/[-_()/.,+]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** True if EVERY word in `query` appears (partially) in `haystack`.
 *  AND across query words, OR across haystack words. Case-insensitive.
 */
export function matchesAllWords(haystack: string, query: string): boolean {
  const words = normalizeSearchWords(query);
  if (words.length === 0) return true;
  const hay = normalizeSearchWords(haystack);
  return words.every((w) => hay.some((hw) => hw.includes(w)));
}

/**
 * Does a product's year text cover the given year?
 *
 * Years are stored as ranges — "(2003-2009)", "1997-2004", or occasionally a
 * single value. A shopper typing "2010" means "my car is a 2010", so the answer
 * must be the models that were actually built that year: Golf 6 (2008-2012) is
 * a match, Golf 5 (2003-2009) is not.
 */
export function yearRangeCovers(
  yearText: string | null | undefined,
  year: number,
): boolean {
  if (!yearText) return false;
  const found = yearText.match(/\b(?:19|20)\d{2}\b/g);
  if (!found || found.length === 0) return false;
  const years = found.map(Number);
  if (years.length === 1) return years[0] === year;
  return year >= Math.min(...years) && year <= Math.max(...years);
}

const YEAR_RE = /^(?:19|20)\d{2}$/;

/**
 * Word comparison used specifically for product search.
 *
 * The old rule was "any word of the product CONTAINS the query token", which
 * broke the way people actually search a car:
 *
 *   "mercedes c"  →  every Mercedes, because "mercedes" contains a "c".
 *                    (and every "… Class" model, since "class" starts with c)
 *   "golf 5"      →  unrelated models, because "5" appears inside SKUs.
 *
 * So: a single letter must equal a whole word (that is what a model letter is),
 * and longer tokens match by word prefix — "gol" still finds Golf, but a stray
 * digit inside a SKU no longer drags in a different car.
 */
export function matchesSearchWords(haystack: string, query: string): boolean {
  const words = normalizeSearchWords(query);
  if (words.length === 0) return true;
  const hay = normalizeSearchWords(haystack);
  return words.every((w) =>
    hay.some((hw) => (w.length === 1 ? hw === w : hw.startsWith(w))),
  );
}

/** Everything a product can be found by, as one searchable string. */
export function productHaystack(p: {
  title?: string | null; model?: string | null; car_model?: string | null;
  brand?: string | null; sku?: string | null; year?: string | null;
}): string {
  return [p.title, p.model, p.car_model, p.brand, p.sku, p.year]
    .filter(Boolean)
    .join(" ");
}

/**
 * The one matcher both the API and the client use.
 *
 * Plain words must all appear somewhere in the product, as before. A bare
 * four-digit year is answered by range instead of by text — which is what makes
 * "golf 2010" find the right model even though no product literally says 2010.
 */
export function productMatchesQuery(
  p: {
    title?: string | null; model?: string | null; car_model?: string | null;
    brand?: string | null; sku?: string | null; year?: string | null;
  },
  query: string,
): boolean {
  const words = normalizeSearchWords(query);
  if (words.length === 0) return true;

  const yearWords = words.filter((w) => YEAR_RE.test(w));
  const textWords = words.filter((w) => !YEAR_RE.test(w));

  if (textWords.length > 0 && !matchesSearchWords(productHaystack(p), textWords.join(" "))) {
    return false;
  }
  for (const y of yearWords) {
    if (!yearRangeCovers(p.year, Number(y))) return false;
  }
  return true;
}
