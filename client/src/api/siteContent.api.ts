import { apiClient } from "./client";
import type { HeroContent } from "../types";

export async function fetchHero(): Promise<HeroContent> {
  const { data } = await apiClient.get<HeroContent>("/site-content/hero");
  return data;
}
