import { Request, Response } from "express";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";
import { HeroInput, ProductInput } from "../validators/admin.validators";
import { uploadImageBuffer } from "../services/storage.service";
import { SiteContent, HERO_KEY } from "../models/SiteContent";
import { DEFAULT_HERO } from "../seed/hero.data";

export const listProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find().sort({ title: 1 });
  res.status(200).json(products);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ProductInput;
  const product = await Product.create(input);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ProductInput;
  const product = await Product.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json({ message: "Product deleted" });
});

export const getHero = asyncHandler(async (_req: Request, res: Response) => {
  const hero = await SiteContent.findOne({ key: HERO_KEY });
  res.status(200).json(hero ?? { key: HERO_KEY, ...DEFAULT_HERO });
});

export const updateHero = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as HeroInput;
  // Upsert rather than update: there is only ever one hero, and creating it on
  // first save keeps the endpoint working against a database that was never seeded.
  const hero = await SiteContent.findOneAndUpdate({ key: HERO_KEY }, input, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.status(200).json(hero);
});

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No image file was provided");
  }

  const url = await uploadImageBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
  res.status(201).json({ url });
});
