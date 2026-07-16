"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "mk" | "sq";

const mk = {
  // Navigation
  nav_home: "Почетна",
  nav_products: "Производи",
  nav_contact: "Контакт",
  nav_cart: "Корпа",

  // Hero
  hero_title: "Врвна заштита",
  hero_subtitle: "за вашиот автомобил",
  hero_desc: "Издржливи, практични и лесни за одржување.\nНаправени по мерка за секој модел.",
  hero_cta: "Види производи",

  // Brand Selector
  cat_label: "Категории",
  cat_title: "Пронајди патосници за твоето возило",
  cat_desc: "Избери бренд или пребарај директно по модел",
  search_placeholder: "Пребарај по модел... пр. Audi A3, Golf 5, BMW E90",
  search_show_all: "Покажи ги сите резултати за",
  search_no_results: "Нема резултати",
  all: "Сите",

  // Features
  feat_label: "Зошто нас",
  feat_title: "Квалитет кој се чувствува",
  feat_desc: "Секој производ е резултат на прецизна изработка и внимание кон деталите.",
  feat1_title: "Прецизно пасување",
  feat1_desc: "Секој сет е изработен по мерка за конкретниот модел возило — без сечење, без прилагодување.",
  feat2_title: "Еко гума без мирис",
  feat2_desc: "Изработени од еколошка гума без штетни материи и без непријатен мирис.",
  feat3_title: "Лесно одржување",
  feat3_desc: "Едноставно чистење со вода. Издржливи на кал, снег и секојдневна употреба.",
  feat4_title: "Долготрајна заштита",
  feat4_desc: "Го штитат оригиналниот под на возилото и ја задржуваат вредноста на вашиот автомобил.",

  // Trust Bar
  trust_customers: "5000+ задоволни клиенти",
  trust_thanks: "Ви благодариме за довербата.",
  trust1: "Брза достава",
  trust2: "Оригинален квалитет",
  trust3: "Плаќање при подигање",
  trust4: "Еко гума без мирис",

  // Reviews
  rev_label: "Рецензии",
  rev_title: "Што велат клиентите",
  rev_count: "Над 5.000 задоволни купувачи низ Македонија",
  rev1_text: "Одлични патосници, совршено пасуваат. Монтажата траеше 2 минути и изгледаат премиум. Препорачувам!",
  rev1_car: "VW Golf 7",
  rev2_text: "Купив за мојот BMW и воодушевен сум. Квалитетна гума, без мирис, лесни за чистење. Супер искуство.",
  rev2_car: "BMW 3 Series",
  rev3_text: "Веќе 6 месеци ги користам и изгледаат исто како нови. Брза достава и добра комуникација.",
  rev3_car: "Škoda Octavia",

  // Footer
  footer_nav: "Навигација",
  footer_contact: "Контакт",
  footer_desc: "Оригинални гумени патосници за сите марки возила. Изработени со прецизност за совршено пасување.",
  footer_rights: "Сите права задржани.",
  footer_follow: "Следи не на Facebook",

  // Product Card
  prod_original: "Оригинални гумени патосници",
  prod_details: "Детали",
  prod_add_cart: "Додај во корпа",
  prod_added: "Додадено ✓",
  prod_no_stock: "Нема залиха",

  // Product Detail
  prod_badge: "Оригинален производ",
  prod_back: "Назад кон производи",
  prod_vat: "со ДДВ · плаќање при подигање",
  feat_fit: "Прецизно пасување за овој модел",
  feat_clean: "Лесно чистење со вода",
  feat_durable: "Долготрајна заштита на подот",
  feat_delivery: "Достава низ цела Македонија",
  feat_payment: "Плаќање при подигање",
  order_now: "Нарачај сега →",
  order_label: "Нарачка",
  order_title: "Пополни ги деталите",
  order_direct: "Нарачај директно →",
  order_messenger: "Прашај не на Messenger",

  // Order Form
  order_success: "Нарачката е примена!",
  order_confirm: "Ќе ве контактираме по телефон за потврда.",
  order_submit: "Финално нарачај",
  order_sending: "Испраќање...",
  order_email_opt: "опционален — за потврда на нарачката",
  order_error: "Грешка при испраќање. Обидете се пак или јавете се директно.",
  order_no_net: "Нема интернет врска. Обидете се пак.",

  // Cart
  cart_back: "Назад кон производи",
  cart_empty: "Корпата е празна",
  cart_browse: "Разгледај производи",
  cart_total_items: "Вкупно производи",
  cart_total_price: "Вкупна цена",
  cart_payment_info: "Плаќање при подигање · Достава низ цела Македонија",
  cart_order_details: "Детали за нарачка",
  cart_order_all: "Нарачај сè",
  cart_thanks: "Ви благодариме! Ќе ве контактираме за потврда.",
  cart_continue: "Продолжи со купување",

  // Products Page
  prod_catalog: "Каталог",
  prod_all: "Сите Патосници",
  prod_suffix: "Патосници",
  prod_count_suffix: "производи",
  prod_search: "Пребарај модел...",
  prod_all_brands: "Сите брендови",
  prod_select_model: "Избери модел на",
  prod_contact: "Контактирај не",
  prod_contact_msg: "Контактирај не — ги имаме и за овој модел!",
};

const sq: typeof mk = {
  nav_home: "Ballina",
  nav_products: "Produktet",
  nav_contact: "Kontakt",
  nav_cart: "Shporta",

  hero_title: "Mbrojtje maksimale",
  hero_subtitle: "për automjetin tuaj",
  hero_desc: "Të qëndrueshme, praktike dhe të lehta për mirëmbajtje.\nTë prodhuara sipas modelit të çdo automjeti.",
  hero_cta: "Shiko produktet",

  cat_label: "Kategoritë",
  cat_title: "Gjej tapetet për automjetin tënd",
  cat_desc: "Zgjidh markën ose kërko direkt sipas modelit",
  search_placeholder: "Kërko sipas modelit... p.sh. Audi A3, Golf 5, BMW E90",
  search_show_all: "Shfaq të gjitha rezultatet për",
  search_no_results: "Nuk u gjetën rezultate",
  all: "Të gjitha",

  feat_label: "Pse ne",
  feat_title: "Cilësi që ndihet",
  feat_desc: "Çdo produkt është rezultat i prodhimit të saktë dhe vëmendjes ndaj detajeve.",
  feat1_title: "Përshtatje perfekte",
  feat1_desc: "Çdo set është prodhuar sipas modelit specifik të automjetit — pa prerje, pa përshtatje.",
  feat2_title: "Gomë ekologjike pa erë",
  feat2_desc: "Të prodhuara nga gomë ekologjike pa substanca të dëmshme dhe pa erë të pakëndshme.",
  feat3_title: "Mirëmbajtje e lehtë",
  feat3_desc: "Pastrohen lehtësisht me ujë. Rezistente ndaj baltës, borës dhe përdorimit të përditshëm.",
  feat4_title: "Mbrojtje afatgjatë",
  feat4_desc: "Mbrojnë dyshemenë origjinale të automjetit dhe ruajnë vlerën e tij.",

  trust_customers: "5000+ klientë të kënaqur",
  trust_thanks: "Faleminderit për besimin tuaj.",
  trust1: "Dërgesë e shpejtë",
  trust2: "Cilësi origjinale",
  trust3: "Pagesë në dorëzim",
  trust4: "Gomë ekologjike pa erë",

  rev_label: "Recensione",
  rev_title: "Çfarë thonë klientët",
  rev_count: "Mbi 5.000 klientë të kënaqur në gjithë Maqedoninë",
  rev1_text: "Tapete të shkëlqyera, përshtaten perfekt. Instalimi zgjati 2 minuta dhe duken premium. Rekomandoj!",
  rev1_car: "VW Golf 7",
  rev2_text: "Bleva për BMW-n tim dhe jam i mahnitur. Gomë me cilësi, pa erë, të lehta për pastrim. Përvojë e shkëlqyer.",
  rev2_car: "BMW 3 Series",
  rev3_text: "I përdor 6 muaj dhe duken njëlloj si të reja. Dërgesë e shpejtë dhe komunikim i mirë.",
  rev3_car: "Škoda Octavia",

  footer_nav: "Navigimi",
  footer_contact: "Kontakt",
  footer_desc: "Tapete origjinale gome për të gjitha markat e automjeteve. Të prodhuara me precizion për përshtatje perfekte.",
  footer_rights: "Të gjitha të drejtat e rezervuara.",
  footer_follow: "Na ndiqni në Facebook",

  prod_original: "Tapete origjinale gome",
  prod_details: "Detajet",
  prod_add_cart: "Shto në shportë",
  prod_added: "U shtua ✓",
  prod_no_stock: "Nuk ka stok",

  prod_badge: "Produkt origjinal",
  prod_back: "Kthehu te produktet",
  prod_vat: "me TVSH · pagesë në dorëzim",
  feat_fit: "Përshtatje perfekte për këtë model",
  feat_clean: "Pastrohet lehtësisht me ujë",
  feat_durable: "Mbrojtje afatgjatë e dyshemesë",
  feat_delivery: "Dërgesë në gjithë Maqedoninë",
  feat_payment: "Pagesë në dorëzim",
  order_now: "Porosit tani →",
  order_label: "Porosia",
  order_title: "Plotëso të dhënat",
  order_direct: "Porosit direkt →",
  order_messenger: "Na kontakto në Messenger",

  order_success: "Porosia u pranua!",
  order_confirm: "Do t\'ju kontaktojmë me telefon për konfirmim.",
  order_submit: "Përfundo porosinë",
  order_sending: "Duke u dërguar...",
  order_email_opt: "opsionale — për konfirmimin e porosisë",
  order_error: "Gabim gjatë dërgimit. Provoni përsëri ose na telefononi direkt.",
  order_no_net: "Nuk ka lidhje interneti. Provoni përsëri.",

  cart_back: "Kthehu te produktet",
  cart_empty: "Shporta është bosh",
  cart_browse: "Shiko produktet",
  cart_total_items: "Gjithsej produkte",
  cart_total_price: "Çmimi total",
  cart_payment_info: "Pagesë në dorëzim · Dërgesë në gjithë Maqedoninë",
  cart_order_details: "Detajet e porosisë",
  cart_order_all: "Porosit të gjitha",
  cart_thanks: "Faleminderit! Do t\'ju kontaktojmë për konfirmim.",
  cart_continue: "Vazhdo blerjen",

  prod_catalog: "Katalogu",
  prod_all: "Të gjitha tapetet",
  prod_suffix: "Tapete për",
  prod_count_suffix: "produkte",
  prod_search: "Kërko modelin...",
  prod_all_brands: "Të gjitha markat",
  prod_select_model: "Zgjidh modelin e",
  prod_contact: "Na kontaktoni",
  prod_contact_msg: "Na kontaktoni — i kemi edhe për këtë model!",
};

export type TKey = keyof typeof mk;

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("mk");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved === "sq") setLang("sq");
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  const t = (key: TKey): string =>
    (lang === "sq" ? sq[key] : mk[key]) ?? mk[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
