import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createOrder, getOrder } from "../controllers/order.controller";

const router = Router();

router.use(requireAuth);

router.post("/", createOrder);
router.get("/:id", getOrder);

export default router;
