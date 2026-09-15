import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { checkoutSchema } from "../validators/order.validators";
import { createOrder, getOrder, listOrders } from "../controllers/order.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listOrders);
router.post("/", validate(checkoutSchema), createOrder);
router.get("/:id", getOrder);

export default router;
