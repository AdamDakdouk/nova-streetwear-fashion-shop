import { Types } from "mongoose";
import { Review } from "../models/Review";

export interface RatingSummary {
  avgRating: number;
  reviewCount: number;
}

const EMPTY_SUMMARY: RatingSummary = { avgRating: 0, reviewCount: 0 };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Computed live from the reviews collection rather than a denormalized counter
 * on Product — for a catalog this small, an aggregate query is cheap and it can
 * never drift out of sync with an edited/deleted review. */
export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  const [result] = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (!result) return EMPTY_SUMMARY;
  return { avgRating: round1(result.avgRating), reviewCount: result.count };
}

/** Same as above but for every product in one query, for the listing page. */
export async function getRatingSummariesByProduct(): Promise<Map<string, RatingSummary>> {
  const results = await Review.aggregate([
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const map = new Map<string, RatingSummary>();
  for (const r of results) {
    map.set(String(r._id), { avgRating: round1(r.avgRating), reviewCount: r.count });
  }
  return map;
}
