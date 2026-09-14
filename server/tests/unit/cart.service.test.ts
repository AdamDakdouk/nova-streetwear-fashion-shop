import { resolveAvailableStock } from "../../src/services/cart.service";

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
