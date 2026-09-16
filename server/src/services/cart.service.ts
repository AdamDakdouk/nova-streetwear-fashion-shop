import { IUser } from "../models/User";
import { IProduct } from "../models/Product";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

export interface CartLineView {
  itemId: string;
  product: {
    _id: string;
    slug: string;
    title: string;
    thumbnail: string;
  };
  variantSelection: Record<string, string>;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  availableStock: number;
}

export interface CartView {
  items: CartLineView[];
  total: number;
}

// Computes stock for a selected variant as the minimum stock across all matching option axes.
export function resolveAvailableStock(
  product: Pick<IProduct, "variants" | "baseStock">,
  selection: Record<string, string>
): number {
  if (product.variants.length === 0) {
    return product.baseStock;
  }

  let min = Infinity;
  for (const axis of product.variants) {
    const selectedValue = selection[axis.name];
    const option = axis.options.find((o) => o.value === selectedValue);
    if (!option) {
      return 0; 
    }
    min = Math.min(min, option.stock);
  }
  return min === Infinity ? 0 : min;
}

function assertCompleteSelection(product: IProduct, selection: Record<string, string>): void {
  for (const axis of product.variants) {
    if (!selection[axis.name]) {
      throw new ApiError(400, `Please select a ${axis.name.toLowerCase()}`);
    }
    const validValues = axis.options.map((o) => o.value);
    if (!validValues.includes(selection[axis.name])) {
      throw new ApiError(400, `Invalid ${axis.name.toLowerCase()} selection`);
    }
  }
}

function sameSelection(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

/** Prefers the selected Color option's own photo (e.g. the blue t-shirt for a
 * Blue/M line) over the product's default thumbnail, when one exists. */
export function resolveLineThumbnail(
  product: Pick<IProduct, "variants" | "thumbnail">,
  selection: Record<string, string>
): string {
  const colorAxis = product.variants.find((axis) => axis.name === "Color");
  const selectedOption = colorAxis?.options.find((o) => o.value === selection.Color);
  return selectedOption?.images?.[0] ?? product.thumbnail;
}

export async function buildCartView(user: IUser): Promise<CartView> {
  const items: CartLineView[] = [];
  let total = 0;

  for (const line of user.cart) {
    const product = await Product.findById(line.product);
    if (!product) continue; 

    const unitPrice = product.price;
    const subtotal = unitPrice * line.quantity;
    const availableStock = resolveAvailableStock(product, line.variantSelection);

    items.push({
      itemId: String(line._id),
      product: {
        _id: String(product._id),
        slug: product.slug,
        title: product.title,
        thumbnail: resolveLineThumbnail(product, line.variantSelection),
      },
      variantSelection: line.variantSelection,
      quantity: line.quantity,
      unitPrice,
      subtotal,
      availableStock,
    });
    total += subtotal;
  }

  return { items, total };
}

export interface AddItemInput {
  productId: string;
  variantSelection: Record<string, string>;
  quantity: number;
}

export async function addItem(user: IUser, input: AddItemInput): Promise<void> {
  const product = await Product.findById(input.productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  assertCompleteSelection(product, input.variantSelection);

  const existingLine = user.cart.find(
    (line) =>
      String(line.product) === String(product._id) &&
      sameSelection(line.variantSelection, input.variantSelection)
  );

  const requestedTotalQuantity = (existingLine?.quantity ?? 0) + input.quantity;
  const availableStock = resolveAvailableStock(product, input.variantSelection);

  if (requestedTotalQuantity > availableStock) {
    throw new ApiError(
      400,
      availableStock === 0
        ? "This item is out of stock"
        : `Only ${availableStock} left in stock`
    );
  }

  if (existingLine) {
    existingLine.quantity = requestedTotalQuantity;
  } else {
    user.cart.push({
      product: product._id,
      variantSelection: input.variantSelection,
      quantity: input.quantity,
    } as never);
  }

  await user.save();
}

export interface UpdateItemInput {
  quantity?: number;
  variantSelection?: Record<string, string>;
}

export async function updateItem(user: IUser, itemId: string, input: UpdateItemInput): Promise<void> {
  const line = user.cart.id(itemId);
  if (!line) {
    throw new ApiError(404, "Cart item not found");
  }

  const product = await Product.findById(line.product);
  if (!product) {
    throw new ApiError(404, "Product no longer exists");
  }

  const nextSelection = input.variantSelection ?? line.variantSelection;
  const nextQuantity = input.quantity ?? line.quantity;

  if (input.variantSelection) {
    assertCompleteSelection(product, nextSelection);
  }

  const availableStock = resolveAvailableStock(product, nextSelection);
  if (nextQuantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }
  if (nextQuantity > availableStock) {
    throw new ApiError(
      400,
      availableStock === 0 ? "This item is out of stock" : `Only ${availableStock} left in stock`
    );
  }

  line.variantSelection = nextSelection;
  line.quantity = nextQuantity;
  await user.save();
}

export async function removeItem(user: IUser, itemId: string): Promise<void> {
  const line = user.cart.id(itemId);
  if (!line) {
    throw new ApiError(404, "Cart item not found");
  }
  user.cart.pull({ _id: itemId });
  await user.save();
}
