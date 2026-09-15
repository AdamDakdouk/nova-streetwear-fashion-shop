import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createOrder, getOrder, listOrders } from "../controllers/order.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listOrders);
router.post("/", createOrder);
router.get("/:id", getOrder);

export default router;
