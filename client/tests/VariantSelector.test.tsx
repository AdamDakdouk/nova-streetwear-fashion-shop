import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VariantSelector } from "../src/components/product/VariantSelector";

const axes = [
  {
    name: "Color",
    options: [
      { value: "Blue", stock: 5 },
      { value: "Red", stock: 0 },
    ],
  },
];

describe("VariantSelector", () => {
  it("calls onChange with the merged selection when an option is clicked", async () => {
    const onChange = vi.fn();
    render(<VariantSelector axes={axes} selection={{}} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Blue" }));

    expect(onChange).toHaveBeenCalledWith({ Color: "Blue" });
  });

  it("disables an out-of-stock option and does not fire onChange when clicked", async () => {
    const onChange = vi.fn();
    render(<VariantSelector axes={axes} selection={{}} onChange={onChange} />);

    const redButton = screen.getByRole("button", { name: "Red" });
    expect(redButton).toBeDisabled();

    await userEvent.click(redButton);
    expect(onChange).not.toHaveBeenCalled();
  });
});
