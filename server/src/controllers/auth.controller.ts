import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendOtpEmail } from "../services/email.service";
import {
  buildOtp,
  checkOtp,
  generateOtpCode,
  msUntilNextResend,
  OTP_RESEND_COOLDOWN_MS,
} from "../services/otp.service";
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendOtpInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../validators/auth.validators";

function sanitizeUser(user: { _id: unknown; name: string; email: string; role: string }) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

function otpErrorFor(reason: string | undefined): ApiError {
  switch (reason) {
    case "too-many-attempts":
      return new ApiError(400, "Too many incorrect attempts. Request a new code.");
    case "expired":
      return new ApiError(400, "This code has expired. Request a new code.");
    case "incorrect":
      return new ApiError(400, "Incorrect code. Please try again.");
    default:
      return new ApiError(400, "Invalid or expired code.");
  }
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const code = generateOtpCode();
  const otp = await buildOtp("verify-email", code);

  const user = await User.create({ name, email, passwordHash, emailVerified: false, otp });

  try {
    await sendOtpEmail(user.email, code, "verify-email");
  } catch (err) {
// Roll back pending account creation on email delivery failure so the user can retry registration.
    await User.deleteOne({ _id: user._id });
    throw new ApiError(500, "Could not send the verification email. Please try again.");
  }

  res.status(201).json({ email: user.email, message: "We sent a 6-digit code to your email." });
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

  if (!user.emailVerified) {
    throw new ApiError(403, "Please verify your email before signing in.", { code: "EMAIL_NOT_VERIFIED" });
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

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body as VerifyEmailInput;

  const user = await User.findOne({ email });
  const result = user ? await checkOtp(user.otp, "verify-email", code) : { ok: false as const };

  if (!result.ok) {
    if (user && result.reason === "incorrect") {
      user.otp!.attempts += 1;
      await user.save();
    }
    throw otpErrorFor(result.reason);
  }

  user!.emailVerified = true;
  user!.otp = null;
  await user!.save();

  const token = signToken(String(user!._id));
  res.status(200).json({ user: sanitizeUser(user!), token });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body as ResendOtpInput;

  const user = await User.findOne({ email });
  const genericResponse = { message: "If that account needs a code, a new one was just sent." };

  if (!user) {
    res.status(200).json(genericResponse);
    return;
  }

  if (purpose === "verify-email" && user.emailVerified) {
    res.status(200).json(genericResponse);
    return;
  }

  const waitMs = msUntilNextResend(user.otp);
  if (waitMs > 0) {
    throw new ApiError(429, "Please wait before requesting another code.", {
      retryAfterMs: waitMs,
    });
  }

  const code = generateOtpCode();
  user.otp = await buildOtp(purpose, code);
  await user.save();

  try {
    await sendOtpEmail(user.email, code, purpose);
  } catch (err) {
// Return a generic response on email send failure to prevent account enumeration.
    console.error("[resendOtp] failed to send email", err);
  }

  res.status(200).json(genericResponse);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;

  const genericResponse = {
    message: "If an account with that email exists, we've sent a password reset code.",
  };

  const user = await User.findOne({ email });
  if (!user) {
    res.status(200).json(genericResponse);
    return;
  }

  const waitMs = msUntilNextResend(user.otp);
  if (waitMs > 0 && waitMs < OTP_RESEND_COOLDOWN_MS) {
    // A code was already sent very recently — avoid spamming, but still return the
    // generic response so response shape/timing doesn't reveal account existence.
    res.status(200).json(genericResponse);
    return;
  }

  const code = generateOtpCode();
  user.otp = await buildOtp("reset-password", code);
  await user.save();

  try {
    await sendOtpEmail(user.email, code, "reset-password");
  } catch (err) {
    // Same reasoning as resendOtp: never let a send failure be distinguishable
    // from "no such account", both must look identical to the caller.
    console.error("[forgotPassword] failed to send email", err);
  }

  res.status(200).json(genericResponse);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body as ResetPasswordInput;

  const user = await User.findOne({ email });
  const result = user ? await checkOtp(user.otp, "reset-password", code) : { ok: false as const };

  if (!result.ok) {
    if (user && result.reason === "incorrect") {
      user.otp!.attempts += 1;
      await user.save();
    }
    throw otpErrorFor(result.reason);
  }

  user!.passwordHash = await bcrypt.hash(newPassword, 10);
  user!.otp = null;
  await user!.save();

  res.status(200).json({ message: "Password reset successfully. Please sign in." });
});
