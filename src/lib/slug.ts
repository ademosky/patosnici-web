/**
 * Cyrillic-aware slug.
 *
 * Subcategory names are typed in Macedonian ("Организери"), and a reference
 * made of stripped non-Latin characters would be empty. Transliterating gives
 * a stable, readable key that also survives a rename.
 */

const MAP: Record<string, string> = {
  а:"a", б:"b", в:"v", г:"g", д:"d", ѓ:"gj", е:"e", ж:"zh", з:"z", ѕ:"dz",
  и:"i", ј:"j", к:"k", л:"l", љ:"lj", м:"m", н:"n", њ:"nj", о:"o", п:"p",
  р:"r", с:"s", т:"t", ќ:"kj", у:"u", ф:"f", х:"h", ц:"c", ч:"ch", џ:"dj", ш:"sh",
  // Serbian / other Cyrillic that may be pasted in
  ђ:"dj", ѐ:"e", ѝ:"i",
};

export function slugify(input: string): string {
  const lower = (input || "").toLowerCase().trim();
  let out = "";
  for (const ch of lower) out += MAP[ch] ?? ch;
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Slug that is guaranteed non-empty and unique among `taken`. */
export function uniqueSlug(input: string, taken: string[]): string {
  const base = slugify(input) || "kategorija";
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
