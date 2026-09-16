import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { products } from "./products.data";
import { SiteContent, HERO_KEY } from "../models/SiteContent";
import { DEFAULT_HERO } from "./hero.data";
import mongoose from "mongoose";

const MEDIA_DIR = path.resolve(__dirname, "../../../media");
const PUBLIC_PRODUCTS_DIR = path.resolve(__dirname, "../../../client/public/products");

function allImageFilenames(product: (typeof products)[number]): string[] {
  const variantImages = product.variants.flatMap((axis) => axis.options.flatMap((opt) => opt.images ?? []));
  return Array.from(new Set([...product.images, ...variantImages]));
}

function copyProductImages(): void {
  fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });

  for (const product of products) {
    const destDir = path.join(PUBLIC_PRODUCTS_DIR, product.slug);
    fs.mkdirSync(destDir, { recursive: true });

    for (const filename of allImageFilenames(product)) {
      const src = path.join(MEDIA_DIR, filename);
      const dest = path.join(destDir, filename);
      if (!fs.existsSync(src)) {
        console.warn(`[seed] missing source image: ${src}`);
        continue;
      }
      fs.copyFileSync(src, dest);
    }
  }
}

function publicPath(slug: string, filename: string): string {
  return `/products/${slug}/${filename}`;
}

async function seedProducts(): Promise<void> {
  await Product.deleteMany({});

  const docs = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
    baseStock: p.baseStock,
    images: p.images.map((f) => publicPath(p.slug, f)),
    thumbnail: publicPath(p.slug, p.thumbnail),
    variants: p.variants.map((axis) => ({
      name: axis.name,
      options: axis.options.map((opt) => ({
        value: opt.value,
        stock: opt.stock,
        images: opt.images ? opt.images.map((f) => publicPath(p.slug, f)) : undefined,
      })),
    })),
  }));

  await Product.insertMany(docs);
  console.log(`[seed] inserted ${docs.length} products`);
}

async function seedDemoUser(): Promise<void> {
  const email = "demo@example.com";
  const existing = await User.findOne({ email });
  if (existing) {

    if (!existing.emailVerified) {
      existing.emailVerified = true;
      await existing.save();
      console.log(`[seed] marked existing demo user verified (${email})`);
    } else {
      console.log(`[seed] demo user already exists (${email})`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash("Passw0rd!", 10);
  await User.create({ name: "Demo User", email, passwordHash, emailVerified: true });
  console.log(`[seed] created demo user -> ${email} / Passw0rd!`);
}

async function seedAdminUser(): Promise<void> {
  const email = "admin@nova.com";
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin" || !existing.emailVerified) {
      existing.role = "admin";
      existing.emailVerified = true;
      await existing.save();
      console.log(`[seed] marked existing admin user verified/admin (${email})`);
    } else {
      console.log(`[seed] admin user already exists (${email})`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash("AdminPass123!", 10);
  await User.create({
    name: "Admin",
    email,
    passwordHash,
    role: "admin",
    emailVerified: true,
  });
  console.log(`[seed] created admin user -> ${email} / AdminPass123!`);
}

async function seedHero(): Promise<void> {
  // Insert-if-missing, never overwrite: re-running the seed shouldn't wipe out
  // homepage copy an admin has since edited from the dashboard.
  const result = await SiteContent.updateOne(
    { key: HERO_KEY },
    { $setOnInsert: { key: HERO_KEY, ...DEFAULT_HERO } },
    { upsert: true }
  );

  if (result.upsertedCount > 0) {
    console.log("[seed] created default homepage hero");
  } else {
    console.log("[seed] homepage hero already exists (left untouched)");
  }
}

async function main() {
  console.log("[seed] copying product images...");
  copyProductImages();

  console.log("[seed] connecting to database...");
  await connectDB();

  await seedProducts();
  await seedHero();
  await seedDemoUser();
  await seedAdminUser();

  console.log("\n[seed] done.");
  console.log("[seed] demo login  -> demo@example.com / Passw0rd!");
  console.log("[seed] admin login -> admin@nova.com / AdminPass123! (sign in at /admin/login)\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
