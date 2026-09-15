import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  resendApiKey: required("RESEND_API_KEY"),
  emailFrom: process.env.EMAIL_FROM ?? "NOVA <onboarding@resend.dev>",
  r2: {
    accountId: required("R2_ACCOUNT_ID"),
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    bucketName: required("R2_BUCKET_NAME"),
    // Trim a trailing slash so callers can always do `${publicUrl}/${key}` without
    // worrying whether it was pasted in with or without one.
    publicUrl: required("R2_PUBLIC_URL").replace(/\/$/, ""),
  },
};
