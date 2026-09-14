import { Schema, model, Types, Document } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  variantSelection: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  total: number;
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

const orderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  placedAt: { type: Date, default: Date.now },
});

export const Order = model<IOrder>("Order", orderSchema);
