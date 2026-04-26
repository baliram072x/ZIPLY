export type Category = "Grocery" | "Medicine" | "Bakery" | "Dairy" | "Snacks" | "Personal Care";

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: Category;
  emoji: string;
  popular?: boolean;
  stock: number;
};

export type Shop = {
  id: string;
  name: string;
  tagline: string;
  type: "Kirana" | "Medical" | "Bakery" | "Dairy";
  rating: number;
  distanceKm: number;
  prepMinutes: number;
  emoji: string;
  color: string; // tailwind gradient classes
  products: Product[];
};

const p = (
  id: string,
  name: string,
  price: number,
  unit: string,
  category: Category,
  emoji: string,
  popular = false,
  stock = 24,
): Product => ({ id, name, price, unit, category, emoji, popular, stock });

export const SHOPS: Shop[] = [
  {
    id: "sharma-kirana",
    name: "Sharma Kirana Store",
    tagline: "Daily essentials, since 1998",
    type: "Kirana",
    rating: 4.7,
    distanceKm: 0.4,
    prepMinutes: 3,
    emoji: "🛒",
    color: "from-pink-500 to-rose-400",
    products: [
      p("sk-1", "Aashirvaad Atta", 65, "1 kg", "Grocery", "🌾", true),
      p("sk-2", "Tata Salt", 28, "1 kg", "Grocery", "🧂"),
      p("sk-3", "Fortune Sunflower Oil", 145, "1 L", "Grocery", "🛢️", true),
      p("sk-4", "Maggi Noodles", 14, "1 pack", "Snacks", "🍜", true),
      p("sk-5", "Parle-G Biscuits", 10, "1 pack", "Snacks", "🍪"),
      p("sk-6", "Red Label Tea", 142, "250 g", "Grocery", "🍵"),
      p("sk-7", "Dettol Soap", 45, "125 g", "Personal Care", "🧼"),
      p("sk-8", "Colgate Toothpaste", 95, "150 g", "Personal Care", "🦷"),
    ],
  },
  {
    id: "wellness-pharmacy",
    name: "Wellness Pharmacy",
    tagline: "Open 24×7 · Licensed pharmacist",
    type: "Medical",
    rating: 4.9,
    distanceKm: 0.9,
    prepMinutes: 5,
    emoji: "💊",
    color: "from-emerald-500 to-teal-400",
    products: [
      p("wp-1", "Paracetamol 500mg", 25, "10 tabs", "Medicine", "💊", true),
      p("wp-2", "Vitamin C Tablets", 120, "30 tabs", "Medicine", "🍊"),
      p("wp-3", "Cough Syrup", 95, "100 ml", "Medicine", "🧴"),
      p("wp-4", "Hand Sanitizer", 60, "200 ml", "Personal Care", "🫧"),
      p("wp-5", "Band-Aid Strip", 40, "10 pcs", "Medicine", "🩹"),
      p("wp-6", "Digital Thermometer", 220, "1 unit", "Medicine", "🌡️"),
    ],
  },
  {
    id: "sunrise-dairy",
    name: "Sunrise Dairy & Fresh",
    tagline: "Farm fresh milk & paneer",
    type: "Dairy",
    rating: 4.6,
    distanceKm: 1.4,
    prepMinutes: 4,
    emoji: "🥛",
    color: "from-sky-500 to-blue-400",
    products: [
      p("sd-1", "Amul Toned Milk", 32, "500 ml", "Dairy", "🥛", true),
      p("sd-2", "Paneer Block", 95, "200 g", "Dairy", "🧀"),
      p("sd-3", "Greek Yogurt", 60, "200 g", "Dairy", "🥣"),
      p("sd-4", "Amul Butter", 58, "100 g", "Dairy", "🧈"),
      p("sd-5", "Farm Eggs", 85, "6 pcs", "Dairy", "🥚", true),
    ],
  },
  {
    id: "browns-bakery",
    name: "Brown's Hot Bakery",
    tagline: "Baked fresh every 2 hours",
    type: "Bakery",
    rating: 4.8,
    distanceKm: 0.7,
    prepMinutes: 6,
    emoji: "🥐",
    color: "from-amber-500 to-orange-400",
    products: [
      p("bb-1", "Sourdough Loaf", 140, "400 g", "Bakery", "🍞", true),
      p("bb-2", "Butter Croissant", 60, "1 pc", "Bakery", "🥐", true),
      p("bb-3", "Chocolate Muffin", 80, "1 pc", "Bakery", "🧁"),
      p("bb-4", "Garlic Bread", 95, "1 pack", "Bakery", "🥖"),
    ],
  },
];

export const CATEGORIES: { name: Category; emoji: string }[] = [
  { name: "Grocery", emoji: "🛒" },
  { name: "Medicine", emoji: "💊" },
  { name: "Dairy", emoji: "🥛" },
  { name: "Bakery", emoji: "🥐" },
  { name: "Snacks", emoji: "🍪" },
  { name: "Personal Care", emoji: "🧴" },
];

/** Smart "Best Shop" pick: weighted score on distance + prep time + rating */
export function bestShop(shops: Shop[] = SHOPS): Shop {
  const score = (s: Shop) =>
    s.distanceKm * 6 + s.prepMinutes * 1.2 - s.rating * 2;
  return [...shops].sort((a, b) => score(a) - score(b))[0];
}

export function etaMinutes(shop: Shop): number {
  // 1 km ≈ 2.5 min on a scooter + prep
  return Math.round(shop.prepMinutes + shop.distanceKm * 2.5);
}

export const ALL_PRODUCTS = SHOPS.flatMap((s) =>
  s.products.map((pr) => ({ ...pr, shopId: s.id, shopName: s.name })),
);