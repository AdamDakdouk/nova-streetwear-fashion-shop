import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
