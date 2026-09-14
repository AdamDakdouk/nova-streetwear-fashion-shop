import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { ApiError } from "../utils/ApiError";

// Uploads land in the frontend's own public/ folder — the same place the seed
// script copies catalog photos to — so Vite (dev) or any static host (prod
// build) serves them with zero extra wiring, exactly like every other product image.
const UPLOAD_DIR = path.resolve(__dirname, "../../../client/public/uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, unique);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, "Only JPEG, PNG, or WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("image");
