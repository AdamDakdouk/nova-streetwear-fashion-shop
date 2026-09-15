/**
 * Re-encodes the product photography in place.
 *
 * The source shots came out of the box at near-lossless quality — around 600KB
 * each for an 896x1200 image — which meant the storefront shipped roughly 9MB
 * of images on a first visit. At quality 80 the same picture is about 30KB with
 * no visible difference at the sizes this UI renders them.
 *
 * Both trees are processed with identical settings: `media/` is the source the
 * seed copies from, and `client/public/products/` is what actually gets served.
 * Compressing only the served copy would work until the next `npm run seed`
 * quietly restored the heavy originals.
 *
 * Dimensions are left alone unless a file is wider than MAX_WIDTH — these are
 * already sized sensibly, the problem was encoding quality, not resolution.
 *
 * Note: this is lossy and rewrites files in place, so running it repeatedly
 * re-encodes already-encoded images. Run it once after adding new photography,
 * not as part of the build.
 *
 *   node scripts/optimize-images.mjs [--dry]
 */
import { readdir, stat, rename, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TARGETS = ["media", "client/public/products"];
const JPEG_QUALITY = 80;
const MAX_WIDTH = 1600;
const DRY_RUN = process.argv.includes("--dry");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return null;

  const before = (await stat(file)).size;
  const image = sharp(file);
  const { width } = await image.metadata();

  let pipeline = sharp(file).rotate();
  if (width && width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  pipeline =
    ext === ".png"
      ? // Kept lossless: this file is referenced by name in the seed data and in
        // already-stored product documents, so it cannot become a .jpg without
        // breaking those references.
        pipeline.png({ compressionLevel: 9, effort: 10 })
      : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

  const buffer = await pipeline.toBuffer();

  // Never make a file bigger — re-encoding can lose to an already-tight original.
  if (buffer.length >= before) return { file, before, after: before, skipped: true };

  if (!DRY_RUN) {
    // Write beside the original then swap, so an interrupted run cannot leave a
    // half-written image where a working one used to be.
    const tmp = `${file}.tmp`;
    await sharp(buffer).toFile(tmp);
    await unlink(file);
    await rename(tmp, file);
  }

  return { file, before, after: buffer.length, skipped: false };
}

let totalBefore = 0;
let totalAfter = 0;
let count = 0;
let skipped = 0;

for (const target of TARGETS) {
  for await (const file of walk(target)) {
    const result = await optimize(file);
    if (!result) continue;

    totalBefore += result.before;
    totalAfter += result.after;
    if (result.skipped) {
      skipped += 1;
      continue;
    }
    count += 1;
    const saved = Math.round(100 - (result.after / result.before) * 100);
    console.log(
      `${result.file}\n  ${formatKb(result.before)} -> ${formatKb(result.after)} (${saved}% smaller)`
    );
  }
}

console.log(
  `\n${DRY_RUN ? "[dry run] " : ""}${count} image(s) re-encoded, ${skipped} left as-is` +
    `\ntotal ${formatKb(totalBefore)} -> ${formatKb(totalAfter)} ` +
    `(${Math.round(100 - (totalAfter / totalBefore) * 100)}% smaller)`
);
