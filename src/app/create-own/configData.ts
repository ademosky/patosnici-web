// ── Configurator data: colors, borders, and vehicle catalog ──
// Colors are defined once here so both the pickers and the live preview
// stay in sync. Vehicle catalog reuses brand ids from data/brands.ts.

export type BodyColor = {
  id: string;
  label_mk: string;
  label_sq: string;
  hex: string;
};

export const BODY_COLORS: BodyColor[] = [
  { id: "black", label_mk: "Црна", label_sq: "E zezë", hex: "#1a1a1a" },
  { id: "grey", label_mk: "Сива", label_sq: "Gri", hex: "#9a9a9a" },
  { id: "cream", label_mk: "Крем", label_sq: "Krem", hex: "#e8dcc4" },
];

export type BorderColor = {
  id: string;
  label_mk: string;
  label_sq: string;
  hex: string;
};

export const BORDER_COLORS: BorderColor[] = [
  { id: "black", label_mk: "Црна", label_sq: "E zezë", hex: "#1a1a1a" },
  { id: "red", label_mk: "Црвена", label_sq: "E kuqe", hex: "#dc2626" },
  { id: "blue", label_mk: "Сина", label_sq: "Blu", hex: "#2563eb" },
  { id: "cream", label_mk: "Крем", label_sq: "Krem", hex: "#e8dcc4" },
];

export type Vehicle = {
  brandId: string;
  model: string;
  generation: string;
};

// Curated vehicle catalog. brandId must match an id in data/brands.ts so the
// logo auto-resolves. Extend freely — the configurator reads from here.
export const VEHICLES: Vehicle[] = [
  { brandId: "volkswagen", model: "Golf", generation: "Golf 5 (2003–2008)" },
  { brandId: "volkswagen", model: "Golf", generation: "Golf 6 (2008–2013)" },
  { brandId: "volkswagen", model: "Golf", generation: "Golf 7 (2012–2020)" },
  { brandId: "volkswagen", model: "Passat", generation: "B6 (2005–2010)" },
  { brandId: "volkswagen", model: "Passat", generation: "B7 (2010–2014)" },
  { brandId: "volkswagen", model: "Passat", generation: "B8 (2014–2023)" },
  { brandId: "volkswagen", model: "Polo", generation: "6R (2009–2017)" },
  { brandId: "volkswagen", model: "Tiguan", generation: "Mk1 (2007–2016)" },
  { brandId: "volkswagen", model: "Tiguan", generation: "Mk2 (2016–2024)" },
  { brandId: "volkswagen", model: "Touareg", generation: "Mk2 (2010–2018)" },
  { brandId: "audi", model: "A3", generation: "8P (2003–2012)" },
  { brandId: "audi", model: "A3", generation: "8V (2012–2020)" },
  { brandId: "audi", model: "A4", generation: "B8 (2007–2015)" },
  { brandId: "audi", model: "A4", generation: "B9 (2015–2023)" },
  { brandId: "audi", model: "A6", generation: "C7 (2011–2018)" },
  { brandId: "audi", model: "Q5", generation: "8R (2008–2017)" },
  { brandId: "bmw", model: "Seria 3", generation: "E90 (2005–2012)" },
  { brandId: "bmw", model: "Seria 3", generation: "F30 (2011–2019)" },
  { brandId: "bmw", model: "Seria 5", generation: "F10 (2010–2017)" },
  { brandId: "bmw", model: "Seria 5", generation: "G30 (2017–2023)" },
  { brandId: "bmw", model: "X3", generation: "F25 (2010–2017)" },
  { brandId: "bmw", model: "X5", generation: "F15 (2013–2018)" },
  { brandId: "mercedes", model: "C-Klasse", generation: "W204 (2007–2014)" },
  { brandId: "mercedes", model: "C-Klasse", generation: "W205 (2014–2021)" },
  { brandId: "mercedes", model: "E-Klasse", generation: "W212 (2009–2016)" },
  { brandId: "mercedes", model: "GLC", generation: "X253 (2015–2022)" },
  { brandId: "skoda", model: "Octavia", generation: "Mk3 (2013–2020)" },
  { brandId: "skoda", model: "Superb", generation: "B8 (2015–2023)" },
  { brandId: "skoda", model: "Fabia", generation: "Mk3 (2014–2021)" },
  { brandId: "seat", model: "Leon", generation: "Mk3 (2012–2020)" },
  { brandId: "seat", model: "Ibiza", generation: "Mk4 (2008–2017)" },
  { brandId: "ford", model: "Focus", generation: "Mk3 (2011–2018)" },
  { brandId: "ford", model: "Fiesta", generation: "Mk7 (2008–2017)" },
  { brandId: "opel", model: "Astra", generation: "J (2009–2015)" },
  { brandId: "opel", model: "Insignia", generation: "A (2008–2017)" },
  { brandId: "renault", model: "Clio", generation: "Mk4 (2012–2019)" },
  { brandId: "renault", model: "Megane", generation: "Mk3 (2008–2016)" },
  { brandId: "peugeot", model: "308", generation: "T9 (2013–2021)" },
  { brandId: "peugeot", model: "208", generation: "A9 (2012–2019)" },
  { brandId: "toyota", model: "Corolla", generation: "E170 (2013–2018)" },
  { brandId: "toyota", model: "RAV4", generation: "XA40 (2013–2018)" },
  { brandId: "honda", model: "Civic", generation: "Mk9 (2011–2016)" },
  { brandId: "mazda", model: "Mazda3", generation: "BM (2013–2019)" },
  { brandId: "hyundai", model: "i30", generation: "GD (2011–2017)" },
  { brandId: "kia", model: "Ceed", generation: "JD (2012–2018)" },
  { brandId: "kia", model: "Sportage", generation: "QL (2015–2021)" },
  { brandId: "dacia", model: "Duster", generation: "Mk1 (2010–2017)" },
  { brandId: "dacia", model: "Logan", generation: "Mk2 (2012–2020)" },
];

// ── Pricing layer (placeholder) ──
// Edit this single value to change the base price. The configurator reads it
// here so pricing stays in one place for future per-config pricing.
export const CONFIG_BASE_PRICE_MKD = 2990;

