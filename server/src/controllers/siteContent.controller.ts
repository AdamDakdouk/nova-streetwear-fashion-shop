import { Request, Response } from "express";
import { SiteContent, HERO_KEY } from "../models/SiteContent";
import { asyncHandler } from "../middleware/asyncHandler";
import { DEFAULT_HERO } from "../seed/hero.data";

export const getHero = asyncHandler(async (_req: Request, res: Response) => {
  const hero = await SiteContent.findOne({ key: HERO_KEY });
// Fall back to default config if the document is missing,
// so unseeded databases render the homepage cleanly.
  res.status(200).json(hero ?? { key: HERO_KEY, ...DEFAULT_HERO });
});
