import type { ProductSummary } from "../types";

/**
 * Basic fuzzy/synonym search.
 * 
 * Stems words to handle plurals ("belts" -> "belt") and maps common synonyms ("hat" -> "basecap") 
 * to match exact catalog terms. Uses a small hardcoded map rather than a full fuzzy library 
 * to avoid false positives.
 */

/** Strips punctuation and casing: "T-Shirt" and "t shirt" both reduce to "tshirt". */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Crude but predictable singulariser — enough for an English clothing catalogue. */
function singularize(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  // "sunglasses" -> "sunglass", "watches" -> "watch"
  if (/(ss|sh|ch|x|z)es$/.test(word)) return word.slice(0, -2);
  // "shoes" -> "shoe"
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -1);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function stem(word: string): string {
  return singularize(normalizeWord(word));
}

// Synonym lookup table (typed search term -> catalog term).
// Keys and values are pre-stemmed, so it only needs one-way mapping from query term to catalog match.
const SYNONYMS: Record<string, string[]> = {
  // headwear
  hat: ["cap", "basecap"],
  cap: ["basecap"],
  // tops
  tee: ["tshirt"],
  shirt: ["tshirt"],
  top: ["tshirt"],
  jumper: ["hoodie"],
  sweater: ["hoodie"],
  sweatshirt: ["hoodie"],
  hoody: ["hoodie"],
  // outerwear
  coat: ["jacket"],
  // legwear. Note what is deliberately absent: "jean" is not mapped to "denim"
  // or "pant". It already matches Relaxed Jeans on its own, and widening it
  // dragged in the Denim Jacket and every other trouser — a search for jeans
  // returning a jacket is worse than one that returns only jeans.
  trouser: ["pant"],
  jogger: ["sweatpant"],
  // footwear
  shoe: ["sneaker"],
  trainer: ["sneaker"],
  kick: ["sneaker"],
  footwear: ["sneaker"],
  // accessories
  bag: ["crossbody"],
  purse: ["crossbody"],
  shade: ["sunglass"],
  glass: ["sunglass"],
  sunglass: ["sunglasses"],
  eyewear: ["sunglass"],
  // broad category words
  clothing: ["tshirt", "hoodie", "jacket", "pant", "sweatpant", "jean"],
  clothe: ["tshirt", "hoodie", "jacket", "pant", "sweatpant", "jean"],
  accessory: ["basecap", "crossbody", "belt", "sunglass"],
};

/** Everything about a product worth matching against. */
function searchableWords(product: ProductSummary): string[] {
  const variantValues = product.variants.flatMap((axis) => [
    axis.name,
    ...axis.options.map((option) => option.value),
  ]);

  return [product.title, product.category, product.slug, ...variantValues]
    .join(" ")
    .split(/[\s/]+/)
    .map(stem)
    .filter(Boolean);
}

function termMatches(term: string, words: string[], joined: string): boolean {
  // Very short terms must match a whole word — otherwise "s" matches everything.
  if (term.length <= 2) return words.includes(term);
  return joined.includes(term);
}

/**
 * True when every word in the query matches the product, directly or through a
 * synonym. Requiring *all* words keeps multi-word queries narrowing rather than
 * widening: "denim jacket" should not also return every other jacket.
 */
export function productMatchesQuery(product: ProductSummary, query: string): boolean {
  const terms = query.split(/\s+/).map(stem).filter(Boolean);
  if (terms.length === 0) return true;

  const words = searchableWords(product);
  const joined = words.join(" ");

  const everyTermMatches = terms.every((term) => {
    const candidates = [term, ...(SYNONYMS[term] ?? [])];
    return candidates.some((candidate) => termMatches(candidate, words, joined));
  });
  if (everyTermMatches) return true;

  // "t shirt" is one word split by a space. Collapsing the whole query catches
  // that without letting unrelated words run together, since this only applies
  // when the per-word pass has already failed.
  if (terms.length > 1) {
    const collapsed = stem(query.replace(/\s+/g, ""));
    const candidates = [collapsed, ...(SYNONYMS[collapsed] ?? [])];
    return candidates.some((candidate) => termMatches(candidate, words, joined));
  }

  return false;
}
