export type Brand = {
  id: string;
  name: string;
  logo: string;
  lightLogo?: boolean; // true = не применувај инверт
};

export const brands: Brand[] = [
  { id: "alfa-romeo",  name: "Alfa Romeo",  logo: "/brands/alfa-romeo.svg",  lightLogo: true  },
  { id: "audi",        name: "Audi",         logo: "/brands/audi.svg"        },
  { id: "bmw",         name: "BMW",          logo: "/brands/bmw.svg"         },
  { id: "chevrolet",   name: "Chevrolet",    logo: "/brands/chevrolet.svg"   },
  { id: "citroen",     name: "Citroën",      logo: "/brands/citroen.svg"     },
  { id: "cupra",       name: "Cupra",        logo: "/brands/cupra.svg"       },
  { id: "dacia",       name: "Dacia",        logo: "/brands/dacia.svg"       },
  { id: "daewoo",      name: "Daewoo",       logo: "/brands/daewoo.svg"      },
  { id: "ds",          name: "DS",           logo: "/brands/ds.svg"          },
  { id: "fiat",        name: "Fiat",         logo: "/brands/fiat.svg"        },
  { id: "ford",        name: "Ford",         logo: "/brands/ford.svg"        },
  { id: "genesis",     name: "Genesis",      logo: "/brands/genesis.svg"     },
  { id: "honda",       name: "Honda",        logo: "/brands/honda.svg"       },
  { id: "hyundai",     name: "Hyundai",      logo: "/brands/hyundai.svg"     },
  { id: "iveco",       name: "Iveco",        logo: "/brands/iveco.svg"       },
  { id: "jeep",        name: "Jeep",         logo: "/brands/jeep.svg"        },
  { id: "kia",         name: "Kia",          logo: "/brands/kia.svg"         },
  { id: "land-rover",  name: "Land Rover",   logo: "/brands/land-rover.svg"  },
  { id: "lancia",      name: "Lancia",       logo: "/brands/lancia.svg"      },
  { id: "lexus",       name: "Lexus",        logo: "/brands/lexus.svg",       lightLogo: true  },
  { id: "man",         name: "MAN",          logo: "/brands/man.svg",         lightLogo: true  },
  { id: "mazda",       name: "Mazda",        logo: "/brands/mazda.svg"       },
  { id: "mercedes",    name: "Mercedes",     logo: "/brands/mercedes.svg"    },
  { id: "mini",        name: "Mini",         logo: "/brands/mini.svg"        },
  { id: "mitsubishi",  name: "Mitsubishi",   logo: "/brands/mitsubishi.svg"  },
  { id: "nissan",      name: "Nissan",       logo: "/brands/nissan.svg"      },
  { id: "opel",        name: "Opel",         logo: "/brands/opel.svg"        },
  { id: "peugeot",     name: "Peugeot",      logo: "/brands/peugeot.svg"     },
  { id: "porsche",     name: "Porsche",      logo: "/brands/porsche.svg"     },
  { id: "renault",     name: "Renault",      logo: "/brands/renault.svg"     },
  { id: "seat",        name: "SEAT",         logo: "/brands/seat.svg"        },
  { id: "skoda",       name: "Škoda",        logo: "/brands/skoda.svg"       },
  { id: "smart",       name: "Smart",        logo: "/brands/smart.svg",       lightLogo: true  },
  { id: "suzuki",      name: "Suzuki",       logo: "/brands/suzuki.svg"      },
  { id: "toyota",      name: "Toyota",       logo: "/brands/toyota.svg"      },
  { id: "volkswagen",  name: "Volkswagen",   logo: "/brands/volkswagen.svg"  },
  { id: "volvo",       name: "Volvo",        logo: "/brands/volvo.svg"       },
];