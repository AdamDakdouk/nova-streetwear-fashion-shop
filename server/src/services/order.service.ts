import { IUser } from "../models/User";
import { IOrder, IPaymentSummary, IShippingAddress, Order } from "../models/Order";
import { IProduct, Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { resolveAvailableStock } from "./cart.service";

function decrementStock(
  product: { variants: { name: string; options: { value: string; stock: number }[] }[]; baseStock: number },
  selection: Record<string, string>,
  quantity: number
): void {
  if (product.variants.length === 0) {
    product.baseStock -= quantity;
    return;
  }

  for (const axis of product.variants) {
    const option = axis.options.find((o) => o.value === selection[axis.name]);
    if (option) {
      option.stock -= quantity;
    }
  }
}

export interface CheckoutDetails {
  shippingAddress: IShippingAddress;
  payment: IPaymentSummary;
}

export async function placeOrder(user: IUser, details: CheckoutDetails): Promise<IOrder> {
  if (user.cart.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  // Re-validate every line against current stock before mutating anything,
  // so a failure never leaves partial stock decrements or an emptied cart.
  const resolvedLines: {
    productDoc: IProduct;
    quantity: number;
    variantSelection: Record<string, string>;
  }[] = [];

  for (const line of user.cart) {
    const productDoc: IProduct | null = await Product.findById(line.product);
    if (!productDoc) {
      throw new ApiError(409, "One of the items in your cart is no longer available");
    }

    const available = resolveAvailableStock(productDoc, line.variantSelection);
    if (line.quantity > available) {
      throw new ApiError(409, `"${productDoc.title}" no longer has enough stock for your order`);
    }

    resolvedLines.push({ productDoc, quantity: line.quantity, variantSelection: line.variantSelection });
  }

  const items = resolvedLines.map(({ productDoc, quantity, variantSelection }) => {
    const unitPrice = productDoc.price;
    return {
      product: productDoc._id,
      title: productDoc.title,
      variantSelection,
      unitPrice,
      quantity,
      subtotal: unitPrice * quantity,
    };
  });

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  for (const { productDoc, quantity, variantSelection } of resolvedLines) {
    decrementStock(productDoc, variantSelection, quantity);
    await productDoc.save();
  }

  const order = await Order.create({
    user: user._id,
    items,
    total,
    shippingAddress: details.shippingAddress,
    payment: details.payment,
  });

  user.cart.splice(0, user.cart.length);
  await user.save();

  return order;
}
