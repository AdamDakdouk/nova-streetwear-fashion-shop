import { Request, Response } from "express";
import { SiteContent, HERO_KEY } from "../models/SiteContent";
import { asyncHandler } from "../middleware/asyncHandler";
import { DEFAULT_HERO } from "../seed/hero.data";

export const getHero = asyncHandler(async (_req: Request, res: Response) => {
  const hero = await SiteContent.findOne({ key: HERO_KEY });
  // The seed writes this document, so it normally exists. Falling back to the
  // shipped defaults rather than 404ing means an unseeded database still
  // renders a complete homepage instead of an empty hero.
  res.status(200).json(hero ?? { key: HERO_KEY, ...DEFAULT_HERO });
});
