import { Schema, model, Document } from "mongoose";

export interface IVariantOption {
  value: string;
  stock: number;
  images?: string[];
}

export interface IVariantAxis {
  name: string;
  options: IVariantOption[];
}

export interface IProduct extends Document {
  slug: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  thumbnail: string;
  variants: IVariantAxis[];
  baseStock: number;
  category: string;
}

const variantOptionSchema = new Schema<IVariantOption>(
  {
    value: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    images: { type: [String], required: false },
  },
  { _id: false }
);

const variantAxisSchema = new Schema<IVariantAxis>(
  { name: { type: String, required: true }, options: { type: [variantOptionSchema], required: true } },
  { _id: false }
);

const productSchema = new Schema<IProduct>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  thumbnail: { type: String, required: true },
  variants: { type: [variantAxisSchema], default: [] },
  baseStock: { type: Number, default: 0 },
  category: { type: String, required: true },
});

export const Product = model<IProduct>("Product", productSchema);
