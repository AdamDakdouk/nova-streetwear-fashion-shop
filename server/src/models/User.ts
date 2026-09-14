import { Schema, model, Types, Document } from "mongoose";

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  variantSelection: Record<string, string>;
  quantity: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  wishlist: Types.ObjectId[];
  cart: Types.DocumentArray<ICartItem>;
  createdAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSelection: { type: Schema.Types.Mixed, default: {} },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  cart: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);
