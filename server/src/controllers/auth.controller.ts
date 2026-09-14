import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../middleware/asyncHandler";
import { LoginInput, RegisterInput } from "../validators/auth.validators";

function sanitizeUser(user: { _id: unknown; name: string; email: string }) {
  return { id: String(user._id), name: user.name, email: user.email };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(String(user._id));
  res.status(201).json({ user: sanitizeUser(user), token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(String(user._id));
  res.status(200).json({ user: sanitizeUser(user), token });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json({ user: sanitizeUser(user) });
});
