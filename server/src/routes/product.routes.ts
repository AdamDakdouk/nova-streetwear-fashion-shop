import { Router } from "express";
import { getById, list } from "../controllers/product.controller";
import reviewRoutes from "./review.routes";

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.use("/:id/reviews", reviewRoutes);

export default router;
