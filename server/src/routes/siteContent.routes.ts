import { Router } from "express";
import { getHero } from "../controllers/siteContent.controller";

const router = Router();

// Public: the storefront homepage reads this on every visit.
router.get("/hero", getHero);

export default router;
