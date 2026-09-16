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

// Aggregates reviews on demand rather than caching a denormalized count on Product to avoid data drift.
export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  const [result] = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (!result) return EMPTY_SUMMARY;
  return { avgRating: round1(result.avgRating), reviewCount: result.count };
}

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
