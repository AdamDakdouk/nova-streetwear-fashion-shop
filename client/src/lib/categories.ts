export interface CategoryBucket {
  value: string;
  label: string;
  categories: string[]; // matches Product.category values
}

export const CATEGORY_BUCKETS: CategoryBucket[] = [
  { value: "clothing", label: "Clothing", categories: ["T-Shirts", "Hoodies", "Jackets", "Pants"] },
  { value: "footwear", label: "Footwear", categories: ["Footwear"] },
  { value: "accessories", label: "Accessories", categories: ["Accessories"] },
];

export function bucketMatches(bucketValue: string, category: string): boolean {
  const bucket = CATEGORY_BUCKETS.find((b) => b.value === bucketValue);
  return bucket ? bucket.categories.includes(category) : true;
}
