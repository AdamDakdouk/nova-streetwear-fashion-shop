import multer from "multer";
import { ApiError } from "../utils/ApiError";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// Buffers upload in RAM via multer before pushing to Cloudflare R2 object storage, 
// avoiding local disk writes on ephemeral serverless filesystems.
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
