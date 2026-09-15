import { Schema, model, Types, Document } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  variantSelection: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * What's kept about the payment. Deliberately only the brand and last four
 * digits — the same thing a real storefront keeps once its payment processor
 * has handled the card. The full number, expiry and CVV are never sent to this
 * server, so they can't be stored or logged here even by accident.
 */
export interface IPaymentSummary {
  brand: string;
  last4: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  shippingAddress: IShippingAddress;
  payment: IPaymentSummary;
  placedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    variantSelection: { type: Schema.Types.Mixed, default: {} },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const paymentSummarySchema = new Schema<IPaymentSummary>(
  {
    brand: { type: String, required: true },
    last4: { type: String, required: true, match: /^[0-9]{4}$/ },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  shippingAddress: { type: shippingAddressSchema, required: true },
  payment: { type: paymentSummarySchema, required: true },
  placedAt: { type: Date, default: Date.now },
});

export const Order = model<IOrder>("Order", orderSchema);
