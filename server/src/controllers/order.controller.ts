import { Request, Response } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";
import { placeOrder } from "../services/order.service";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");

  const order = await placeOrder(user);
  res.status(201).json({ order });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json({ order });
});
