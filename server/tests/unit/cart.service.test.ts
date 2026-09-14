import { resolveAvailableStock, resolveLineThumbnail } from "../../src/services/cart.service";

describe("resolveAvailableStock", () => {
  it("returns baseStock when the product has no variant axes", () => {
    const product = { variants: [], baseStock: 12 };
    expect(resolveAvailableStock(product, {})).toBe(12);
  });

  it("returns the minimum stock across matching axis options", () => {
    const product = {
      baseStock: 0,
      variants: [
        {
          name: "Color",
          options: [
            { value: "Blue", stock: 10 },
            { value: "Red", stock: 3 },
          ],
        },
        {
          name: "Size",
          options: [
            { value: "M", stock: 7 },
            { value: "L", stock: 2 },
          ],
        },
      ],
    };

    expect(resolveAvailableStock(product, { Color: "Blue", Size: "M" })).toBe(7);
    expect(resolveAvailableStock(product, { Color: "Blue", Size: "L" })).toBe(2);
    expect(resolveAvailableStock(product, { Color: "Red", Size: "M" })).toBe(3);
  });

  it("returns 0 when the selection doesn't cover every axis", () => {
    const product = {
      baseStock: 0,
      variants: [{ name: "Color", options: [{ value: "Blue", stock: 10 }] }],
    };
    expect(resolveAvailableStock(product, {})).toBe(0);
  });
});

describe("resolveLineThumbnail", () => {
  const product = {
    thumbnail: "/products/tee/default.jpg",
    variants: [
      {
        name: "Color",
        options: [
          { value: "Blue", stock: 10, images: ["/products/tee/blue.jpg", "/products/tee/blue-2.jpg"] },
          { value: "Olive Oil", stock: 5, images: ["/products/tee/olive.jpg"] },
        ],
      },
      { name: "Size", options: [{ value: "M", stock: 5 }] },
    ],
  };

  it("uses the selected color option's first image", () => {
    expect(resolveLineThumbnail(product, { Color: "Blue", Size: "M" })).toBe("/products/tee/blue.jpg");
    expect(resolveLineThumbnail(product, { Color: "Olive Oil", Size: "M" })).toBe("/products/tee/olive.jpg");
  });

  it("falls back to the product thumbnail when the color has no images", () => {
    const noImages = { thumbnail: "/products/tee/default.jpg", variants: [{ name: "Color", options: [{ value: "Blue", stock: 10 }] }] };
    expect(resolveLineThumbnail(noImages, { Color: "Blue" })).toBe("/products/tee/default.jpg");
  });

  it("falls back to the product thumbnail when there is no Color axis", () => {
    const noColor = { thumbnail: "/products/tee/default.jpg", variants: [{ name: "Size", options: [{ value: "M", stock: 5 }] }] };
    expect(resolveLineThumbnail(noColor, { Size: "M" })).toBe("/products/tee/default.jpg");
  });
});
