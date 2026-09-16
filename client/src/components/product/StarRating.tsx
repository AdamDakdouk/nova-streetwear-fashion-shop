import { Star } from "lucide-react";

interface StarProps {
  fill: number; // 0-1
  size: string;
}

function PartialStar({ fill, size }: StarProps) {
  return (
    <span className={`relative inline-block ${size}`}>
      <Star className={`absolute inset-0 ${size} text-border`} aria-hidden="true" />
      {fill > 0 && (
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
          <Star className={`${size} text-accent`} fill="currentColor" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

// Read-only rating stars with support for fractional fills (e.g. 4.3 shows 4 full stars and a 30% filled 5th star).
export function StarRating({ rating, reviewCount, size = "sm" }: StarRatingProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const fills = [0, 1, 2, 3, 4].map((i) => Math.max(0, Math.min(1, rating - i)));

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-hidden="true">
        {fills.map((fill, i) => (
          <PartialStar key={i} fill={fill} size={starSize} />
        ))}
      </div>
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
      {reviewCount !== undefined && (
        <span className={size === "sm" ? "text-xs text-muted" : "text-sm text-muted"}>
          {reviewCount > 0 ? `${rating.toFixed(1)} (${reviewCount})` : "No reviews yet"}
        </span>
      )}
    </div>
  );
}
