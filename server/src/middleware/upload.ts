import multer from "multer";
import { ApiError } from "../utils/ApiError";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Memory storage: the file lands in req.file.buffer, never touches local disk.
// A production deploy's filesystem is often ephemeral (or absent entirely on
// serverless), so the only durable place for this to live is object storage
// (Cloudflare R2 — see services/storage.service.ts) — buffering in RAM is the
// bridge between multer's parsing and that upload, not a place to persist it.
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, "Only JPEG, PNG, or WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("image");
