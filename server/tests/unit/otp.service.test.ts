import { buildOtp, checkOtp, msUntilNextResend, OTP_MAX_ATTEMPTS } from "../../src/services/otp.service";
import { IOtp } from "../../src/models/User";

describe("checkOtp", () => {
  it("accepts the correct code", async () => {
    const otp = await buildOtp("verify-email", "123456");
    const result = await checkOtp(otp, "verify-email", "123456");
    expect(result.ok).toBe(true);
  });

  it("rejects an incorrect code", async () => {
    const otp = await buildOtp("verify-email", "123456");
    const result = await checkOtp(otp, "verify-email", "654321");
    expect(result).toEqual({ ok: false, reason: "incorrect" });
  });

  it("rejects when there is no OTP on record", async () => {
    const result = await checkOtp(null, "verify-email", "123456");
    expect(result).toEqual({ ok: false, reason: "missing" });
  });

  it("rejects a code issued for a different purpose", async () => {
    const otp = await buildOtp("reset-password", "123456");
    const result = await checkOtp(otp, "verify-email", "123456");
    expect(result).toEqual({ ok: false, reason: "wrong-purpose" });
  });

  it("rejects an expired code even if it matches", async () => {
    const otp = await buildOtp("verify-email", "123456");
    otp.expiresAt = new Date(Date.now() - 1000);
    const result = await checkOtp(otp, "verify-email", "123456");
    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects once the attempt count has been exhausted", async () => {
    const otp = await buildOtp("verify-email", "123456");
    otp.attempts = OTP_MAX_ATTEMPTS;
    const result = await checkOtp(otp, "verify-email", "123456");
    expect(result).toEqual({ ok: false, reason: "too-many-attempts" });
  });
});

describe("msUntilNextResend", () => {
  it("returns 0 when there is no OTP on record", () => {
    expect(msUntilNextResend(null)).toBe(0);
  });

  it("returns a positive remaining time right after sending", async () => {
    const otp = await buildOtp("verify-email", "123456");
    const remaining = msUntilNextResend(otp);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(60_000);
  });

  it("returns 0 once the cooldown window has passed", async () => {
    const otp = (await buildOtp("verify-email", "123456")) as IOtp;
    otp.lastSentAt = new Date(Date.now() - 61_000);
    expect(msUntilNextResend(otp)).toBe(0);
  });
});
