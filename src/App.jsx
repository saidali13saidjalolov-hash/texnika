import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ProductCard, { formatUZSPrice } from './ProductCard';
import './App.css';

/**
 * Ntexnik — Zamonaviy Maishiy Texnika Internet-Do'koni
 * Fayl: App.jsx
 * Arxitektura: To'liq tijorat (e-commerce) front-end ilovasi
 * Imkoniyatlar: Katalog, Aqlli filtrlash, Sevimlilar (Wishlist), Taqqoslash,
 * Savatcha + Promokodlar + Checkout, Muddatli to'lov kalkulyatori, Quick View.
 */

/* ==========================================================================
   1. DOIMIY MA'LUMOTLAR (Kategoriyalar, Shaharlar, Aksiya Slaydlari, Katalog)
   ========================================================================== */

const STORAGE_KEYS = {
  FAVORITES: 'ntexnik_favorites_v1',
  CART: 'ntexnik_cart_v1',
  COMPARE: 'ntexnik_compare_v1',
  CITY: 'ntexnik_city_v1',
  ORDERS: 'ntexnik_orders_v1',
};

const UZ_CITIES = [
  { id: 'tashkent', name: 'Toshkent shahri', deliveryEta: 'Bugun 3 soat ichida', freeThreshold: 1500000, fee: 35000 },
  { id: 'samarkand', name: 'Samarqand', deliveryEta: 'Ertaga 10:00 – 18:00', freeThreshold: 3000000, fee: 65000 },
  { id: 'bukhara', name: 'Buxoro', deliveryEta: '1–2 ish kuni', freeThreshold: 3500000, fee: 75000 },
  { id: 'andijan', name: 'Andijon', deliveryEta: '1–2 ish kuni', freeThreshold: 3500000, fee: 75000 },
  { id: 'namangan', name: 'Namangan', deliveryEta: '1–2 ish kuni', freeThreshold: 3500000, fee: 75000 },
  { id: 'fergana', name: "Farg'ona", deliveryEta: '1–2 ish kuni', freeThreshold: 3500000, fee: 75000 },
];

const CATEGORIES = [
  { id: 'all', label: 'Barcha texnikalar', shortLabel: 'Barchasi', badge: '16' },
  { id: 'refrigerators', label: 'Muzlatkichlar', shortLabel: 'Muzlatkich', badge: 'NoFrost' },
  { id: 'washing', label: 'Kir yuvish mashinalari', shortLabel: 'Kir yuvish', badge: 'AI DD' },
  { id: 'tv', label: 'Televizorlar', shortLabel: 'TV & Audio', badge: '4K / OLED' },
  { id: 'climate', label: 'Iqlim texnikasi', shortLabel: 'Konditsioner', badge: 'Inverter' },
  { id: 'kitchen', label: 'Oshxona texnikasi', shortLabel: 'Oshxona', badge: 'Smart' },
  { id: 'vacuum', label: 'Changyutkichlar', shortLabel: 'Tozalash', badge: 'Laser' },
];

const BRANDS = [
  'Samsung',
  'LG',
  'Bosch',
  'Dyson',
  'Sony',
  "De'Longhi",
  'Roborock',
  'Gree',
  'Philips',
  'Artel',
];

const PROMO_CODES = {
  NTEXNIK10: { code: 'NTEXNIK10', discountPercent: 10, description: 'Barcha texnikalarga 10% chegirma' },
  YANGI2026: { code: 'YANGI2026', discountPercent: 7, description: 'Yangi mijozlar uchun 7% maxsus chegirma' },
  VIP15: { code: 'VIP15', discountPercent: 15, description: 'Premium mijozlar uchun 15% chegirma' },
};

const HERO_SLIDES = [
  {
    id: 'slide-1',
    eyebrow: 'YANGI AVLOD SMART UY TEXNIKALARI',
    title: 'Samsung Bespoke & LG AI DD — Uyingiz uchun mukammal uyg‘unlik',
    subtitle:
      '0% boshlang‘ich to‘lov bilan 24 oygacha muddatli to‘lov, rasmiy 3 yillik servis kafolati va Toshkent bo‘ylab bepul o‘rnatib berish xizmati.',
    ctaPrimary: 'Katalogni ko‘rish',
    ctaSecondary: 'Muddatli to‘lovni hisoblash',
    targetCategory: 'all',
    accentTag: 'Chegirmalar -28% gacha',
    highlightMetric: '3 yil rasmiy kafolat',
    image:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'slide-2',
    eyebrow: 'KINOZAL SIFATI UYINGIZDA',
    title: 'OLED evo va Neo QLED 4K Televizorlar kolleksiyasi',
    subtitle:
      '144Hz yangilanish chastotasi, Dolby Vision IQ va sun’iy intellekt protsessorlari bilan har bir kadrni jonli his eting.',
    ctaPrimary: 'Televizorlarni tanlash',
    ctaSecondary: 'Barcha aksiyalar',
    targetCategory: 'tv',
    accentTag: 'Sovg‘aga devor kronshteyni',
    highlightMetric: '120Hz / 144Hz Gaming',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'slide-3',
    eyebrow: 'ENERGIYA TEJAMKOR IQLIM VA TOZALIK',
    title: 'Dyson V15 Detect va Inverter Konditsionerlar mavsumi',
    subtitle:
      'A+++ energiya samaradorligi bilan elektr sarfini 45% gacha kamaytiring. Harorat va havo tozaligini smartfondan boshqaring.',
    ctaPrimary: 'Tozalash texnikalari',
    ctaSecondary: 'Iqlim texnikalari',
    targetCategory: 'vacuum',
    accentTag: 'Bepul ekspress yetkazish',
    highlightMetric: 'A+++ Eko standart',
    image:
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=85',
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 101,
    sku: 'NTX-REF-101',
    title: 'Samsung RB38A7B6AS9/WT Bespoke NoFrost Muzlatkich',
    brand: 'Samsung',
    category: 'refrigerators',
    categoryLabel: 'Muzlatkichlar',
    price: 11490000,
    oldPrice: 13200000,
    rating: 4.9,
    reviewsCount: 84,
    stock: 9,
    warranty: '3 yil (kompressor 20 yil)',
    deliveryText: 'Toshkent bo‘ylab bepul yetkazish',
    energyClass: 'A+++',
    isInverter: true,
    isSmartWifi: true,
    isNew: true,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Kumush Inox (385 L)',
        shortLabel: 'Inox',
        colorHex: '#94a3b8',
        price: 11490000,
        oldPrice: 13200000,
        sku: 'NTX-REF-101-SLV',
      },
      {
        name: 'Qora Grafite Mat (385 L)',
        shortLabel: 'Qora mat',
        colorHex: '#1e293b',
        price: 11890000,
        oldPrice: 13600000,
        sku: 'NTX-REF-101-BLK',
      },
    ],
    specs: [
      { label: 'Umumiy hajmi', value: '385 litr (273 / 112 L)' },
      { label: 'Sovutish tizimi', value: 'Twin Cooling Plus NoFrost' },
      { label: 'Kompressor turi', value: 'Digital Inverter (35 dB)' },
      { label: 'O‘lchamlari (B×E×Ch)', value: '203 × 59.5 × 65.8 sm' },
      { label: 'Boshqaruv', value: 'SmartThings Wi-Fi + Ichki displey' },
    ],
    shortDescription:
      'SpaceMax texnologiyasi tufayli tashqi o‘lchamlar o‘zgarmagan holda ichki sig‘imi kengaytirilgan, ikki konturli sovutish tizimiga ega zamonaviy muzlatkich.',
  },
  {
    id: 102,
    sku: 'NTX-WSH-102',
    title: 'LG F2V5GS0W AI DD Steam 8.5 kg Kir yuvish mashinasi',
    brand: 'LG',
    category: 'washing',
    categoryLabel: 'Kir yuvish mashinalari',
    price: 6890000,
    oldPrice: 7950000,
    rating: 4.9,
    reviewsCount: 112,
    stock: 14,
    warranty: '3 yil (motor 10 yil)',
    deliveryText: 'Bepul yetkazish va ulash',
    energyClass: 'A+++',
    isInverter: true,
    isSmartWifi: true,
    isNew: false,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Oq / Qora lyuk (8.5 kg)',
        shortLabel: '8.5 kg Oq',
        colorHex: '#f8fafc',
        price: 6890000,
        oldPrice: 7950000,
        sku: 'NTX-WSH-102-85W',
      },
      {
        name: 'Kumush (9.0 kg)',
        shortLabel: '9.0 kg Inox',
        colorHex: '#64748b',
        price: 7450000,
        oldPrice: 8500000,
        sku: 'NTX-WSH-102-90S',
      },
    ],
    specs: [
      { label: 'Maksimal yuklama', value: '8.5 kg' },
      { label: 'Siqish tezligi', value: '1200 ayl/daq' },
      { label: 'Dvigatel', value: 'Inverter Direct Drive' },
      { label: 'Bug‘ funksiyasi', value: 'LG Steam+ (99.9% allergen tozalash)' },
      { label: 'Chuqurligi', value: '47.5 sm (ixcham korpus)' },
    ],
    shortDescription:
      'AI DD intellektual tizimi mato og‘irligi va yumshoqligini aniqlab, 20 000 dan ortiq yuvish algoritmlaridan eng optimalini avtomatik tanlaydi.',
  },
  {
    id: 103,
    sku: 'NTX-TV-103',
    title: 'Samsung QE65QN85D Neo QLED 4K Smart TV 65"',
    brand: 'Samsung',
    category: 'tv',
    categoryLabel: 'Televizorlar',
    price: 16990000,
    oldPrice: 19800000,
    rating: 5.0,
    reviewsCount: 47,
    stock: 4,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bepul ekspress yetkazish',
    energyClass: 'A+',
    isInverter: false,
    isSmartWifi: true,
    isNew: true,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: '55 dyuym (139 sm)',
        shortLabel: '55"',
        price: 13490000,
        oldPrice: 15500000,
        sku: 'NTX-TV-103-55',
      },
      {
        name: '65 dyuym (165 sm)',
        shortLabel: '65"',
        price: 16990000,
        oldPrice: 19800000,
        sku: 'NTX-TV-103-65',
      },
      {
        name: '75 dyuym (190 sm)',
        shortLabel: '75"',
        price: 23900000,
        oldPrice: 27400000,
        sku: 'NTX-TV-103-75',
      },
    ],
    specs: [
      { label: 'Ekran diagonali', value: '65" (3840×2160 4K Ultra HD)' },
      { label: 'Matritsa texnologiyasi', value: 'Quantum Matrix Mini LED' },
      { label: 'Yangilanish chastotasi', value: '120Hz (Motion Xcelerator)' },
      { label: 'Ovoz tizimi', value: '60W Dolby Atmos OTS' },
      { label: 'Protsessor', value: 'NQ4 AI Gen2 Processor' },
    ],
    shortDescription:
      'Mini LED yoritish va sun’iy intellekt asosidagi 4K tasvirni yaxshilash protsessori bilan chuqur qora rang va yuqori kontrastni ta’minlaydi.',
  },
  {
    id: 104,
    sku: 'NTX-VAC-104',
    title: 'Dyson V15 Detect Absolute Simsiz Changyutkich',
    brand: 'Dyson',
    category: 'vacuum',
    categoryLabel: 'Changyutkichlar',
    price: 9450000,
    oldPrice: 10900000,
    rating: 4.9,
    reviewsCount: 96,
    stock: 7,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bugun bepul yetkazish',
    energyClass: 'A+++',
    isInverter: true,
    isSmartWifi: false,
    isNew: false,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Sariq / Nikel (8 ta nasadka)',
        shortLabel: 'Absolute',
        colorHex: '#eab308',
        price: 9450000,
        oldPrice: 10900000,
        sku: 'NTX-VAC-104-ABS',
      },
      {
        name: 'Ko‘k / Mis (10 ta nasadka)',
        shortLabel: 'Complete',
        colorHex: '#0284c7',
        price: 10150000,
        oldPrice: 11600000,
        sku: 'NTX-VAC-104-CMP',
      },
    ],
    specs: [
      { label: 'So‘rish quvvati', value: '240 AW (Hyperdymium motor)' },
      { label: 'Avtonom ishlash', value: '60 daqiqagacha' },
      { label: 'Maxsus texnologiya', value: 'Fluffy Optic yashil lazer nuri' },
      { label: 'Filtrlash', value: 'To‘liq germetik HEPA (99.99%)' },
      { label: 'Og‘irligi', value: '3.08 kg' },
    ],
    shortDescription:
      'Yashil lazerli nasadka qattiq pollardagi ko‘zga ko‘rinmas chang zarralarini yoritib beradi, piezo-sensor esa so‘rish quvvatini avtomatik moslaydi.',
  },
  {
    id: 105,
    sku: 'NTX-CLM-105',
    title: 'Gree Bora Inverter GWH12AAB-K6DNA1A Konditsioner (12)',
    brand: 'Gree',
    category: 'climate',
    categoryLabel: 'Iqlim texnikasi',
    price: 5690000,
    oldPrice: 6490000,
    rating: 4.8,
    reviewsCount: 138,
    stock: 19,
    warranty: '3 yil rasmiy kafolat',
    deliveryText: 'Toshkent bo‘ylab bepul yetkazish',
    energyClass: 'A++',
    isInverter: true,
    isSmartWifi: true,
    isNew: false,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1614631446501-abcf76949eca?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: '09 BTU (25 m² gacha)',
        shortLabel: '09 (25 m²)',
        price: 4990000,
        oldPrice: 5650000,
        sku: 'NTX-CLM-105-09',
      },
      {
        name: '12 BTU (35 m² gacha)',
        shortLabel: '12 (35 m²)',
        price: 5690000,
        oldPrice: 6490000,
        sku: 'NTX-CLM-105-12',
      },
      {
        name: '18 BTU (50 m² gacha)',
        shortLabel: '18 (50 m²)',
        price: 7890000,
        oldPrice: 8900000,
        sku: 'NTX-CLM-105-18',
      },
    ],
    specs: [
      { label: 'Tavsiya etilgan maydon', value: '35 m² gacha' },
      { label: 'Kompressor', value: 'G10 Full DC Inverter' },
      { label: 'Freon turi', value: 'R32 ekologik sovutgich' },
      { label: 'Ishlash diapazoni', value: '-15°C dan +50°C gacha' },
      { label: 'Shovqin darajasi', value: '24 dB (tungi rejim)' },
    ],
    shortDescription:
      'Past kuchlanishda (150V dan) ham barqaror ishlovchi, Cold Plasma havo ionizatori va Wi-Fi boshqaruviga ega tejamkor split-tizim.',
  },
  {
    id: 106,
    sku: 'NTX-KIT-106',
    title: "De'Longhi Magnifica Evo ECAM290.81.TB Qahva mashinasi",
    brand: "De'Longhi",
    category: 'kitchen',
    categoryLabel: 'Oshxona texnikasi',
    price: 8950000,
    oldPrice: 10200000,
    rating: 4.9,
    reviewsCount: 63,
    stock: 6,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bugun bepul yetkazish',
    energyClass: 'A+',
    isInverter: false,
    isSmartWifi: false,
    isNew: true,
    isBestseller: false,
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Titan Qora (LatteCrema)',
        shortLabel: 'Titan Qora',
        colorHex: '#334155',
        price: 8950000,
        oldPrice: 10200000,
        sku: 'NTX-KIT-106-TB',
      },
    ],
    specs: [
      { label: 'Bosim kuchi', value: '15 bar' },
      { label: 'Ichimliklar soni', value: '7 ta avtomatik retsept' },
      { label: 'Sut ko‘pirtirgich', value: 'LatteCrema Hot avtomatik tizim' },
      { label: 'Qahva tegirmoni', value: 'Po‘lat konusli (13 daraja)' },
      { label: 'Suv idishi hajmi', value: '1.8 litr' },
    ],
    shortDescription:
      'Bir tugmani bosish orqali yangi maydalangan donlardan espresso, kapuchino va latte makkiato tayyorlovchi avtomatik qahva mashinasi.',
  },
  {
    id: 107,
    sku: 'NTX-REF-107',
    title: 'LG GC-Q257CBFS InstaView Door-in-Door Side-by-Side',
    brand: 'LG',
    category: 'refrigerators',
    categoryLabel: 'Muzlatkichlar',
    price: 19490000,
    oldPrice: 22100000,
    rating: 5.0,
    reviewsCount: 39,
    stock: 3,
    warranty: '3 yil (kompressor 10 yil)',
    deliveryText: 'Bepul ko‘tarib kirish va o‘rnatish',
    energyClass: 'A++',
    isInverter: true,
    isSmartWifi: true,
    isNew: true,
    isBestseller: false,
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Mat Qora Po‘lat (647 L)',
        shortLabel: '647 L Mat Qora',
        colorHex: '#0f172a',
        price: 19490000,
        oldPrice: 22100000,
        sku: 'NTX-REF-107-MB',
      },
    ],
    specs: [
      { label: 'Umumiy hajmi', value: '647 litr' },
      { label: 'InstaView oynasi', value: '2 marta taqillatish bilan yoritish' },
      { label: 'Gigiyena filtri', value: 'Hygiene Fresh+ (5 bosqichli)' },
      { label: 'Kompressor', value: 'Smart Inverter Linear' },
      { label: 'O‘lchamlari (B×E×Ch)', value: '179 × 91.3 × 73.5 sm' },
    ],
    shortDescription:
      'Eshikni ochmasdan ichkarini ko‘rish imkonini beruvchi tonirovka qilingan shisha panel va sovuq havo yo‘qotilishini 41% kamaytiruvchi Door-in-Door tizimi.',
  },
  {
    id: 108,
    sku: 'NTX-KIT-108',
    title: 'Bosch Serie 6 SMV6ZCX42E O‘rnatiladigan Idish yuvish mashinasi',
    brand: 'Bosch',
    category: 'kitchen',
    categoryLabel: 'Oshxona texnikasi',
    price: 10290000,
    oldPrice: 11700000,
    rating: 4.9,
    reviewsCount: 54,
    stock: 8,
    warranty: '3 yil rasmiy kafolat',
    deliveryText: 'Toshkent bo‘ylab bepul yetkazish',
    energyClass: 'A+++',
    isInverter: true,
    isSmartWifi: true,
    isNew: false,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: '60 sm (14 komplekt)',
        shortLabel: '60 sm (14 komp.)',
        price: 10290000,
        oldPrice: 11700000,
        sku: 'NTX-KIT-108-60',
      },
    ],
    specs: [
      { label: 'Sig‘imi', value: '14 ta idishlar komplekti' },
      { label: 'Quritish texnologiyasi', value: 'PerfectDry Zeolith minerali' },
      { label: 'Dvigatel', value: 'EcoSilence Drive (42 dB)' },
      { label: 'Indikatsiya', value: 'TimeLight polga proyeksiya' },
      { label: 'Boshqaruv', value: 'Home Connect Wi-Fi' },
    ],
    shortDescription:
      'Tabiiy Zeolith minerali yordamida plastik idishlarni ham mukammal quritadigan va polga qolgan vaqtni nur bilan ko‘rsatadigan nemis sifati.',
  },
  {
    id: 109,
    sku: 'NTX-TV-109',
    title: 'LG OLED55C4RLA OLED evo 4K 144Hz Smart TV 55"',
    brand: 'LG',
    category: 'tv',
    categoryLabel: 'Televizorlar',
    price: 15890000,
    oldPrice: 18400000,
    rating: 4.9,
    reviewsCount: 68,
    stock: 5,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bepul yetkazish va tekshirish',
    energyClass: 'A',
    isInverter: false,
    isSmartWifi: true,
    isNew: true,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: '55 dyuym OLED evo',
        shortLabel: '55"',
        price: 15890000,
        oldPrice: 18400000,
        sku: 'NTX-TV-109-55',
      },
      {
        name: '65 dyuym OLED evo',
        shortLabel: '65"',
        price: 21490000,
        oldPrice: 24900000,
        sku: 'NTX-TV-109-65',
      },
    ],
    specs: [
      { label: 'Ekran turi', value: 'Self-lit OLED evo 4K' },
      { label: 'Protsessor', value: 'α9 AI Processor 4K Gen7' },
      { label: 'O‘yin rejimi', value: '144Hz, G-Sync, FreeSync, 0.1ms' },
      { label: 'HDR formatlari', value: 'Dolby Vision, HDR10, HLG' },
      { label: 'Pult', value: 'Magic Remote ko‘rsatkichli pult' },
    ],
    shortDescription:
      'Har bir pikseli mustaqil yonuvchi OLED evo ekrani cheksiz kontrast, mutlaq qora rang va PlayStation 5 / PC o‘yinlari uchun 144Hz tezlikni taqdim etadi.',
  },
  {
    id: 110,
    sku: 'NTX-VAC-110',
    title: 'Roborock S8 MaxV Ultra Robot Changyutkich (Stansiya bilan)',
    brand: 'Roborock',
    category: 'vacuum',
    categoryLabel: 'Changyutkichlar',
    price: 13790000,
    oldPrice: 15900000,
    rating: 4.9,
    reviewsCount: 51,
    stock: 5,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bugun bepul yetkazish',
    energyClass: 'A+++',
    isInverter: true,
    isSmartWifi: true,
    isNew: true,
    isBestseller: false,
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Qora (RockDock Ultra 8-in-1)',
        shortLabel: 'Qora',
        colorHex: '#18181b',
        price: 13790000,
        oldPrice: 15900000,
        sku: 'NTX-VAC-110-BLK',
      },
      {
        name: 'Oq (RockDock Ultra 8-in-1)',
        shortLabel: 'Oq',
        colorHex: '#f8fafc',
        price: 13790000,
        oldPrice: 15900000,
        sku: 'NTX-VAC-110-WHT',
      },
    ],
    specs: [
      { label: 'So‘rish quvvati', value: '10 000 Pa HyperForce' },
      { label: 'Baza imkoniyatlari', value: '60°C issiq suvda yuvish va quritish' },
      { label: 'Navigatsiya', value: 'Reactive AI 2.0 RGB kamera + LiDAR' },
      { label: 'Burchak tozalash', value: 'FlexiArm chiqadigan yon cho‘tka' },
      { label: 'Avtonomlik', value: '180 daqiqa (300 m² gacha)' },
    ],
    shortDescription:
      'O‘zini-o‘zi issiq suvda yuvuvchi, changni xaltasiga bo‘shatuvchi va burchaklardagi changni chiqadigan cho‘tka bilan supuruvchi avtonom robot.',
  },
  {
    id: 111,
    sku: 'NTX-WSH-111',
    title: 'Bosch Serie 8 WAX32EH0OE 10 kg Kir yuvish mashinasi (i-DOS)',
    brand: 'Bosch',
    category: 'washing',
    categoryLabel: 'Kir yuvish mashinalari',
    price: 12490000,
    oldPrice: 14100000,
    rating: 4.9,
    reviewsCount: 33,
    stock: 4,
    warranty: '3 yil rasmiy kafolat',
    deliveryText: 'Bepul yetkazish va ulash',
    energyClass: 'A+++',
    isInverter: true,
    isSmartWifi: true,
    isNew: false,
    isBestseller: false,
    images: [
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Oq / Xrom lyuk (10 kg)',
        shortLabel: '10 kg',
        colorHex: '#ffffff',
        price: 12490000,
        oldPrice: 14100000,
        sku: 'NTX-WSH-111-10',
      },
    ],
    specs: [
      { label: 'Maksimal yuklama', value: '10 kg' },
      { label: 'Siqish tezligi', value: '1600 ayl/daq' },
      { label: 'Aqlli dozalash', value: 'i-DOS avtomatik gel o‘lchagich' },
      { label: 'Dog‘ ketkazish', value: 'AntiStain Plus (16 xil dog‘)' },
      { label: 'Ishlab chiqarilgan', value: 'Germaniya' },
    ],
    shortDescription:
      'i-DOS sensorlari kiyim kirlanish darajasini o‘lchab, suyuq kukun va suvni milligramm aniqlikda avtomatik quyadi.',
  },
  {
    id: 112,
    sku: 'NTX-CLM-112',
    title: 'Samsung AR12BXHQASINUA WindFree Comfort Inverter Konditsioner',
    brand: 'Samsung',
    category: 'climate',
    categoryLabel: 'Iqlim texnikasi',
    price: 7390000,
    oldPrice: 8450000,
    rating: 4.8,
    reviewsCount: 77,
    stock: 11,
    warranty: '3 yil (kompressor 10 yil)',
    deliveryText: 'Toshkent bo‘ylab bepul yetkazish',
    energyClass: 'A++',
    isInverter: true,
    isSmartWifi: true,
    isNew: true,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1614631446501-abcf76949eca?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: '12 BTU (35 m² gacha)',
        shortLabel: '12 BTU',
        price: 7390000,
        oldPrice: 8450000,
        sku: 'NTX-CLM-112-12',
      },
      {
        name: '18 BTU (52 m² gacha)',
        shortLabel: '18 BTU',
        price: 9490000,
        oldPrice: 10800000,
        sku: 'NTX-CLM-112-18',
      },
    ],
    specs: [
      { label: 'Sovutish texnologiyasi', value: 'WindFree (23 000 mikro-teshik)' },
      { label: 'Kompressor', value: 'Digital Inverter Boost' },
      { label: 'Shovqin darajasi', value: '19 dB (deyarli ovozsiz)' },
      { label: 'Boshqaruv', value: 'SmartThings AI Auto Cooling' },
      { label: 'O‘zini tozalash', value: 'Freeze Wash funksiyasi' },
    ],
    shortDescription:
      'Sovuq shamol oqimisiz, 23 000 ta mikro-teshiklar orqali xonani bir tekis va sokin salqinlatuvchi WindFree texnologiyasi.',
  },
  {
    id: 113,
    sku: 'NTX-KIT-113',
    title: 'Philips HD9880/90 Airfryer Combi XXL 7000 Series Aerogril',
    brand: 'Philips',
    category: 'kitchen',
    categoryLabel: 'Oshxona texnikasi',
    price: 4490000,
    oldPrice: 5250000,
    rating: 4.9,
    reviewsCount: 91,
    stock: 15,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bugun bepul yetkazish',
    energyClass: 'A++',
    isInverter: false,
    isSmartWifi: true,
    isNew: true,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'XXL 8.3 litr (2 kg)',
        shortLabel: 'XXL 8.3 L',
        colorHex: '#0f172a',
        price: 4490000,
        oldPrice: 5250000,
        sku: 'NTX-KIT-113-XXL',
      },
    ],
    specs: [
      { label: 'Savat hajmi', value: '8.3 litr / 2.0 kg (7 porsiya)' },
      { label: 'Quvvati', value: '2200 Vt Rapid CombiAir' },
      { label: 'Harorat termometri', value: 'O‘rnatilgan oziq-ovqat termoshupi' },
      { label: 'Avto-dasturlar', value: '22 xil pishirish rejimi' },
      { label: 'Ilova', value: 'HomeID (NutriU) retseptlar bazasi' },
    ],
    shortDescription:
      'Yog‘siz yoki 99% kam yog‘ bilan qarsildoq taomlar tayyorlovchi, ichki haroratni termoshup orqali nazorat qiluvchi aqlli aerogril.',
  },
  {
    id: 114,
    sku: 'NTX-TV-114',
    title: 'Sony Bravia XR-65X90L Full Array LED 4K Google TV 65"',
    brand: 'Sony',
    category: 'tv',
    categoryLabel: 'Televizorlar',
    price: 18290000,
    oldPrice: 20900000,
    rating: 4.9,
    reviewsCount: 29,
    stock: 2,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bepul ekspress yetkazish',
    energyClass: 'A',
    isInverter: false,
    isSmartWifi: true,
    isNew: false,
    isBestseller: false,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: '65 dyuym Full Array LED',
        shortLabel: '65"',
        price: 18290000,
        oldPrice: 20900000,
        sku: 'NTX-TV-114-65',
      },
    ],
    specs: [
      { label: 'Protsessor', value: 'Cognitive Processor XR' },
      { label: 'Ekran', value: '65" 4K 120Hz Full Array LED' },
      { label: 'PS5 mosligi', value: 'Auto HDR Tone Mapping' },
      { label: 'Ovoz', value: 'Acoustic Multi-Audio' },
      { label: 'Operatsion tizim', value: 'Google TV + Apple AirPlay 2' },
    ],
    shortDescription:
      'Inson ko‘zi va qulog‘i idrokini takrorlovchi Cognitive Processor XR bilan kino va PlayStation 5 o‘yinlari uchun yaratilgan flagman televizor.',
  },
  {
    id: 115,
    sku: 'NTX-REF-115',
    title: 'Artel HD 455 RWENE Inverter NoFrost Muzlatkich',
    brand: 'Artel',
    category: 'refrigerators',
    categoryLabel: 'Muzlatkichlar',
    price: 5890000,
    oldPrice: 6650000,
    rating: 4.7,
    reviewsCount: 145,
    stock: 22,
    warranty: '3 yil to‘liq rasmiy kafolat',
    deliveryText: 'Toshkent bo‘ylab bepul yetkazish',
    energyClass: 'A++',
    isInverter: true,
    isSmartWifi: false,
    isNew: false,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Inox Kumush (350 L)',
        shortLabel: 'Inox',
        colorHex: '#94a3b8',
        price: 5890000,
        oldPrice: 6650000,
        sku: 'NTX-REF-115-SLV',
      },
      {
        name: 'Oq Klassik (350 L)',
        shortLabel: 'Oq',
        colorHex: '#f8fafc',
        price: 5690000,
        oldPrice: 6400000,
        sku: 'NTX-REF-115-WHT',
      },
    ],
    specs: [
      { label: 'Umumiy hajmi', value: '350 litr' },
      { label: 'Sovutish tizimi', value: 'Full NoFrost' },
      { label: 'Kompressor', value: 'Inverter (past kuchlanishga chidamli)' },
      { label: 'Boshqaruv', value: 'Tashqi sensorli LED displey' },
      { label: 'O‘lchamlari (B×E×Ch)', value: '185 × 60 × 65 sm' },
    ],
    shortDescription:
      'Mahalliy iqlim va elektr tarmog‘i o‘zgarishlariga moslashtirilgan, hamyonbop narxdagi ishonchli va tejamkor NoFrost muzlatkich.',
  },
  {
    id: 116,
    sku: 'NTX-CLM-116',
    title: 'Dyson Purifier Cool Formaldehyde TP09 Havo tozalagich',
    brand: 'Dyson',
    category: 'climate',
    categoryLabel: 'Iqlim texnikasi',
    price: 8790000,
    oldPrice: 9950000,
    rating: 4.9,
    reviewsCount: 41,
    stock: 5,
    warranty: '2 yil rasmiy kafolat',
    deliveryText: 'Bugun bepul yetkazish',
    energyClass: 'A+++',
    isInverter: true,
    isSmartWifi: true,
    isNew: true,
    isBestseller: false,
    images: [
      'https://images.unsplash.com/photo-1614631446501-abcf76949eca?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      {
        name: 'Oq / Oltin (TP09)',
        shortLabel: 'Oq / Oltin',
        colorHex: '#d4af37',
        price: 8790000,
        oldPrice: 9950000,
        sku: 'NTX-CLM-116-GLD',
      },
    ],
    specs: [
      { label: 'Filtrlash darajasi', value: 'HEPA H13 + Katalitik filtr' },
      { label: 'Zarralarni ushlash', value: '99.95% (PM0.1, allergen, formaldegid)' },
      { label: 'Havo aylanishi', value: 'Air Multiplier 290 l/sek' },
      { label: 'Aylanish burchagi', value: '350° gacha' },
      { label: 'Boshqaruv', value: 'MyDyson ilovasi + LCD displey' },
    ],
    shortDescription:
      'Xonadagi chang, gulchang, tutun va formaldegid gazlarini aniqlab, ularni mutlaqo zararsizlantiruvchi va salqin havo oqimi beruvchi qurilma.',
  },
];

/* ==========================================================================
   2. YORDAMCHI FUNKSIYALAR (LocalStorage va Vaqt hisoblagich)
   ========================================================================== */

const loadFromStorage = (key, fallbackValue) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage to'lgan yoki bloklangan holatda xatolikni yutish
  }
};

/* ==========================================================================
   3. ASOSIY ILOVA KOMPONENTI: App
   ========================================================================== */

function App() {
  // Foydalanuvchi holatlari (LocalStorage bilan sinxron)
  const [favorites, setFavorites] = useState(() =>
    loadFromStorage(STORAGE_KEYS.FAVORITES, [101, 104])
  );
  const [cart, setCart] = useState(() => loadFromStorage(STORAGE_KEYS.CART, []));
  const [compareIds, setCompareIds] = useState(() =>
    loadFromStorage(STORAGE_KEYS.COMPARE, [101, 107])
  );
  const [selectedCityId, setSelectedCityId] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CITY, 'tashkent')
  );
  const [orders, setOrders] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ORDERS, [])
  );

  // Navigatsiya, Qidiruv va Filtrlash holatlari
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPriceFilter, setMaxPriceFilter] = useState(25000000);
  const [energyFilter, setEnergyFilter] = useState('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyInverter, setOnlyInverter] = useState(false);
  const [onlyWifi, setOnlyWifi] = useState(false);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [onlyFavoritesTab, setOnlyFavoritesTab] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Hero Slider va Jonli Taymer holatlari
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [countdown, setCountdown] = useState({
    hours: 11,
    minutes: 42,
    seconds: 19,
  });

  // Mustaqil Muddatli To'lov Kalkulyatori holatlari
  const [calcProductId, setCalcProductId] = useState(101);
  const [calcDownPaymentPct, setCalcDownPaymentPct] = useState(0);
  const [calcMonths, setCalcMonths] = useState(12);

  // Drawer va Modal oynalar holatlari
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [compareOnlyDiff, setCompareOnlyDiff] = useState(false);

  // Checkout va Promokod holatlari
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'form' | 'success'
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('courier'); // 'courier' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState('card_on_delivery');
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    phone: '+998 ',
    address: '',
    comment: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Bildirishnoma (Toast) tizimi
  const [toasts, setToasts] = useState([]);

  // Bo'limlarga silliq o'tish uchun Ref-lar
  const catalogSectionRef = useRef(null);
  const calculatorSectionRef = useRef(null);
  const searchWrapRef = useRef(null);

  // LocalStorage saqlash effektlari
  useEffect(() => saveToStorage(STORAGE_KEYS.FAVORITES, favorites), [favorites]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CART, cart), [cart]);
  useEffect(() => saveToStorage(STORAGE_KEYS.COMPARE, compareIds), [compareIds]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CITY, selectedCityId), [selectedCityId]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ORDERS, orders), [orders]);

  // Hero Slider avto-almashuvi
  useEffect(() => {
    if (isHeroPaused) return undefined;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isHeroPaused]);

  // Kun mahsuloti teskari sanoq taymeri
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tashqariga bosilganda qidiruv tavsiyalarini yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(event.target)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC tugmasi bilan ochiq modal/drawer oynalarni yopish
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsFavoritesOpen(false);
        setIsCartOpen(false);
        setIsCompareOpen(false);
        setIsOrdersOpen(false);
        setQuickViewProduct(null);
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Toast qo'shish funksiyasi
  const pushToast = useCallback((title, subtitle = '', tone = 'default') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, title, subtitle, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const currentCity = useMemo(
    () => UZ_CITIES.find((c) => c.id === selectedCityId) || UZ_CITIES[0],
    [selectedCityId]
  );

  // Sevimlilarni almashtirish (Toggle Favorite)
  const handleToggleFavorite = useCallback(
    (productId) => {
      const targetProduct = INITIAL_PRODUCTS.find((p) => p.id === productId);
      setFavorites((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          pushToast(
            "Sevimlilardan olib tashlandi",
            targetProduct?.title || '',
            'muted'
          );
          return prev.filter((id) => id !== productId);
        }
        pushToast(
          "Sevimlilarga saqlandi",
          targetProduct?.title || '',
          'favorite'
        );
        return [productId, ...prev];
      });
    },
    [pushToast]
  );

  // Taqqoslash ro'yxatini almashtirish
  const handleToggleCompare = useCallback(
    (productId) => {
      const targetProduct = INITIAL_PRODUCTS.find((p) => p.id === productId);
      setCompareIds((prev) => {
        if (prev.includes(productId)) {
          pushToast(
            "Taqqoslashdan chiqarildi",
            targetProduct?.title || '',
            'muted'
          );
          return prev.filter((id) => id !== productId);
        }
        if (prev.length >= 4) {
          pushToast(
            'Maksimal 4 ta mahsulot',
            "Taqqoslash uchun avval birortasini o'chiring",
            'warning'
          );
          return prev;
        }
        pushToast(
          "Taqqoslash ro'yxatiga qo'shildi",
          targetProduct?.title || '',
          'info'
        );
        return [...prev, productId];
      });
    },
    [pushToast]
  );

  // Savatga mahsulot qo'shish
  const handleAddToCart = useCallback(
    (item) => {
      if (!item || !item.id) return;
      const itemKey = `${item.id}::${item.sku || 'default'}`;

      setCart((prev) => {
        const existingIndex = prev.findIndex((entry) => entry.key === itemKey);
        if (existingIndex > -1) {
          const updated = [...prev];
          const maxStock = item.stock || 99;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(updated[existingIndex].quantity + 1, maxStock),
          };
          return updated;
        }
        return [
          ...prev,
          {
            key: itemKey,
            id: item.id,
            sku: item.sku || `NTX-${item.id}`,
            title: item.title,
            brand: item.brand,
            price: item.price,
            oldPrice: item.oldPrice || 0,
            image: item.image || (item.images && item.images[0]) || '',
            variantName: item.selectedVariant?.name || '',
            stock: item.stock || 20,
            quantity: 1,
          },
        ];
      });

      pushToast("Savatga qo'shildi", item.title, 'success');
    },
    [pushToast]
  );

  // Savatdagi miqdorni o'zgartirish
  const handleUpdateCartQuantity = useCallback((productId, nextQty, sku) => {
    setCart((prev) => {
      return prev
        .map((entry) => {
          const matches = sku
            ? entry.id === productId && entry.sku === sku
            : entry.id === productId;
          if (!matches) return entry;
          return { ...entry, quantity: nextQty };
        })
        .filter((entry) => entry.quantity > 0);
    });
  }, []);

  const handleRemoveCartItem = useCallback((itemKey) => {
    setCart((prev) => prev.filter((entry) => entry.key !== itemKey));
  }, []);

  // Barcha sevimli mahsulotlarni savatga o'tkazish
  const handleMoveAllFavoritesToCart = useCallback(() => {
    const favProducts = INITIAL_PRODUCTS.filter((p) =>
      favorites.includes(p.id)
    );
    if (favProducts.length === 0) return;

    favProducts.forEach((prod) => {
      if (prod.stock > 0) {
        handleAddToCart({
          ...prod,
          image: prod.images[0],
          selectedVariant: prod.variants?.[0] || null,
        });
      }
    });
    setIsFavoritesOpen(false);
    setIsCartOpen(true);
  }, [favorites, handleAddToCart]);

  // Mahsulot ID bo'yicha savatdagi jami sonini olish
  const getProductCartQty = useCallback(
    (productId) => {
      return cart
        .filter((item) => item.id === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [cart]
  );

  // Qidiruv tavsiyalari (Autocomplete)
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return INITIAL_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  // Asosiy filtrlangan va saralangan katalog
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = INITIAL_PRODUCTS.filter((product) => {
      if (onlyFavoritesTab && !favorites.includes(product.id)) {
        return false;
      }
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.includes(product.brand)
      ) {
        return false;
      }
      if (product.price > maxPriceFilter) {
        return false;
      }
      if (energyFilter !== 'all' && product.energyClass !== energyFilter) {
        return false;
      }
      if (onlyInStock && product.stock <= 0) {
        return false;
      }
      if (onlyInverter && !product.isInverter) {
        return false;
      }
      if (onlyWifi && !product.isSmartWifi) {
        return false;
      }
      if (
        onlyDiscounts &&
        (!product.oldPrice || product.oldPrice <= product.price)
      ) {
        return false;
      }
      if (q) {
        const haystack = `${product.title} ${product.brand} ${product.categoryLabel} ${product.sku} ${product.shortDescription}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
        break;
      case 'discount':
        sorted.sort((a, b) => {
          const discA = a.oldPrice > a.price ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const discB = b.oldPrice > b.price ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return discB - discA;
        });
        break;
      case 'newest':
        sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
        break;
      case 'popular':
      default:
        sorted.sort(
          (a, b) =>
            Number(b.isBestseller) - Number(a.isBestseller) ||
            b.reviewsCount - a.reviewsCount
        );
        break;
    }

    return sorted;
  }, [
    onlyFavoritesTab,
    favorites,
    activeCategory,
    selectedBrands,
    maxPriceFilter,
    energyFilter,
    onlyInStock,
    onlyInverter,
    onlyWifi,
    onlyDiscounts,
    searchQuery,
    sortBy,
  ]);

  // Faol filtrlar soni
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'all') count += 1;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (maxPriceFilter < 25000000) count += 1;
    if (energyFilter !== 'all') count += 1;
    if (onlyInStock) count += 1;
    if (onlyInverter) count += 1;
    if (onlyWifi) count += 1;
    if (onlyDiscounts) count += 1;
    if (onlyFavoritesTab) count += 1;
    return count;
  }, [
    activeCategory,
    selectedBrands,
    maxPriceFilter,
    energyFilter,
    onlyInStock,
    onlyInverter,
    onlyWifi,
    onlyDiscounts,
    onlyFavoritesTab,
  ]);

  const handleResetFilters = useCallback(() => {
    setActiveCategory('all');
    setSelectedBrands([]);
    setMaxPriceFilter(25000000);
    setEnergyFilter('all');
    setOnlyInStock(false);
    setOnlyInverter(false);
    setOnlyWifi(false);
    setOnlyDiscounts(false);
    setOnlyFavoritesTab(false);
    setSearchQuery('');
    setSortBy('popular');
  }, []);

  const handleToggleBrand = useCallback((brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  // Savatcha moliyaviy hisob-kitoblari
  const cartSummary = useMemo(() => {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const originalSubtotal = cart.reduce(
      (sum, item) =>
        sum + (item.oldPrice > item.price ? item.oldPrice : item.price) * item.quantity,
      0
    );
    const productSavings = Math.max(0, originalSubtotal - subtotal);
    const promoDiscount = appliedPromo
      ? Math.round((subtotal * appliedPromo.discountPercent) / 100)
      : 0;
    const afterDiscount = Math.max(0, subtotal - promoDiscount);
    const shippingFee =
      deliveryMethod === 'pickup' ||
      afterDiscount === 0 ||
      afterDiscount >= currentCity.freeThreshold
        ? 0
        : currentCity.fee;
    const grandTotal = afterDiscount + shippingFee;

    return {
      totalCount,
      subtotal,
      productSavings,
      promoDiscount,
      shippingFee,
      grandTotal,
    };
  }, [cart, appliedPromo, deliveryMethod, currentCity]);

  // Sevimlilar ro'yxati ob'ektlari
  const favoriteProducts = useMemo(
    () => INITIAL_PRODUCTS.filter((p) => favorites.includes(p.id)),
    [favorites]
  );

  // Taqqoslash ro'yxati ob'ektlari
  const comparedProducts = useMemo(
    () => INITIAL_PRODUCTS.filter((p) => compareIds.includes(p.id)),
    [compareIds]
  );

  // Kun mahsuloti (Flash Deal)
  const dealOfTheDayProduct = useMemo(
    () => INITIAL_PRODUCTS.find((p) => p.id === 103) || INITIAL_PRODUCTS[0],
    []
  );

  // Muddatli to'lov kalkulyatori hisobi
  const calculatorResult = useMemo(() => {
    const target =
      INITIAL_PRODUCTS.find((p) => p.id === calcProductId) ||
      INITIAL_PRODUCTS[0];
    const markupMap = { 6: 0.06, 12: 0.14, 18: 0.21, 24: 0.28 };
    const downPayment = Math.round((target.price * calcDownPaymentPct) / 100);
    const financedBase = Math.max(0, target.price - downPayment);
    const rate = markupMap[calcMonths] || 0.14;
    const totalFinanced = Math.round(financedBase * (1 + rate));
    const monthly = Math.ceil(totalFinanced / calcMonths / 1000) * 1000;

    return {
      product: target,
      downPayment,
      monthly,
      totalPayable: downPayment + monthly * calcMonths,
    };
  }, [calcProductId, calcDownPaymentPct, calcMonths]);

  // Promokod qo'llash
  const handleApplyPromo = useCallback(
    (e) => {
      e.preventDefault();
      const normalized = promoInput.trim().toUpperCase();
      if (!normalized) {
        setPromoError('Promokodni kiriting');
        return;
      }
      const found = PROMO_CODES[normalized];
      if (!found) {
        setPromoError("Noto'g'ri promokod. Sinab ko'ring: NTEXNIK10");
        return;
      }
      setAppliedPromo(found);
      setPromoError('');
      pushToast(
        `Promokod faollashtirildi: ${found.code}`,
        found.description,
        'success'
      );
    },
    [promoInput, pushToast]
  );

  // Buyurtmani tasdiqlash
  const handlePlaceOrder = useCallback(
    (e) => {
      e.preventDefault();
      const errors = {};
      if (!customerForm.fullName.trim() || customerForm.fullName.trim().length < 3) {
        errors.fullName = "Ism va familiyangizni to'liq kiriting";
      }
      const digitsOnly = customerForm.phone.replace(/\D/g, '');
      if (digitsOnly.length < 9) {
        errors.phone = "Telefon raqamini to'g'ri kiriting";
      }
      if (
        deliveryMethod === 'courier' &&
        (!customerForm.address.trim() || customerForm.address.trim().length < 6)
      ) {
        errors.address = "Yetkazib berish manzilini ko'rsating";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const newOrder = {
        id: `NTX-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toLocaleString('uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        city: currentCity.name,
        deliveryMethod,
        paymentMethod,
        customer: { ...customerForm },
        items: [...cart],
        total: cartSummary.grandTotal,
        status: 'Tasdiqlangan — Tayyorlanmoqda',
      };

      setOrders((prev) => [newOrder, ...prev]);
      setLastPlacedOrder(newOrder);
      setCart([]);
      setAppliedPromo(null);
      setPromoInput('');
      setFormErrors({});
      setCheckoutStep('success');
      pushToast(
        `Buyurtma qabul qilindi: #${newOrder.id}`,
        'Operatorimiz 10 daqiqa ichida bog‘lanadi',
        'success'
      );
    },
    [
      customerForm,
      deliveryMethod,
      paymentMethod,
      currentCity.name,
      cart,
      cartSummary.grandTotal,
      pushToast,
    ]
  );

  const scrollToCatalog = useCallback((categoryId = null) => {
    if (categoryId) {
      setActiveCategory(categoryId);
      setOnlyFavoritesTab(false);
    }
    catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const currentHero = HERO_SLIDES[heroIndex];

  /* ========================================================================
     4. RENDER (JSX TUZILMASI)
     ======================================================================== */

  return (
    <div className="ntx-app">
      {/* YUQORI MA'LUMOT VA SHAHAR TANLASH PANELI */}
      <div className="ntx-topbar">
        <div className="ntx-container ntx-topbar__inner">
          <div className="ntx-topbar__left">
            <label className="ntx-city-picker" htmlFor="ntx-city-select">
              <span className="ntx-city-picker__pin" aria-hidden="true">
                📍
              </span>
              <span>Shahar:</span>
              <select
                id="ntx-city-select"
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
              >
                {UZ_CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
            <span className="ntx-topbar__eta">
              Yetkazish: <strong>{currentCity.deliveryEta}</strong>
            </span>
          </div>

          <div className="ntx-topbar__right">
            <button
              type="button"
              className="ntx-topbar__link"
              onClick={() =>
                calculatorSectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              0% Muddatli to‘lov
            </button>
            <span className="ntx-topbar__sep" aria-hidden="true">
              •
            </span>
            <button
              type="button"
              className="ntx-topbar__link"
              onClick={() => setIsOrdersOpen(true)}
            >
              Buyurtmalarim ({orders.length})
            </button>
            <span className="ntx-topbar__sep" aria-hidden="true">
              •
            </span>
            <a href="tel:+998712009900" className="ntx-topbar__phone">
              +998 (71) 200-99-00
            </a>
          </div>
        </div>
      </div>

      {/* ASOSIY STICKY HEADER */}
      <header className="ntx-header">
        <div className="ntx-container ntx-header__inner">
          {/* Brend Logotipi */}
          <a
            href="#top"
            className="ntx-logo"
            onClick={(e) => {
              e.preventDefault();
              handleResetFilters();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="ntx-logo__mark" aria-hidden="true">
              N
            </span>
            <div className="ntx-logo__text">
              <span className="ntx-logo__name">Ntexnik</span>
              <span className="ntx-logo__tag">Maishiy texnika markazi</span>
            </div>
          </a>

          {/* Katalog tezkor tugmasi */}
          <button
            type="button"
            className="ntx-catalog-btn"
            onClick={() => scrollToCatalog('all')}
          >
            <span className="ntx-catalog-btn__bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>Katalog</span>
          </button>

          {/* Jonli Qidiruv Paneli */}
          <div className="ntx-search" ref={searchWrapRef}>
            <div className="ntx-search__field">
              <span className="ntx-search__icon" aria-hidden="true">
                🔍
              </span>
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Muzlatkich, kir yuvish mashinasi, Samsung, Dyson..."
                aria-label="Texnika qidirish"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ntx-search__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Qidiruvni tozalash"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                className="ntx-search__submit"
                onClick={() => {
                  setIsSearchFocused(false);
                  scrollToCatalog();
                }}
              >
                Qidirish
              </button>
            </div>

            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="ntx-search__dropdown">
                {searchSuggestions.length === 0 ? (
                  <div className="ntx-search__empty">
                    “{searchQuery}” bo‘yicha mos texnika topilmadi
                  </div>
                ) : (
                  <>
                    <div className="ntx-search__drop-head">
                      Topilgan modellar ({searchSuggestions.length})
                    </div>
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="ntx-search__drop-item"
                        onClick={() => {
                          setIsSearchFocused(false);
                          setQuickViewProduct(item);
                        }}
                      >
                        <img src={item.images[0]} alt={item.title} />
                        <div className="ntx-search__drop-info">
                          <strong>{item.title}</strong>
                          <span>
                            {item.brand} • {item.categoryLabel}
                          </span>
                        </div>
                        <span className="ntx-search__drop-price">
                          {formatUZSPrice(item.price)}
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Foydalanuvchi harakat tugmalari: Taqqoslash, Sevimlilar, Savatcha */}
          <div className="ntx-header__actions">
            <button
              type="button"
              className="ntx-header-action"
              onClick={() => setIsCompareOpen(true)}
              aria-label="Taqqoslash"
            >
              <span className="ntx-header-action__icon">⚖️</span>
              <span className="ntx-header-action__label">Taqqoslash</span>
              {compareIds.length > 0 && (
                <span className="ntx-header-action__badge">
                  {compareIds.length}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`ntx-header-action ntx-header-action--fav ${
                favorites.length > 0 ? 'has-items' : ''
              }`}
              onClick={() => setIsFavoritesOpen(true)}
              aria-label="Sevimlilar"
            >
              <span className="ntx-header-action__icon">❤️</span>
              <span className="ntx-header-action__label">Sevimlilar</span>
              <span className="ntx-header-action__badge ntx-header-action__badge--rose">
                {favorites.length}
              </span>
            </button>

            <button
              type="button"
              className="ntx-header-action ntx-header-action--cart"
              onClick={() => {
                setCheckoutStep('cart');
                setIsCartOpen(true);
              }}
              aria-label="Savatcha"
            >
              <span className="ntx-header-action__icon">🛒</span>
              <div className="ntx-header-action__cart-meta">
                <span className="ntx-header-action__label">Savatcha</span>
                <strong className="ntx-header-action__sum">
                  {cartSummary.totalCount > 0
                    ? formatUZSPrice(cartSummary.subtotal)
                    : "Bo'sh"}
                </strong>
              </div>
              <span className="ntx-header-action__badge ntx-header-action__badge--primary">
                {cartSummary.totalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Kategoriyalar tezkor navigatsiya tasmasi */}
        <nav className="ntx-cat-nav" aria-label="Asosiy kategoriyalar">
          <div className="ntx-container ntx-cat-nav__inner">
            {CATEGORIES.map((cat) => {
              const isActive =
                !onlyFavoritesTab && activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`ntx-cat-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    setOnlyFavoritesTab(false);
                    setActiveCategory(cat.id);
                  }}
                >
                  <span>{cat.label}</span>
                  <span className="ntx-cat-pill__tag">{cat.badge}</span>
                </button>
              );
            })}

            <button
              type="button"
              className={`ntx-cat-pill ntx-cat-pill--fav ${
                onlyFavoritesTab ? 'is-active' : ''
              }`}
              onClick={() => setOnlyFavoritesTab((prev) => !prev)}
            >
              <span>❤️ Sevimlilarim</span>
              <span className="ntx-cat-pill__tag">{favorites.length}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ASOSIY KONTENT */}
      <main id="top" className="ntx-main">
        {/* HERO SHOWCASE + KUN MAHSULOTI */}
        <section className="ntx-hero-section">
          <div className="ntx-container ntx-hero-grid">
            {/* Chap: Interaktiv Hero Banner Slayder */}
            <div
              className="ntx-hero-banner"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
            >
              <div className="ntx-hero-banner__content" key={currentHero.id}>
                <div className="ntx-hero-banner__badges">
                  <span className="ntx-hero-banner__eyebrow">
                    {currentHero.eyebrow}
                  </span>
                  <span className="ntx-hero-banner__promo">
                    {currentHero.accentTag}
                  </span>
                </div>

                <h1 className="ntx-hero-banner__title">{currentHero.title}</h1>
                <p className="ntx-hero-banner__subtitle">
                  {currentHero.subtitle}
                </p>

                <div className="ntx-hero-banner__actions">
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--primary ntx-btn--lg"
                    onClick={() => scrollToCatalog(currentHero.targetCategory)}
                  >
                    {currentHero.ctaPrimary} →
                  </button>
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--glass ntx-btn--lg"
                    onClick={() =>
                      calculatorSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                      })
                    }
                  >
                    {currentHero.ctaSecondary}
                  </button>
                </div>

                <div className="ntx-hero-banner__stats">
                  <div className="ntx-hero-stat">
                    <strong>100% Original</strong>
                    <span>Rasmiy distribyutor</span>
                  </div>
                  <div className="ntx-hero-stat">
                    <strong>{currentHero.highlightMetric}</strong>
                    <span>Servis markazi himoyasi</span>
                  </div>
                  <div className="ntx-hero-stat">
                    <strong>0% Boshlang‘ich</strong>
                    <span>6 / 12 / 24 oyga bo‘lib to‘lash</span>
                  </div>
                </div>
              </div>

              <div className="ntx-hero-banner__visual">
                <img
                  src={currentHero.image}
                  alt={currentHero.title}
                  className="ntx-hero-banner__img"
                />
                <div className="ntx-hero-banner__controls">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      className={`ntx-hero-dot ${
                        idx === heroIndex ? 'is-active' : ''
                      }`}
                      onClick={() => setHeroIndex(idx)}
                      aria-label={`${idx + 1}-slayd`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* O'ng: Kun Mahsuloti (Flash Deal + Live Countdown) */}
            <aside className="ntx-flash-deal" aria-label="Kun mahsuloti">
              <div className="ntx-flash-deal__head">
                <span className="ntx-flash-deal__badge">⚡ KUN MAHSULOTI</span>
                <div className="ntx-countdown" title="Aksiya tugash vaqti">
                  <span>{String(countdown.hours).padStart(2, '0')}</span>:
                  <span>{String(countdown.minutes).padStart(2, '0')}</span>:
                  <span>{String(countdown.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              <div
                className="ntx-flash-deal__media"
                onClick={() => setQuickViewProduct(dealOfTheDayProduct)}
              >
                <img
                  src={dealOfTheDayProduct.images[0]}
                  alt={dealOfTheDayProduct.title}
                />
                <span className="ntx-flash-deal__save">
                  Tejash:{' '}
                  {formatUZSPrice(
                    dealOfTheDayProduct.oldPrice - dealOfTheDayProduct.price
                  )}
                </span>
              </div>

              <div className="ntx-flash-deal__body">
                <span className="ntx-flash-deal__brand">
                  {dealOfTheDayProduct.brand} • {dealOfTheDayProduct.categoryLabel}
                </span>
                <h2 className="ntx-flash-deal__title">
                  {dealOfTheDayProduct.title}
                </h2>

                <div className="ntx-flash-deal__prices">
                  <strong>{formatUZSPrice(dealOfTheDayProduct.price)}</strong>
                  <span>{formatUZSPrice(dealOfTheDayProduct.oldPrice)}</span>
                </div>

                <div className="ntx-flash-deal__progress">
                  <div className="ntx-flash-deal__progress-meta">
                    <span>Sotildi: 82%</span>
                    <span>Qoldi: {dealOfTheDayProduct.stock} dona</span>
                  </div>
                  <div className="ntx-flash-deal__bar">
                    <div style={{ width: '82%' }} />
                  </div>
                </div>

                <div className="ntx-flash-deal__actions">
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--primary"
                    onClick={() =>
                      handleAddToCart({
                        ...dealOfTheDayProduct,
                        image: dealOfTheDayProduct.images[0],
                      })
                    }
                  >
                    🛒 Hoziroq olish
                  </button>
                  <button
                    type="button"
                    className={`ntx-btn ntx-btn--outline-icon ${
                      favorites.includes(dealOfTheDayProduct.id)
                        ? 'is-fav'
                        : ''
                    }`}
                    onClick={() =>
                      handleToggleFavorite(dealOfTheDayProduct.id)
                    }
                    aria-label="Sevimlilarga qo'shish"
                  >
                    {favorites.includes(dealOfTheDayProduct.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* XIZMAT KAFOLATLARI TASMASI */}
        <section className="ntx-trust-strip" aria-label="Ntexnik afzalliklari">
          <div className="ntx-container ntx-trust-strip__grid">
            <div className="ntx-trust-card">
              <span className="ntx-trust-card__icon">🚚</span>
              <div>
                <strong>Tezkor va ehtiyotkor yetkazish</strong>
                <p>
                  {formatUZSPrice(currentCity.freeThreshold)} dan yuqori
                  xaridlarda bepul
                </p>
              </div>
            </div>
            <div className="ntx-trust-card">
              <span className="ntx-trust-card__icon">🛡️</span>
              <div>
                <strong>3 yilgacha rasmiy servis kafolati</strong>
                <p>Barcha texnikalar sertifikatlangan va muhrlangan</p>
              </div>
            </div>
            <div className="ntx-trust-card">
              <span className="ntx-trust-card__icon">💳</span>
              <div>
                <strong>Qulay muddatli to‘lov 24 oygacha</strong>
                <p>Pasport va karta orqali 5 daqiqada rasmiylashtirish</p>
              </div>
            </div>
            <div className="ntx-trust-card">
              <span className="ntx-trust-card__icon">🔧</span>
              <div>
                <strong>Professional o‘rnatish xizmati</strong>
                <p>Kir yuvish mashinasi va konditsionerlarni ulab berish</p>
              </div>
            </div>
          </div>
        </section>

        {/* BRENDLAR BO'YICHA TEZKOR FILTR */}
        <section className="ntx-brands-section" aria-label="Mashhur brendlar">
          <div className="ntx-container">
            <div className="ntx-section-head">
              <div>
                <h2 className="ntx-section-title">Rasmiy hamkor brendlar</h2>
                <p className="ntx-section-sub">
                  Brendni tanlab mos keluvchi barcha modellarni saralang
                </p>
              </div>
              {selectedBrands.length > 0 && (
                <button
                  type="button"
                  className="ntx-link-btn"
                  onClick={() => setSelectedBrands([])}
                >
                  Brend filtrini tozalash ({selectedBrands.length})
                </button>
              )}
            </div>

            <div className="ntx-brands-row">
              {BRANDS.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                const count = INITIAL_PRODUCTS.filter(
                  (p) => p.brand === brand
                ).length;
                return (
                  <button
                    key={brand}
                    type="button"
                    className={`ntx-brand-tile ${
                      isSelected ? 'is-selected' : ''
                    }`}
                    onClick={() => {
                      handleToggleBrand(brand);
                      scrollToCatalog();
                    }}
                  >
                    <span className="ntx-brand-tile__name">{brand}</span>
                    <span className="ntx-brand-tile__count">{count} model</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ASOSIY KATALOG VA FILTRLAR BO'LIMI */}
        <section
          ref={catalogSectionRef}
          className="ntx-catalog-section"
          aria-label="Mahsulotlar katalogi"
        >
          <div className="ntx-container">
            <div className="ntx-catalog-header">
              <div>
                <h2 className="ntx-section-title">
                  {onlyFavoritesTab
                    ? 'Sevimli texnikalaringiz'
                    : CATEGORIES.find((c) => c.id === activeCategory)?.label ||
                      'Barcha maishiy texnikalar'}
                </h2>
                <p className="ntx-section-sub">
                  Topildi: <strong>{filteredProducts.length}</strong> ta model •{' '}
                  {currentCity.name} bo‘yicha mavjudlik
                </p>
              </div>

              <div className="ntx-catalog-controls">
                <button
                  type="button"
                  className="ntx-btn ntx-btn--secondary ntx-mobile-filter-btn"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  ⚙️ Filtrlar{' '}
                  {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
                </button>

                <label className="ntx-sort-box" htmlFor="ntx-sort-select">
                  <span>Saralash:</span>
                  <select
                    id="ntx-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popular">Ommabop modellar</option>
                    <option value="price-asc">Avval arzonroq</option>
                    <option value="price-desc">Avval qimmatroq</option>
                    <option value="rating">Yuqori reyting</option>
                    <option value="discount">Katta chegirmalar</option>
                    <option value="newest">Yangi kelganlar</option>
                  </select>
                </label>

                <div
                  className="ntx-view-switch"
                  role="group"
                  aria-label="Ko'rinish rejimi"
                >
                  <button
                    type="button"
                    className={viewMode === 'grid' ? 'is-active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Katak (Grid) ko'rinish"
                    aria-label="Katak ko'rinish"
                  >
                    ⊞
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'list' ? 'is-active' : ''}
                    onClick={() => setViewMode('list')}
                    title="Ro'yxat (List) ko'rinish"
                    aria-label="Ro'yxat ko'rinish"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            <div className="ntx-catalog-layout">
              {/* CHAP SIDEBAR FILTRLAR PANELI */}
              <aside
                className={`ntx-sidebar ${
                  isMobileFilterOpen ? 'is-mobile-open' : ''
                }`}
              >
                <div className="ntx-sidebar__mobile-head">
                  <strong>Aqlli filtrlash</strong>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Narx oralig'i */}
                <div className="ntx-filter-group">
                  <div className="ntx-filter-group__head">
                    <h3>Maksimal narx</h3>
                    <span className="ntx-filter-price-val">
                      {formatUZSPrice(maxPriceFilter)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3000000"
                    max="25000000"
                    step="500000"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="ntx-range-input"
                  />
                  <div className="ntx-range-labels">
                    <span>3 mln</span>
                    <span>14 mln</span>
                    <span>25 mln</span>
                  </div>
                </div>

                {/* Texnologik parametrlar */}
                <div className="ntx-filter-group">
                  <h3>Texnologiyalar va Holat</h3>
                  <label className="ntx-check-row">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                    />
                    <span>Faqat omborda mavjud</span>
                  </label>
                  <label className="ntx-check-row">
                    <input
                      type="checkbox"
                      checked={onlyInverter}
                      onChange={(e) => setOnlyInverter(e.target.checked)}
                    />
                    <span>⚡ Inverter motor / kompressor</span>
                  </label>
                  <label className="ntx-check-row">
                    <input
                      type="checkbox"
                      checked={onlyWifi}
                      onChange={(e) => setOnlyWifi(e.target.checked)}
                    />
                    <span>📶 Smart Wi-Fi boshqaruv</span>
                  </label>
                  <label className="ntx-check-row">
                    <input
                      type="checkbox"
                      checked={onlyDiscounts}
                      onChange={(e) => setOnlyDiscounts(e.target.checked)}
                    />
                    <span>🏷️ Chegirmadagi texnikalar</span>
                  </label>
                  <label className="ntx-check-row">
                    <input
                      type="checkbox"
                      checked={onlyFavoritesTab}
                      onChange={(e) => setOnlyFavoritesTab(e.target.checked)}
                    />
                    <span>❤️ Faqat sevimlilar ({favorites.length})</span>
                  </label>
                </div>

                {/* Energiya samaradorligi sinfi */}
                <div className="ntx-filter-group">
                  <h3>Energiya samaradorligi</h3>
                  <div className="ntx-energy-pills">
                    {['all', 'A+++', 'A++', 'A+', 'A'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        className={`ntx-energy-pill ${
                          energyFilter === cls ? 'is-active' : ''
                        }`}
                        onClick={() => setEnergyFilter(cls)}
                      >
                        {cls === 'all' ? 'Barchasi' : cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brendlar */}
                <div className="ntx-filter-group">
                  <h3>Brendlar</h3>
                  <div className="ntx-brand-checks">
                    {BRANDS.map((brand) => (
                      <label key={brand} className="ntx-check-row">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleToggleBrand(brand)}
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--secondary ntx-btn--full"
                    onClick={handleResetFilters}
                  >
                    Barcha filtrlarni tozalash ({activeFiltersCount})
                  </button>
                )}
              </aside>

              {/* O'NG MAHSULOTLAR SETKASI */}
              <div className="ntx-catalog-content">
                {filteredProducts.length === 0 ? (
                  <div className="ntx-empty-state">
                    <div className="ntx-empty-state__icon">🔎</div>
                    <h3>Tanlangan parametrlar bo‘yicha texnika topilmadi</h3>
                    <p>
                      Filtrlarni yumshatib ko‘ring yoki barcha mahsulotlar
                      ro‘yxatiga qayting.
                    </p>
                    <button
                      type="button"
                      className="ntx-btn ntx-btn--primary"
                      onClick={handleResetFilters}
                    >
                      Filtrlarni tiklash
                    </button>
                  </div>
                ) : (
                  <div
                    className={`ntx-products-grid ntx-products-grid--${viewMode}`}
                  >
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        animationDelay={index * 55}
                        isFavorite={favorites.includes(product.id)}
                        isCompared={compareIds.includes(product.id)}
                        cartQuantity={getProductCartQty(product.id)}
                        onAddToCart={handleAddToCart}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleCompare={handleToggleCompare}
                        onQuickView={setQuickViewProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* INTERAKTIV MUDDATLI TO'LOV KALKULYATORI */}
        <section
          ref={calculatorSectionRef}
          className="ntx-calc-section"
          aria-label="Muddatli to'lov kalkulyatori"
        >
          <div className="ntx-container">
            <div className="ntx-calc-card">
              <div className="ntx-calc-card__left">
                <span className="ntx-calc-badge">
                  MUDDATLI TO‘LOV KALKULYATORI
                </span>
                <h2>O‘zingizga qulay oylik to‘lov rejasini hisoblang</h2>
                <p>
                  Istalgan texnikani tanlang, boshlang‘ich to‘lov foizi va
                  muddatni belgilang — tizim aniq oylik to‘lovni avtomatik
                  hisoblab beradi.
                </p>

                <div className="ntx-calc-controls">
                  <div className="ntx-calc-field">
                    <label htmlFor="ntx-calc-product">Texnikani tanlang:</label>
                    <select
                      id="ntx-calc-product"
                      value={calcProductId}
                      onChange={(e) => setCalcProductId(Number(e.target.value))}
                    >
                      {INITIAL_PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} — {formatUZSPrice(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ntx-calc-field">
                    <span>Boshlang‘ich to‘lov:</span>
                    <div className="ntx-calc-pills">
                      {[0, 15, 30, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          className={calcDownPaymentPct === pct ? 'is-active' : ''}
                          onClick={() => setCalcDownPaymentPct(pct)}
                        >
                          {pct === 0 ? '0% (Boshlang‘ichsiz)' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ntx-calc-field">
                    <span>To‘lov muddati:</span>
                    <div className="ntx-calc-pills">
                      {[6, 12, 18, 24].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={calcMonths === m ? 'is-active' : ''}
                          onClick={() => setCalcMonths(m)}
                        >
                          {m} oy
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ntx-calc-card__right">
                <div className="ntx-calc-preview">
                  <img
                    src={calculatorResult.product.images[0]}
                    alt={calculatorResult.product.title}
                  />
                  <div>
                    <span>{calculatorResult.product.brand}</span>
                    <strong>{calculatorResult.product.title}</strong>
                  </div>
                </div>

                <div className="ntx-calc-breakdown">
                  <div className="ntx-calc-row">
                    <span>Asosiy narxi:</span>
                    <strong>
                      {formatUZSPrice(calculatorResult.product.price)}
                    </strong>
                  </div>
                  <div className="ntx-calc-row">
                    <span>Boshlang‘ich to‘lov ({calcDownPaymentPct}%):</span>
                    <strong>
                      {formatUZSPrice(calculatorResult.downPayment)}
                    </strong>
                  </div>
                  <div className="ntx-calc-row ntx-calc-row--highlight">
                    <span>Oylik to‘lov ({calcMonths} oy):</span>
                    <strong>{formatUZSPrice(calculatorResult.monthly)} / oy</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="ntx-btn ntx-btn--primary ntx-btn--full ntx-btn--lg"
                  onClick={() => {
                    handleAddToCart({
                      ...calculatorResult.product,
                      image: calculatorResult.product.images[0],
                    });
                    setPaymentMethod('installment');
                    setCheckoutStep('form');
                    setIsCartOpen(true);
                  }}
                >
                  Muddatli to‘lovga rasmiylashtirish
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="ntx-footer">
        <div className="ntx-container ntx-footer__grid">
          <div className="ntx-footer__brand">
            <div className="ntx-logo ntx-logo--light">
              <span className="ntx-logo__mark">N</span>
              <div className="ntx-logo__text">
                <span className="ntx-logo__name">Ntexnik</span>
                <span className="ntx-logo__tag">Maishiy texnika markazi</span>
              </div>
            </div>
            <p>
              Ntexnik — O‘zbekiston bo‘ylab rasmiy kafolatlangan yirik va mayda
              maishiy texnikalar internet-do‘koni. Sifat, tezkor servis va
              halol muddatli to‘lov.
            </p>
            <div className="ntx-footer__promos">
              <span>Sinov promokodlar:</span>
              <code>NTEXNIK10</code>
              <code>YANGI2026</code>
            </div>
          </div>

          <div>
            <h4>Kategoriyalar</h4>
            <ul>
              {CATEGORIES.slice(1).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => scrollToCatalog(cat.id)}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Xaridorlarga</h4>
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => setIsFavoritesOpen(true)}
                >
                  Sevimlilar ro‘yxati ({favorites.length})
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setIsCompareOpen(true)}>
                  Texnikalarni taqqoslash ({compareIds.length})
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setIsOrdersOpen(true)}>
                  Buyurtma holatini tekshirish
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    calculatorSectionRef.current?.scrollIntoView({
                      behavior: 'smooth',
                    })
                  }
                >
                  Muddatli to‘lov shartlari
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4>Aloqa markazi</h4>
            <p className="ntx-footer__phone">+998 (71) 200-99-00</p>
            <p>Har kuni 09:00 dan 22:00 gacha dam olish kunlarisiz</p>
            <p>Manzil: Toshkent sh., Amir Temur shoh ko‘chasi, 108-uy</p>
          </div>
        </div>

        <div className="ntx-container ntx-footer__bottom">
          <span>© {new Date().getFullYear()} Ntexnik. Barcha huquqlar himoyalangan.</span>
          <span>To‘lov tizimlari: Uzcard • Humo • Visa • Payme • Click</span>
        </div>
      </footer>

      {/* ====================================================================
          5. DRAWER VA MODAL OYNALAR (Sevimlilar, Savatcha, Taqqoslash, QuickView)
         ==================================================================== */}

      {/* A. SEVIMLILAR (WISHLIST) DRAWER */}
      {isFavoritesOpen && (
        <div
          className="ntx-overlay"
          onClick={() => setIsFavoritesOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Sevimlilar ro'yxati"
        >
          <div
            className="ntx-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ntx-drawer__head">
              <div>
                <h3>❤️ Sevimlilar ({favoriteProducts.length})</h3>
                <span>Saqlangan texnikalaringiz</span>
              </div>
              <button
                type="button"
                className="ntx-close-btn"
                onClick={() => setIsFavoritesOpen(false)}
                aria-label="Yopish"
              >
                ✕
              </button>
            </div>

            <div className="ntx-drawer__body">
              {favoriteProducts.length === 0 ? (
                <div className="ntx-drawer-empty">
                  <span>🤍</span>
                  <h4>Sevimlilar ro‘yxati hozircha bo‘sh</h4>
                  <p>
                    Yoqqan texnikalardagi yurakcha belgisini bosing va ularni
                    shu yerda saqlab qo‘ying.
                  </p>
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--primary"
                    onClick={() => setIsFavoritesOpen(false)}
                  >
                    Katalogga o‘tish
                  </button>
                </div>
              ) : (
                <div className="ntx-fav-list">
                  {favoriteProducts.map((item) => (
                    <div key={item.id} className="ntx-fav-item">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        onClick={() => {
                          setIsFavoritesOpen(false);
                          setQuickViewProduct(item);
                        }}
                      />
                      <div className="ntx-fav-item__info">
                        <span className="ntx-fav-item__brand">
                          {item.brand}
                        </span>
                        <h4
                          onClick={() => {
                            setIsFavoritesOpen(false);
                            setQuickViewProduct(item);
                          }}
                        >
                          {item.title}
                        </h4>
                        <div className="ntx-fav-item__price">
                          <strong>{formatUZSPrice(item.price)}</strong>
                          {item.oldPrice > item.price && (
                            <span>{formatUZSPrice(item.oldPrice)}</span>
                          )}
                        </div>
                        <div className="ntx-fav-item__actions">
                          <button
                            type="button"
                            className="ntx-btn ntx-btn--primary ntx-btn--sm"
                            onClick={() =>
                              handleAddToCart({
                                ...item,
                                image: item.images[0],
                              })
                            }
                          >
                            🛒 Savatga
                          </button>
                          <button
                            type="button"
                            className="ntx-btn ntx-btn--ghost ntx-btn--sm"
                            onClick={() => handleToggleFavorite(item.id)}
                          >
                            O‘chirish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {favoriteProducts.length > 0 && (
              <div className="ntx-drawer__foot">
                <div className="ntx-drawer-total">
                  <span>Jami qiymati:</span>
                  <strong>
                    {formatUZSPrice(
                      favoriteProducts.reduce((s, p) => s + p.price, 0)
                    )}
                  </strong>
                </div>
                <button
                  type="button"
                  className="ntx-btn ntx-btn--primary ntx-btn--full"
                  onClick={handleMoveAllFavoritesToCart}
                >
                  Barchasini savatga qo‘shish ({favoriteProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. SAVATCHA VA BUYURTMA (CART & CHECKOUT) DRAWER */}
      {isCartOpen && (
        <div
          className="ntx-overlay"
          onClick={() => setIsCartOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Savatcha"
        >
          <div
            className="ntx-drawer ntx-drawer--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ntx-drawer__head">
              <div>
                <h3>
                  🛒{' '}
                  {checkoutStep === 'cart'
                    ? `Savatcha (${cartSummary.totalCount})`
                    : checkoutStep === 'form'
                    ? 'Buyurtmani rasmiylashtirish'
                    : 'Buyurtma tasdiqlandi'}
                </h3>
                <span>{currentCity.name} • {currentCity.deliveryEta}</span>
              </div>
              <button
                type="button"
                className="ntx-close-btn"
                onClick={() => setIsCartOpen(false)}
                aria-label="Yopish"
              >
                ✕
              </button>
            </div>

            <div className="ntx-drawer__body">
              {checkoutStep === 'success' && lastPlacedOrder ? (
                <div className="ntx-order-success">
                  <div className="ntx-order-success__icon">✅</div>
                  <h4>Buyurtmangiz muvaffaqiyatli qabul qilindi!</h4>
                  <p>
                    Buyurtma raqami: <strong>#{lastPlacedOrder.id}</strong>
                  </p>
                  <div className="ntx-order-success__box">
                    <div>
                      <span>Qabul qiluvchi:</span>
                      <strong>{lastPlacedOrder.customer.fullName}</strong>
                    </div>
                    <div>
                      <span>Telefon:</span>
                      <strong>{lastPlacedOrder.customer.phone}</strong>
                    </div>
                    <div>
                      <span>Shahar:</span>
                      <strong>{lastPlacedOrder.city}</strong>
                    </div>
                    <div>
                      <span>Jami to‘lov:</span>
                      <strong>{formatUZSPrice(lastPlacedOrder.total)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--primary ntx-btn--full"
                    onClick={() => {
                      setCheckoutStep('cart');
                      setIsCartOpen(false);
                    }}
                  >
                    Xaridni davom ettirish
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="ntx-drawer-empty">
                  <span>🛒</span>
                  <h4>Savatchangiz bo‘sh</h4>
                  <p>
                    Katalogdan o‘zingizga kerakli maishiy texnikalarni tanlab
                    savatga qo‘shing.
                  </p>
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--primary"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Texnika tanlash
                  </button>
                </div>
              ) : checkoutStep === 'cart' ? (
                <>
                  {/* Bepul yetkazish progress indikatori */}
                  <div className="ntx-free-ship-bar">
                    {cartSummary.subtotal >= currentCity.freeThreshold ? (
                      <span>
                        🎉 Tabriklaymiz! <strong>{currentCity.name}</strong>{' '}
                        bo‘ylab yetkazib berish <strong>BEPUL</strong>!
                      </span>
                    ) : (
                      <span>
                        Bepul yetkazish uchun yana{' '}
                        <strong>
                          {formatUZSPrice(
                            currentCity.freeThreshold - cartSummary.subtotal
                          )}
                        </strong>{' '}
                        lik xarid qiling
                      </span>
                    )}
                  </div>

                  <div className="ntx-cart-list">
                    {cart.map((item) => (
                      <div key={item.key} className="ntx-cart-item">
                        <img src={item.image} alt={item.title} />
                        <div className="ntx-cart-item__info">
                          <span className="ntx-cart-item__brand">
                            {item.brand}{' '}
                            {item.variantName ? `• ${item.variantName}` : ''}
                          </span>
                          <h4>{item.title}</h4>
                          <div className="ntx-cart-item__bottom">
                            <div className="ntx-qty-mini">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateCartQuantity(
                                    item.id,
                                    item.quantity - 1,
                                    item.sku
                                  )
                                }
                              >
                                −
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateCartQuantity(
                                    item.id,
                                    item.quantity + 1,
                                    item.sku
                                  )
                                }
                                disabled={item.quantity >= item.stock}
                              >
                                +
                              </button>
                            </div>

                            <strong>
                              {formatUZSPrice(item.price * item.quantity)}
                            </strong>

                            <button
                              type="button"
                              className="ntx-cart-item__del"
                              onClick={() => handleRemoveCartItem(item.key)}
                              title="O'chirish"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promokod formasi */}
                  <form className="ntx-promo-box" onSubmit={handleApplyPromo}>
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promokod (masalan: NTEXNIK10)"
                    />
                    <button type="submit" className="ntx-btn ntx-btn--secondary">
                      Qo‘llash
                    </button>
                  </form>
                  {promoError && (
                    <p className="ntx-form-error">{promoError}</p>
                  )}
                  {appliedPromo && (
                    <div className="ntx-promo-applied">
                      <span>
                        ✅ {appliedPromo.code} (-{appliedPromo.discountPercent}
                        %)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                      >
                        Bekor qilish
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* BUYURTMA RASMIYLASHTIRISH FORMASI */
                <form
                  id="ntx-checkout-form"
                  className="ntx-checkout-form"
                  onSubmit={handlePlaceOrder}
                >
                  <div className="ntx-form-group">
                    <label>Yetkazib berish usuli</label>
                    <div className="ntx-radio-grid">
                      <button
                        type="button"
                        className={
                          deliveryMethod === 'courier' ? 'is-active' : ''
                        }
                        onClick={() => setDeliveryMethod('courier')}
                      >
                        <strong>🚚 Kuryer orqali</strong>
                        <span>{currentCity.deliveryEta}</span>
                      </button>
                      <button
                        type="button"
                        className={
                          deliveryMethod === 'pickup' ? 'is-active' : ''
                        }
                        onClick={() => setDeliveryMethod('pickup')}
                      >
                        <strong>🏬 Do‘kondan olish</strong>
                        <span>Bepul (Bugun tayyor)</span>
                      </button>
                    </div>
                  </div>

                  <div className="ntx-form-group">
                    <label htmlFor="ntx-cust-name">Ism va familiyangiz *</label>
                    <input
                      id="ntx-cust-name"
                      type="text"
                      value={customerForm.fullName}
                      onChange={(e) =>
                        setCustomerForm((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      placeholder="Masalan: Sardor Karimov"
                    />
                    {formErrors.fullName && (
                      <span className="ntx-form-error">
                        {formErrors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="ntx-form-group">
                    <label htmlFor="ntx-cust-phone">Telefon raqamingiz *</label>
                    <input
                      id="ntx-cust-phone"
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="+998 90 123 45 67"
                    />
                    {formErrors.phone && (
                      <span className="ntx-form-error">{formErrors.phone}</span>
                    )}
                  </div>

                  {deliveryMethod === 'courier' && (
                    <div className="ntx-form-group">
                      <label htmlFor="ntx-cust-addr">
                        Yetkazib berish manzili *
                      </label>
                      <input
                        id="ntx-cust-addr"
                        type="text"
                        value={customerForm.address}
                        onChange={(e) =>
                          setCustomerForm((p) => ({
                            ...p,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Tuman, ko'cha, uy va xonadon raqami"
                      />
                      {formErrors.address && (
                        <span className="ntx-form-error">
                          {formErrors.address}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="ntx-form-group">
                    <label>To‘lov turi</label>
                    <div className="ntx-radio-grid">
                      <button
                        type="button"
                        className={
                          paymentMethod === 'card_on_delivery'
                            ? 'is-active'
                            : ''
                        }
                        onClick={() => setPaymentMethod('card_on_delivery')}
                      >
                        <strong>💳 Qabul qilishda</strong>
                        <span>Naqd yoki terminal</span>
                      </button>
                      <button
                        type="button"
                        className={
                          paymentMethod === 'installment' ? 'is-active' : ''
                        }
                        onClick={() => setPaymentMethod('installment')}
                      >
                        <strong>📅 Muddatli to‘lov</strong>
                        <span>6 / 12 / 24 oyga</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {cart.length > 0 && checkoutStep !== 'success' && (
              <div className="ntx-drawer__foot">
                <div className="ntx-summary-lines">
                  <div>
                    <span>Mahsulotlar ({cartSummary.totalCount} dona):</span>
                    <span>{formatUZSPrice(cartSummary.subtotal)}</span>
                  </div>
                  {cartSummary.productSavings > 0 && (
                    <div className="is-saving">
                      <span>Aksiya tejovi:</span>
                      <span>-{formatUZSPrice(cartSummary.productSavings)}</span>
                    </div>
                  )}
                  {cartSummary.promoDiscount > 0 && (
                    <div className="is-saving">
                      <span>Promokod chegirmasi:</span>
                      <span>-{formatUZSPrice(cartSummary.promoDiscount)}</span>
                    </div>
                  )}
                  <div>
                    <span>Yetkazib berish:</span>
                    <span>
                      {cartSummary.shippingFee === 0
                        ? 'Bepul'
                        : formatUZSPrice(cartSummary.shippingFee)}
                    </span>
                  </div>
                  <div className="is-total">
                    <span>Jami to‘lov:</span>
                    <strong>{formatUZSPrice(cartSummary.grandTotal)}</strong>
                  </div>
                </div>

                {checkoutStep === 'cart' ? (
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--primary ntx-btn--full ntx-btn--lg"
                    onClick={() => setCheckoutStep('form')}
                  >
                    Buyurtmani rasmiylashtirish →
                  </button>
                ) : (
                  <div className="ntx-checkout-foot-btns">
                    <button
                      type="button"
                      className="ntx-btn ntx-btn--secondary"
                      onClick={() => setCheckoutStep('cart')}
                    >
                      ← Orqaga
                    </button>
                    <button
                      type="submit"
                      form="ntx-checkout-form"
                      className="ntx-btn ntx-btn--primary"
                    >
                      Buyurtmani tasdiqlash
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* C. TEZKOR KO'RISH (QUICK VIEW) MODAL */}
      {quickViewProduct && (
        <div
          className="ntx-overlay ntx-overlay--center"
          onClick={() => setQuickViewProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-label={quickViewProduct.title}
        >
          <div
            className="ntx-modal ntx-qv-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ntx-close-btn ntx-modal__close"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Yopish"
            >
              ✕
            </button>

            <div className="ntx-qv-grid">
              <div className="ntx-qv-media">
                <img
                  src={quickViewProduct.images[0]}
                  alt={quickViewProduct.title}
                />
                <div className="ntx-qv-badges">
                  <span>{quickViewProduct.warranty}</span>
                  <span>Energiya: {quickViewProduct.energyClass}</span>
                </div>
              </div>

              <div className="ntx-qv-details">
                <span className="ntx-qv-brand">
                  {quickViewProduct.brand} • Artikul: {quickViewProduct.sku}
                </span>
                <h3>{quickViewProduct.title}</h3>

                <div className="ntx-qv-rating">
                  ⭐ {quickViewProduct.rating} ({quickViewProduct.reviewsCount}{' '}
                  ta xaridor sharhi)
                </div>

                <p className="ntx-qv-desc">
                  {quickViewProduct.shortDescription}
                </p>

                <div className="ntx-qv-price-box">
                  <div>
                    {quickViewProduct.oldPrice > quickViewProduct.price && (
                      <span className="ntx-qv-old">
                        {formatUZSPrice(quickViewProduct.oldPrice)}
                      </span>
                    )}
                    <strong className="ntx-qv-price">
                      {formatUZSPrice(
                        quickViewProduct.resolvedPrice || quickViewProduct.price
                      )}
                    </strong>
                  </div>
                  <span className="ntx-qv-installment">
                    12 oyga:{' '}
                    <strong>
                      {formatUZSPrice(
                        Math.ceil(
                          ((quickViewProduct.resolvedPrice ||
                            quickViewProduct.price) *
                            1.14) /
                            12 /
                            1000
                        ) * 1000
                      )}{' '}
                      / oy
                    </strong>
                  </span>
                </div>

                <div className="ntx-qv-specs">
                  <h4>Asosiy texnik ko‘rsatkichlar</h4>
                  <table>
                    <tbody>
                      {quickViewProduct.specs?.map((spec, idx) => (
                        <tr key={idx}>
                          <td>{spec.label}</td>
                          <td>
                            <strong>{spec.value}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="ntx-qv-actions">
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--primary ntx-btn--lg"
                    onClick={() => {
                      handleAddToCart({
                        ...quickViewProduct,
                        price:
                          quickViewProduct.resolvedPrice ||
                          quickViewProduct.price,
                        image: quickViewProduct.images[0],
                      });
                      setQuickViewProduct(null);
                    }}
                  >
                    🛒 Savatga qo‘shish
                  </button>
                  <button
                    type="button"
                    className="ntx-btn ntx-btn--secondary"
                    onClick={() => handleToggleFavorite(quickViewProduct.id)}
                  >
                    {favorites.includes(quickViewProduct.id)
                      ? '❤️ Sevimlilarda'
                      : '🤍 Sevimlilarga'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* D. TAQQOSLASH (COMPARE) MODAL */}
      {isCompareOpen && (
        <div
          className="ntx-overlay ntx-overlay--center"
          onClick={() => setIsCompareOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mahsulotlarni taqqoslash"
        >
          <div
            className="ntx-modal ntx-compare-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ntx-modal__head">
              <div>
                <h3>⚖️ Texnikalarni taqqoslash ({comparedProducts.length}/4)</h3>
                <label className="ntx-check-row">
                  <input
                    type="checkbox"
                    checked={compareOnlyDiff}
                    onChange={(e) => setCompareOnlyDiff(e.target.checked)}
                  />
                  <span>Faqat farqlanuvchi jihatlarni ko‘rsatish</span>
                </label>
              </div>
              <button
                type="button"
                className="ntx-close-btn"
                onClick={() => setIsCompareOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="ntx-modal__body">
              {comparedProducts.length === 0 ? (
                <div className="ntx-drawer-empty">
                  <span>⚖️</span>
                  <h4>Taqqoslash ro‘yxati bo‘sh</h4>
                  <p>
                    Kartochkalardagi taqqoslash tugmasini bosib 4 tagacha
                    texnikani solishtiring.
                  </p>
                </div>
              ) : (
                <div className="ntx-compare-table-wrap">
                  <table className="ntx-compare-table">
                    <thead>
                      <tr>
                        <th>Parametr</th>
                        {comparedProducts.map((p) => (
                          <th key={p.id}>
                            <div className="ntx-compare-col-head">
                              <img src={p.images[0]} alt={p.title} />
                              <strong>{p.title}</strong>
                              <span className="ntx-compare-price">
                                {formatUZSPrice(p.price)}
                              </span>
                              <div className="ntx-compare-col-btns">
                                <button
                                  type="button"
                                  className="ntx-btn ntx-btn--primary ntx-btn--sm"
                                  onClick={() =>
                                    handleAddToCart({
                                      ...p,
                                      image: p.images[0],
                                    })
                                  }
                                >
                                  Savatga
                                </button>
                                <button
                                  type="button"
                                  className="ntx-btn ntx-btn--ghost ntx-btn--sm"
                                  onClick={() => handleToggleCompare(p.id)}
                                >
                                  O‘chirish
                                </button>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          label: 'Brend',
                          getValue: (p) => p.brand,
                        },
                        {
                          label: 'Kategoriya',
                          getValue: (p) => p.categoryLabel,
                        },
                        {
                          label: 'Energiya sinfi',
                          getValue: (p) => p.energyClass,
                        },
                        {
                          label: 'Inverter texnologiyasi',
                          getValue: (p) => (p.isInverter ? 'Ha (Mavjud)' : 'Yo‘q'),
                        },
                        {
                          label: 'Smart Wi-Fi',
                          getValue: (p) => (p.isSmartWifi ? 'Ha (Ilova orqali)' : 'Yo‘q'),
                        },
                        {
                          label: 'Kafolat muddati',
                          getValue: (p) => p.warranty,
                        },
                        {
                          label: 'Xaridorlar reytingi',
                          getValue: (p) => `${p.rating} / 5 (${p.reviewsCount} sharh)`,
                        },
                      ]
                        .filter((row) => {
                          if (!compareOnlyDiff || comparedProducts.length < 2)
                            return true;
                          const vals = comparedProducts.map(row.getValue);
                          return new Set(vals).size > 1;
                        })
                        .map((row) => (
                          <tr key={row.label}>
                            <td>
                              <strong>{row.label}</strong>
                            </td>
                            {comparedProducts.map((p) => (
                              <td key={p.id}>{row.getValue(p)}</td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* E. BUYURTMALAR TARIXI MODAL */}
      {isOrdersOpen && (
        <div
          className="ntx-overlay ntx-overlay--center"
          onClick={() => setIsOrdersOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Buyurtmalar tarixi"
        >
          <div
            className="ntx-modal ntx-orders-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ntx-modal__head">
              <h3>📦 Mening buyurtmalarim ({orders.length})</h3>
              <button
                type="button"
                className="ntx-close-btn"
                onClick={() => setIsOrdersOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="ntx-modal__body">
              {orders.length === 0 ? (
                <div className="ntx-drawer-empty">
                  <span>📦</span>
                  <h4>Hali buyurtmalar mavjud emas</h4>
                  <p>
                    Rasmiylashtirilgan barcha buyurtmalaringiz va ularning
                    holati shu yerda ko‘rinadi.
                  </p>
                </div>
              ) : (
                <div className="ntx-orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="ntx-order-card">
                      <div className="ntx-order-card__head">
                        <div>
                          <strong>Buyurtma #{order.id}</strong>
                          <span>{order.createdAt}</span>
                        </div>
                        <span className="ntx-order-status">{order.status}</span>
                      </div>
                      <div className="ntx-order-card__items">
                        {order.items.map((it) => (
                          <span key={it.key}>
                            {it.title} × {it.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="ntx-order-card__foot">
                        <span>{order.city}</span>
                        <strong>{formatUZSPrice(order.total)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST BILDIRISHNOMALAR STEKI */}
      <div className="ntx-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`ntx-toast ntx-toast--${t.tone}`}>
            <strong>{t.title}</strong>
            {t.subtitle && <span>{t.subtitle}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;