import { Schema, model, Types, Document } from "mongoose";

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  variantSelection: Record<string, string>;
  quantity: number;
}

export type OtpPurpose = "verify-email" | "reset-password";

export interface IOtp {
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
}

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  otp?: IOtp | null;
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

const otpSchema = new Schema<IOtp>(
  {
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["verify-email", "reset-password"], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  emailVerified: { type: Boolean, default: false },
  otp: { type: otpSchema, default: null },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  cart: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);
