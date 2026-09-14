import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { reviewSchema } from "../validators/review.validators";
import { deleteReview, listReviews, upsertReview } from "../controllers/review.controller";

// mergeParams so :id (the product id) from the parent product route is visible here.
const router = Router({ mergeParams: true });

router.get("/", listReviews);
router.post("/", requireAuth, validate(reviewSchema), upsertReview);
router.delete("/", requireAuth, deleteReview);

export default router;
