import crypto from "crypto";
import bcrypt from "bcryptjs";
import { IOtp, OtpPurpose } from "../models/User";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString(); // 6 digits, "000000"-"999999"
}

export async function buildOtp(purpose: OtpPurpose, code: string): Promise<IOtp> {
  return {
    codeHash: await bcrypt.hash(code, 10),
    purpose,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lastSentAt: new Date(),
  } as IOtp;
}

export function msUntilNextResend(otp: IOtp | null | undefined): number {
  if (!otp) return 0;
  const elapsed = Date.now() - new Date(otp.lastSentAt).getTime();
  return Math.max(0, OTP_RESEND_COOLDOWN_MS - elapsed);
}

export interface OtpCheckResult {
  ok: boolean;
  reason?: "missing" | "wrong-purpose" | "expired" | "too-many-attempts" | "incorrect";
}

/** Verifies a submitted code against the stored OTP. Does NOT mutate/clear it — callers
 * decide whether to consume (clear) on success or record the failed attempt on failure. */
export async function checkOtp(
  otp: IOtp | null | undefined,
  purpose: OtpPurpose,
  submittedCode: string
): Promise<OtpCheckResult> {
  if (!otp) return { ok: false, reason: "missing" };
  if (otp.purpose !== purpose) return { ok: false, reason: "wrong-purpose" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "too-many-attempts" };
  if (new Date(otp.expiresAt).getTime() < Date.now()) return { ok: false, reason: "expired" };

  const matches = await bcrypt.compare(submittedCode, otp.codeHash);
  return matches ? { ok: true } : { ok: false, reason: "incorrect" };
}
