import { Request, Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";
import * as cartService from "../services/cart.service";
import { AddToCartInput, UpdateCartInput } from "../validators/cart.validators";

async function loadUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const user = await loadUser(req.userId!);
  res.status(200).json(await cartService.buildCartView(user));
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const user = await loadUser(req.userId!);
  const input = req.body as AddToCartInput;
  await cartService.addItem(user, input);
  res.status(200).json(await cartService.buildCartView(user));
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const user = await loadUser(req.userId!);
  const input = req.body as UpdateCartInput;
  await cartService.updateItem(user, req.params.itemId, input);
  res.status(200).json(await cartService.buildCartView(user));
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const user = await loadUser(req.userId!);
  await cartService.removeItem(user, req.params.itemId);
  res.status(200).json(await cartService.buildCartView(user));
});
