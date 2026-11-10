// Shared search helpers — used by both the server API and client filters.

/** Split a string into normalized search words.
 *  Lowercases and replaces hyphens, underscores, parentheses, slashes and
 *  dots with spaces so "C-KLASSE", "C KLASSE" and "C (KLASSE)" all match.
 */
export function normalizeSearchWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[-_()/.,]+/g, " ")
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

  if (textWords.length > 0 && !matchesAllWords(productHaystack(p), textWords.join(" "))) {
    return false;
  }
  for (const y of yearWords) {
    if (!yearRangeCovers(p.year, Number(y))) return false;
  }
  return true;
}
