import crypto from "crypto";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env";

// R2 speaks the S3 API — same client, pointed at Cloudflare's endpoint instead
// of AWS. "auto" is Cloudflare's documented region value for R2 (there's no
// real AWS region behind it, but the SDK requires the field to be set).
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
  },
});

export async function uploadImageBuffer(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  const key = `products/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return `${env.r2.publicUrl}/${key}`;
}
