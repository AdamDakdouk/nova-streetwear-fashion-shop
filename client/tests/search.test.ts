import { describe, expect, it } from "vitest";
import { productMatchesQuery } from "../src/lib/search";
import type { ProductSummary } from "../src/types";

function product(
  title: string,
  category: string,
  slug: string,
  variants: ProductSummary["variants"] = []
): ProductSummary {
  return {
    _id: slug,
    slug,
    title,
    price: 1000,
    thumbnail: "",
    category,
    variants,
    avgRating: 0,
    reviewCount: 0,
  };
}

/** The real catalogue, variants included, so these tests fail if it drifts. */
const SIZES_SML = [{ name: "Size", options: [{ value: "S", stock: 1 }, { value: "M", stock: 1 }, { value: "L", stock: 1 }] }];
const SIZES_SMLXL = [{ name: "Size", options: [{ value: "S", stock: 1 }, { value: "M", stock: 1 }, { value: "L", stock: 1 }, { value: "XL", stock: 1 }] }];
const WAISTS = [{ name: "Size", options: [{ value: "30", stock: 1 }, { value: "32", stock: 1 }, { value: "34", stock: 1 }, { value: "36", stock: 1 }] }];
const SHOE_SIZES = [{ name: "Size", options: [{ value: "40", stock: 1 }, { value: "41", stock: 1 }, { value: "42", stock: 1 }] }];
const color = (...values: string[]) => ({ name: "Color", options: values.map((value) => ({ value, stock: 1 })) });

const CATALOGUE: ProductSummary[] = [
  product("Essential T-Shirt", "T-Shirts", "essential-t-shirt", [color("Blue", "Olive Oil"), ...SIZES_SMLXL]),
  product("Oversized T-Shirt", "T-Shirts", "oversized-t-shirt", [color("Black", "Gray"), ...SIZES_SMLXL]),
  product("Classic Hoodie", "Hoodies", "classic-hoodie", SIZES_SMLXL),
  product("Zip Hoodie", "Hoodies", "zip-hoodie", SIZES_SMLXL),
  product("Denim Jacket", "Jackets", "denim-jacket", [color("Blue", "Washed Black"), ...SIZES_SML]),
  product("Bomber Jacket", "Jackets", "bomber-jacket", [color("Beige", "Olive"), ...SIZES_SML]),
  product("Cargo Pants", "Pants", "cargo-pants", WAISTS),
  product("Relaxed Jeans", "Pants", "relaxed-jeans", WAISTS),
  product("Sweatpants", "Pants", "sweatpants", SIZES_SMLXL),
  product("Classic Sneakers", "Footwear", "classic-sneakers", SHOE_SIZES),
  product("Rapid Move Sneakers", "Footwear", "rapid-move-sneakers", SHOE_SIZES),
  product("Basecap", "Accessories", "basecap", [color("Beige", "Black", "White")]),
  product("Crossbody Bag", "Accessories", "crossbody-bag", [color("Gray", "Reddish")]),
  product("Leather Belt", "Accessories", "leather-belt", WAISTS),
  product("Sunglasses", "Accessories", "sunglasses"),
];

function search(query: string): string[] {
  return CATALOGUE.filter((p) => productMatchesQuery(p, query)).map((p) => p.title);
}

describe("product search", () => {
  it("finds the basecap when a shopper calls it a hat", () => {
    expect(search("hat")).toEqual(["Basecap"]);
    expect(search("cap")).toEqual(["Basecap"]);
  });

  it("matches plurals against singular product names", () => {
    // The reported case: "belts" returned nothing while a Leather Belt existed.
    expect(search("belts")).toEqual(["Leather Belt"]);
    expect(search("belt")).toEqual(["Leather Belt"]);
  });

  it("matches singular queries against plural product names", () => {
    expect(search("sneaker")).toEqual(["Classic Sneakers", "Rapid Move Sneakers"]);
    expect(search("jean")).toEqual(["Relaxed Jeans"]);
  });

  it("understands everyday words for the same garment", () => {
    expect(search("shoes")).toEqual(["Classic Sneakers", "Rapid Move Sneakers"]);
    expect(search("trainers")).toEqual(["Classic Sneakers", "Rapid Move Sneakers"]);
    expect(search("sweater")).toEqual(["Classic Hoodie", "Zip Hoodie"]);
    expect(search("jumper")).toEqual(["Classic Hoodie", "Zip Hoodie"]);
    expect(search("trousers")).toEqual(["Cargo Pants", "Relaxed Jeans", "Sweatpants"]);
    expect(search("shades")).toEqual(["Sunglasses"]);
    expect(search("purse")).toEqual(["Crossbody Bag"]);
    expect(search("coat")).toEqual(["Denim Jacket", "Bomber Jacket"]);
  });

  it("handles punctuation and spacing in the same word", () => {
    expect(search("t-shirt")).toEqual(["Essential T-Shirt", "Oversized T-Shirt"]);
    expect(search("t shirt")).toEqual(["Essential T-Shirt", "Oversized T-Shirt"]);
    expect(search("tshirt")).toEqual(["Essential T-Shirt", "Oversized T-Shirt"]);
    expect(search("tee")).toEqual(["Essential T-Shirt", "Oversized T-Shirt"]);
  });

  it("is case insensitive", () => {
    expect(search("HOODIE")).toEqual(["Classic Hoodie", "Zip Hoodie"]);
    expect(search("Basecap")).toEqual(["Basecap"]);
  });

  it("narrows rather than widens as words are added", () => {
    expect(search("jacket")).toEqual(["Denim Jacket", "Bomber Jacket"]);
    expect(search("denim jacket")).toEqual(["Denim Jacket"]);
  });

  it("searches variant values too", () => {
    // Olive appears on the tee ("Olive Oil") and the Bomber Jacket ("Olive").
    expect(search("olive")).toEqual(["Essential T-Shirt", "Bomber Jacket"]);
    expect(search("gray")).toEqual(["Oversized T-Shirt", "Crossbody Bag"]);
    expect(search("beige")).toEqual(["Bomber Jacket", "Basecap"]);
  });

  it("returns nothing for something the catalogue doesn't sell", () => {
    expect(search("umbrella")).toEqual([]);
    expect(search("laptop")).toEqual([]);
  });

  it("does not let a stray short word match everything", () => {
    // "s" is a real size value, so it matches garments sold in S — but it must
    // behave as a whole word, not a substring wildcard that matches all 15.
    const sizeS = search("s");
    expect(sizeS).toContain("Classic Hoodie");
    expect(sizeS).not.toContain("Sunglasses");
    expect(sizeS.length).toBeLessThan(CATALOGUE.length);

    expect(search("s hoodie")).toEqual(["Classic Hoodie", "Zip Hoodie"]);
  });

  it("treats an empty query as no filter", () => {
    expect(search("")).toHaveLength(CATALOGUE.length);
  });
});
