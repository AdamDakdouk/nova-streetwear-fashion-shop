import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addToCartSchema, updateCartSchema } from "../validators/cart.validators";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../controllers/cart.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/", validate(addToCartSchema), addToCart);
router.patch("/:itemId", validate(updateCartSchema), updateCartItem);
router.delete("/:itemId", removeFromCart);

export default router;
