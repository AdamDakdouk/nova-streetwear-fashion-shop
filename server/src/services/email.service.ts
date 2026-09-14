import { Resend } from "resend";
import { env } from "../config/env";
import { OtpPurpose } from "../models/User";

const resend = new Resend(env.resendApiKey);

const COPY: Record<OtpPurpose, { subject: string; heading: string; body: string }> = {
  "verify-email": {
    subject: "Verify your NOVA account",
    heading: "Confirm your email",
    body: "Use the code below to finish creating your NOVA account. It expires in 10 minutes.",
  },
  "reset-password": {
    subject: "Reset your NOVA password",
    heading: "Reset your password",
    body: "Use the code below to reset your NOVA password. It expires in 10 minutes. If you didn't request this, you can ignore this email.",
  },
};

export async function sendOtpEmail(to: string, code: string, purpose: OtpPurpose): Promise<void> {
  const { subject, heading, body } = COPY[purpose];

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Inter, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px; color: #18181B;">
      <p style="font-weight: 700; font-size: 18px; letter-spacing: -0.02em; margin: 0 0 24px;">NOVA</p>
      <h1 style="font-size: 18px; margin: 0 0 12px;">${heading}</h1>
      <p style="font-size: 14px; color: #52525B; line-height: 1.6; margin: 0 0 24px;">${body}</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; text-align: center; background: #F3F0E9; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #A1A1AA; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}
