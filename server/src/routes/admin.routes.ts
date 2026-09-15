import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { uploadImage } from "../middleware/upload";
import { heroSchema, productSchema } from "../validators/admin.validators";
import {
  createProduct,
  deleteProduct,
  getHero,
  getProduct,
  listProducts,
  updateHero,
  updateProduct,
  uploadProductImage,
} from "../controllers/admin.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/products", listProducts);
router.get("/products/:id", getProduct);
router.post("/products", validate(productSchema), createProduct);
router.put("/products/:id", validate(productSchema), updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/site-content/hero", getHero);
router.put("/site-content/hero", validate(heroSchema), updateHero);

router.post("/upload", uploadImage, uploadProductImage);

export default router;
