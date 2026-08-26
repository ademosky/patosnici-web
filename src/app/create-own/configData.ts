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
  // ── Alfa Romeo ──
  { brandId: "alfa-romeo", model: "Giulietta", generation: "940 (2010–2020)" },
  { brandId: "alfa-romeo", model: "Giulia", generation: "952 (2016–)" },
  { brandId: "alfa-romeo", model: "Stelvio", generation: "949 (2017–)" },
  // ── Audi ──
  { brandId: "audi", model: "A3", generation: "8P (2003–2012)" },
  { brandId: "audi", model: "A3", generation: "8V (2012–2020)" },
  { brandId: "audi", model: "A4", generation: "B8 (2007–2015)" },
  { brandId: "audi", model: "A4", generation: "B9 (2015–2023)" },
  { brandId: "audi", model: "A6", generation: "C7 (2011–2018)" },
  { brandId: "audi", model: "Q5", generation: "8R (2008–2017)" },
  { brandId: "audi", model: "Q7", generation: "4M (2015–)" },
  // ── BMW ──
  { brandId: "bmw", model: "Seria 3", generation: "E90 (2005–2012)" },
  { brandId: "bmw", model: "Seria 3", generation: "F30 (2011–2019)" },
  { brandId: "bmw", model: "Seria 5", generation: "F10 (2010–2017)" },
  { brandId: "bmw", model: "Seria 5", generation: "G30 (2017–2023)" },
  { brandId: "bmw", model: "X3", generation: "F25 (2010–2017)" },
  { brandId: "bmw", model: "X5", generation: "F15 (2013–2018)" },
  // ── Chevrolet ──
  { brandId: "chevrolet", model: "Aveo", generation: "T300 (2011–2020)" },
  { brandId: "chevrolet", model: "Cruze", generation: "J300 (2008–2016)" },
  { brandId: "chevrolet", model: "Captiva", generation: "C140 (2006–2018)" },
  // ── Citroen ──
  { brandId: "citroen", model: "C3", generation: "Mk3 (2016–)" },
  { brandId: "citroen", model: "C4", generation: "Mk2 (2010–2018)" },
  { brandId: "citroen", model: "C5", generation: "Mk2 (2008–2017)" },
  // ── Cupra ──
  { brandId: "cupra", model: "Formentor", generation: "Mk1 (2020–)" },
  { brandId: "cupra", model: "Leon", generation: "Mk4 (2020–)" },
  // ── Dacia ──
  { brandId: "dacia", model: "Duster", generation: "Mk1 (2010–2017)" },
  { brandId: "dacia", model: "Duster", generation: "Mk2 (2017–)" },
  { brandId: "dacia", model: "Logan", generation: "Mk2 (2012–2020)" },
  { brandId: "dacia", model: "Sandero", generation: "Mk2 (2012–2020)" },
  // ── Daewoo ──
  { brandId: "daewoo", model: "Matiz", generation: "M150 (2000–2005)" },
  { brandId: "daewoo", model: "Nubira", generation: "J200 (2003–2008)" },
  // ── DS ──
  { brandId: "ds", model: "DS3", generation: "Mk1 (2010–2019)" },
  { brandId: "ds", model: "DS4", generation: "Mk1 (2011–2018)" },
  { brandId: "ds", model: "DS7 Crossback", generation: "Mk1 (2017–)" },
  // ── Fiat ──
  { brandId: "fiat", model: "500", generation: "312 (2007–)" },
  { brandId: "fiat", model: "Punto", generation: "Grande (2005–2018)" },
  { brandId: "fiat", model: "Tipo", generation: "356 (2016–)" },
  // ── Ford ──
  { brandId: "ford", model: "Focus", generation: "Mk3 (2011–2018)" },
  { brandId: "ford", model: "Focus", generation: "Mk4 (2018–)" },
  { brandId: "ford", model: "Fiesta", generation: "Mk7 (2008–2017)" },
  { brandId: "ford", model: "Kuga", generation: "Mk2 (2013–2019)" },
  // ── Genesis ──
  { brandId: "genesis", model: "G70", generation: "Mk1 (2017–)" },
  { brandId: "genesis", model: "GV70", generation: "Mk1 (2021–)" },
  // ── Honda ──
  { brandId: "honda", model: "Civic", generation: "Mk9 (2011–2016)" },
  { brandId: "honda", model: "Civic", generation: "Mk10 (2016–2022)" },
  { brandId: "honda", model: "CR-V", generation: "Mk4 (2012–2018)" },
  { brandId: "honda", model: "Jazz", generation: "Mk3 (2014–2020)" },
  // ── Hyundai ──
  { brandId: "hyundai", model: "i30", generation: "GD (2011–2017)" },
  { brandId: "hyundai", model: "i30", generation: "PD (2017–)" },
  { brandId: "hyundai", model: "Tucson", generation: "TL (2015–2021)" },
  { brandId: "hyundai", model: "Santa Fe", generation: "DM (2012–2018)" },
  // ── Iveco ──
  { brandId: "iveco", model: "Daily", generation: "Mk6 (2014–)" },
  // ── Jeep ──
  { brandId: "jeep", model: "Grand Cherokee", generation: "WK2 (2011–2021)" },
  { brandId: "jeep", model: "Compass", generation: "Mk2 (2017–)" },
  { brandId: "jeep", model: "Renegade", generation: "Mk1 (2014–)" },
  // ── Kia ──
  { brandId: "kia", model: "Ceed", generation: "JD (2012–2018)" },
  { brandId: "kia", model: "Ceed", generation: "CD (2018–)" },
  { brandId: "kia", model: "Sportage", generation: "QL (2015–2021)" },
  { brandId: "kia", model: "Sorento", generation: "UM (2015–2020)" },
  // ── Land Rover ──
  { brandId: "land-rover", model: "Range Rover Evoque", generation: "L538 (2011–2019)" },
  { brandId: "land-rover", model: "Discovery Sport", generation: "L550 (2014–)" },
  // ── Lancia ──
  { brandId: "lancia", model: "Ypsilon", generation: "846 (2011–)" },
  { brandId: "lancia", model: "Delta", generation: "844 (2008–2014)" },
  // ── Lexus ──
  { brandId: "lexus", model: "IS", generation: "XE30 (2013–2020)" },
  { brandId: "lexus", model: "NX", generation: "AZ10 (2014–2021)" },
  { brandId: "lexus", model: "RX", generation: "AL20 (2015–2022)" },
  // ── MAN ──
  { brandId: "man", model: "TGE", generation: "Mk1 (2017–)" },
  // ── Mazda ──
  { brandId: "mazda", model: "Mazda3", generation: "BM (2013–2019)" },
  { brandId: "mazda", model: "Mazda3", generation: "BP (2019–)" },
  { brandId: "mazda", model: "Mazda6", generation: "GJ (2012–2022)" },
  { brandId: "mazda", model: "CX-5", generation: "KE (2012–2017)" },
  // ── Mercedes ──
  { brandId: "mercedes", model: "C-Klasse", generation: "W204 (2007–2014)" },
  { brandId: "mercedes", model: "C-Klasse", generation: "W205 (2014–2021)" },
  { brandId: "mercedes", model: "E-Klasse", generation: "W212 (2009–2016)" },
  { brandId: "mercedes", model: "GLC", generation: "X253 (2015–2022)" },
  { brandId: "mercedes", model: "A-Klasse", generation: "W176 (2012–2018)" },
  // ── Mini ──
  { brandId: "mini", model: "Cooper", generation: "F56 (2014–)" },
  { brandId: "mini", model: "Countryman", generation: "F60 (2017–)" },
  // ── Mitsubishi ──
  { brandId: "mitsubishi", model: "ASX", generation: "Mk1 (2010–)" },
  { brandId: "mitsubishi", model: "Outlander", generation: "Mk3 (2012–2021)" },
  { brandId: "mitsubishi", model: "Lancer", generation: "Mk9 (2007–2017)" },
  // ── Nissan ──
  { brandId: "nissan", model: "Qashqai", generation: "J11 (2014–2021)" },
  { brandId: "nissan", model: "Qashqai", generation: "J10 (2007–2013)" },
  { brandId: "nissan", model: "Juke", generation: "F15 (2010–2019)" },
  { brandId: "nissan", model: "X-Trail", generation: "T32 (2014–2022)" },
  // ── Opel ──
  { brandId: "opel", model: "Astra", generation: "J (2009–2015)" },
  { brandId: "opel", model: "Astra", generation: "K (2015–2022)" },
  { brandId: "opel", model: "Insignia", generation: "A (2008–2017)" },
  { brandId: "opel", model: "Corsa", generation: "E (2014–2019)" },
  // ── Peugeot ──
  { brandId: "peugeot", model: "308", generation: "T9 (2013–2021)" },
  { brandId: "peugeot", model: "208", generation: "A9 (2012–2019)" },
  { brandId: "peugeot", model: "3008", generation: "P84 (2016–)" },
  { brandId: "peugeot", model: "508", generation: "R8 (2018–)" },
  // ── Porsche ──
  { brandId: "porsche", model: "Cayenne", generation: "958 (2010–2017)" },
  { brandId: "porsche", model: "Macan", generation: "95B (2014–)" },
  { brandId: "porsche", model: "Panamera", generation: "970 (2009–2016)" },
  // ── Renault ──
  { brandId: "renault", model: "Clio", generation: "Mk4 (2012–2019)" },
  { brandId: "renault", model: "Clio", generation: "Mk5 (2019–)" },
  { brandId: "renault", model: "Megane", generation: "Mk3 (2008–2016)" },
  { brandId: "renault", model: "Megane", generation: "Mk4 (2016–2023)" },
  { brandId: "renault", model: "Captur", generation: "Mk1 (2013–2019)" },
  // ── SEAT ──
  { brandId: "seat", model: "Leon", generation: "Mk3 (2012–2020)" },
  { brandId: "seat", model: "Leon", generation: "Mk4 (2020–)" },
  { brandId: "seat", model: "Ibiza", generation: "Mk4 (2008–2017)" },
  { brandId: "seat", model: "Ibiza", generation: "Mk5 (2017–)" },
  { brandId: "seat", model: "Ateca", generation: "Mk1 (2016–)" },
  // ── Škoda ──
  { brandId: "skoda", model: "Octavia", generation: "Mk3 (2013–2020)" },
  { brandId: "skoda", model: "Octavia", generation: "Mk4 (2020–)" },
  { brandId: "skoda", model: "Superb", generation: "B8 (2015–2023)" },
  { brandId: "skoda", model: "Fabia", generation: "Mk3 (2014–2021)" },
  { brandId: "skoda", model: "Kodiaq", generation: "Mk1 (2017–)" },
  // ── Smart ──
  { brandId: "smart", model: "Fortwo", generation: "W453 (2014–)" },
  { brandId: "smart", model: "Forfour", generation: "W453 (2014–)" },
  // ── Suzuki ──
  { brandId: "suzuki", model: "Swift", generation: "Mk4 (2010–2017)" },
  { brandId: "suzuki", model: "Swift", generation: "Mk5 (2017–)" },
  { brandId: "suzuki", model: "Vitara", generation: "LY (2015–)" },
  { brandId: "suzuki", model: "SX4 S-Cross", generation: "Mk1 (2013–2021)" },
  // ── Toyota ──
  { brandId: "toyota", model: "Corolla", generation: "E170 (2013–2018)" },
  { brandId: "toyota", model: "Corolla", generation: "E210 (2018–)" },
  { brandId: "toyota", model: "RAV4", generation: "XA40 (2013–2018)" },
  { brandId: "toyota", model: "RAV4", generation: "XA50 (2018–)" },
  { brandId: "toyota", model: "Yaris", generation: "XP130 (2011–2020)" },
  // ── Volkswagen ──
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
  // ── Volvo ──
  { brandId: "volvo", model: "XC60", generation: "Mk1 (2008–2017)" },
  { brandId: "volvo", model: "XC60", generation: "Mk2 (2017–)" },
  { brandId: "volvo", model: "XC90", generation: "Mk2 (2015–)" },
  { brandId: "volvo", model: "V60", generation: "Mk1 (2010–2018)" },
  { brandId: "volvo", model: "S60", generation: "Mk2 (2010–2018)" },
];

// ── Pricing

// ── Pricing layer (placeholder) ──
// Edit this single value to change the base price. The configurator reads it
// here so pricing stays in one place for future per-config pricing.
export const CONFIG_BASE_PRICE_MKD = 2990;

