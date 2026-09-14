export interface SeedVariantOption {
  value: string;
  stock: number;
  images?: string[]; // filenames, relative to /media — only set on Color options
}

export interface SeedVariantAxis {
  name: string;
  options: SeedVariantOption[];
}

export interface SeedProduct {
  slug: string;
  title: string;
  price: number; // cents
  description: string;
  category: string;
  variants: SeedVariantAxis[];
  baseStock: number; // used only when variants is empty
  images: string[]; // filenames, relative to /media — default gallery (first color, or only look)
  thumbnail: string; // filename, relative to /media
}

const SIZES_APPAREL: SeedVariantOption[] = [
  { value: "S", stock: 14 },
  { value: "M", stock: 22 },
  { value: "L", stock: 18 },
  { value: "XL", stock: 9 },
];

const SIZES_WAIST: SeedVariantOption[] = [
  { value: "30", stock: 10 },
  { value: "32", stock: 16 },
  { value: "34", stock: 14 },
  { value: "36", stock: 7 },
];

const SIZES_SHOE: SeedVariantOption[] = [
  { value: "40", stock: 8 },
  { value: "41", stock: 12 },
  { value: "42", stock: 15 },
  { value: "43", stock: 11 },
  { value: "44", stock: 6 },
];

export const products: SeedProduct[] = [
  {
    slug: "essential-t-shirt",
    title: "Essential T-Shirt",
    price: 2900,
    description:
      "A wardrobe staple cut from heavyweight 100% combed cotton for a clean drape that holds its shape wash after wash. Reinforced collar, dropped shoulder seam, and a boxy silhouette built for everyday layering.",
    category: "T-Shirts",
    variants: [
      {
        name: "Color",
        options: [
          { value: "Blue", stock: 26, images: ["essential-t-shirt-blue.jpg", "essential-t-shirt-blue-on-model.jpg"] },
          {
            value: "Olive Oil",
            stock: 19,
            images: ["essential-t-shirt-olive-oil.jpg", "essential-t-shirt-olive-oil-on-model.jpg"],
          },
        ],
      },
      { name: "Size", options: SIZES_APPAREL },
    ],
    baseStock: 0,
    images: ["essential-t-shirt-blue.jpg", "essential-t-shirt-blue-on-model.jpg"],
    thumbnail: "essential-t-shirt-blue.jpg",
  },
  {
    slug: "oversized-t-shirt",
    title: "Oversized T-Shirt",
    price: 3400,
    description:
      "Relaxed, drop-shoulder fit in soft-washed cotton jersey. Designed with extra room through the body and sleeve for an off-duty, streetwear-first look without sacrificing structure.",
    category: "T-Shirts",
    variants: [
      {
        name: "Color",
        options: [
          {
            value: "Black",
            stock: 21,
            images: ["oversized-t-shirt-black.jpg", "oversized-t-shirt-black-on-model.jpg"],
          },
          { value: "Gray", stock: 17, images: ["oversized-t-shirt-gray.jpg", "oversized-t-shirt-gray-on-model.jpg"] },
        ],
      },
      { name: "Size", options: SIZES_APPAREL },
    ],
    baseStock: 0,
    images: ["oversized-t-shirt-black.jpg", "oversized-t-shirt-black-on-model.jpg"],
    thumbnail: "oversized-t-shirt-black.jpg",
  },
  {
    slug: "classic-hoodie",
    title: "Classic Hoodie",
    price: 6900,
    description:
      "Midweight fleece hoodie with a fixed drawstring hood, kangaroo pocket, and ribbed cuffs/hem. Brushed interior for warmth without the bulk — built to be the one hoodie you reach for on repeat.",
    category: "Hoodies",
    variants: [{ name: "Size", options: SIZES_APPAREL }],
    baseStock: 0,
    images: [
      "classic-hoodie.jpg",
      "classic-hoodie-on-model-front.jpg",
      "classic-hoodie-on-model-back.jpg",
    ],
    thumbnail: "classic-hoodie.jpg",
  },
  {
    slug: "zip-hoodie",
    title: "Zip Hoodie",
    price: 7400,
    description:
      "Full-zip fleece hoodie in a soft pink colorway with a two-way YKK-style zipper, adjustable hood, and split front pockets. A layering piece that transitions easily from studio to street.",
    category: "Hoodies",
    variants: [{ name: "Size", options: SIZES_APPAREL }],
    baseStock: 0,
    images: ["zip-hoodie-pink.jpg", "zip-hoodie-pink-on-model.jpg"],
    thumbnail: "zip-hoodie-pink.jpg",
  },
  {
    slug: "denim-jacket",
    title: "Denim Jacket",
    price: 14900,
    description:
      "Mid-weight rigid denim trucker jacket with a classic point collar, dual chest flap pockets, and adjustable button cuffs. Breaks in beautifully with wear for a fit that's uniquely yours.",
    category: "Jackets",
    variants: [
      {
        name: "Color",
        options: [
          { value: "Blue", stock: 15, images: ["denim-jacket-blue.jpg", "denim-jacket-blue-on-model.jpg"] },
          {
            value: "Washed Black",
            stock: 11,
            images: ["denim-jacket-washed-black.jpg", "denim-jacket-washed-black-on-model.jpg"],
          },
        ],
      },
      { name: "Size", options: SIZES_APPAREL.slice(0, 3) },
    ],
    baseStock: 0,
    images: ["denim-jacket-blue.jpg", "denim-jacket-blue-on-model.jpg"],
    thumbnail: "denim-jacket-blue.jpg",
  },
  {
    slug: "bomber-jacket",
    title: "Bomber Jacket",
    price: 15900,
    description:
      "Classic bomber silhouette in a durable brushed twill, finished with ribbed collar, cuffs, and hem plus a two-way front zip. Roomy enough to layer, structured enough to stand on its own.",
    category: "Jackets",
    variants: [
      {
        name: "Color",
        options: [
          { value: "Beige", stock: 13, images: ["bomber-jacket-beige.jpg", "bomber-jacket-beige-on-model.jpg"] },
          { value: "Olive", stock: 10, images: ["bomber-jacket-olive.jpg", "bomber-jacket-olive-on-model.jpg"] },
        ],
      },
      { name: "Size", options: SIZES_APPAREL.slice(0, 3) },
    ],
    baseStock: 0,
    images: ["bomber-jacket-beige.jpg", "bomber-jacket-beige-on-model.jpg"],
    thumbnail: "bomber-jacket-beige.jpg",
  },
  {
    slug: "cargo-pants",
    title: "Cargo Pants",
    price: 7900,
    description:
      "Utility-inspired cargo pants in a durable cotton twill with six functional pockets, a tapered leg, and an adjustable waistband for a fit that stays put through a full day of movement.",
    category: "Pants",
    variants: [{ name: "Size", options: SIZES_WAIST }],
    baseStock: 0,
    images: ["cargo-pants-front.jpg", "cargo-pants-back.jpg", "cargo-pants-on-model.jpg"],
    thumbnail: "cargo-pants-front.jpg",
  },
  {
    slug: "relaxed-jeans",
    title: "Relaxed Jeans",
    price: 8900,
    description:
      "A relaxed-through-the-thigh straight leg jean in rigid mid-wash denim. Sits at the natural waist with a classic five-pocket layout built to soften and mold with every wear.",
    category: "Pants",
    variants: [{ name: "Size", options: SIZES_WAIST }],
    baseStock: 0,
    images: [
      "relaxed-jeans.jpg",
      "relaxed-jeans-on-model-front.jpg",
      "relaxed-jeans-on-model-back.jpg",
    ],
    thumbnail: "relaxed-jeans.jpg",
  },
  {
    slug: "sweatpants",
    title: "Sweatpants",
    price: 6400,
    description:
      "Heavyweight fleece sweatpants with a tapered leg, elasticated drawcord waist, and ribbed ankle cuffs. Built from the same fleece as our hoodies for a matching set that never feels try-hard.",
    category: "Pants",
    variants: [{ name: "Size", options: SIZES_APPAREL }],
    baseStock: 0,
    images: ["sweatpants.jpg", "sweatpants-on-model.jpg"],
    thumbnail: "sweatpants.jpg",
  },
  {
    slug: "classic-sneakers",
    title: "Classic Sneakers",
    price: 11900,
    description:
      "Low-top court sneaker with a leather upper, cushioned midsole, and a durable rubber outsole. A clean, minimal silhouette that pairs with practically anything in the lineup.",
    category: "Footwear",
    variants: [{ name: "Size", options: SIZES_SHOE }],
    baseStock: 0,
    images: ["sneakers-pose-1.jpg", "sneakers-pose-2.jpg"],
    thumbnail: "sneakers-pose-1.jpg",
  },
  {
    slug: "rapid-move-sneakers",
    title: "Rapid Move Sneakers",
    price: 13900,
    description:
      "Performance-inspired trainer with a responsive foam midsole and breathable knit upper. Engineered for all-day comfort whether you're on your feet at work or out for a run.",
    category: "Footwear",
    variants: [{ name: "Size", options: SIZES_SHOE }],
    baseStock: 0,
    images: ["addidas-rapid-move-pose-1.jpg", "addidas-rapid-move-pose-2.jpg", "addidas-rapid-move-pose-3.jpg"],
    thumbnail: "addidas-rapid-move-pose-1.jpg",
  },
  {
    slug: "basecap",
    title: "Basecap",
    price: 2900,
    description:
      "Structured six-panel cap with a curved brim and an adjustable strap-back closure for a reliable, all-day fit. Embroidered eyelets keep things breathable on warmer days.",
    category: "Accessories",
    variants: [
      {
        name: "Color",
        options: [
          { value: "Beige", stock: 24, images: ["basecap-beige.jpg"] },
          { value: "Black", stock: 30, images: ["basecap-blac.jpg"] },
          { value: "White", stock: 18, images: ["basecap-white.jpg"] },
        ],
      },
    ],
    baseStock: 0,
    images: ["basecap-blac.jpg"],
    thumbnail: "basecap-blac.jpg",
  },
  {
    slug: "crossbody-bag",
    title: "Crossbody Bag",
    price: 5900,
    description:
      "Compact crossbody bag in coated water-resistant canvas with an adjustable webbing strap, main zip compartment, and a slip pocket for cards and keys. Small enough to forget you're wearing it.",
    category: "Accessories",
    variants: [
      {
        name: "Color",
        options: [
          { value: "Gray", stock: 16, images: ["crossbody-bag-gray.jpg"] },
          { value: "Reddish", stock: 9, images: ["crossbody-bag-reddish.jpg"] },
        ],
      },
    ],
    baseStock: 0,
    images: ["crossbody-bag-gray.jpg"],
    thumbnail: "crossbody-bag-gray.jpg",
  },
  {
    slug: "leather-belt",
    title: "Leather Belt",
    price: 3900,
    description:
      "Full-grain leather belt with a solid brushed-nickel buckle. Cut slightly wider for a workwear-inspired look that holds its shape over years of daily wear.",
    category: "Accessories",
    variants: [{ name: "Size", options: SIZES_WAIST }],
    baseStock: 0,
    images: ["leather-belt.jpg", "leather-belt-on-model.png"],
    thumbnail: "leather-belt.jpg",
  },
  {
    slug: "sunglasses",
    title: "Sunglasses",
    price: 4900,
    description:
      "Acetate frame sunglasses with polarized UV400 lenses. A single considered shape designed to sit well on most face widths, finished with spring-loaded hinges for a comfortable fit.",
    category: "Accessories",
    variants: [],
    baseStock: 27,
    images: ["sunglasses.jpg", "sunglasses-on-model.jpg"],
    thumbnail: "sunglasses.jpg",
  },
];
