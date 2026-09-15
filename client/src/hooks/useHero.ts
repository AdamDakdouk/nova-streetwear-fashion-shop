import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHero } from "../api/siteContent.api";
import { fetchAdminHero, updateAdminHero } from "../api/admin.api";
import type { HeroContent } from "../types";

const HERO_KEY = ["hero"];
const ADMIN_HERO_KEY = ["admin", "hero"];

/** Public homepage hero. */
export function useHero() {
  return useQuery({ queryKey: HERO_KEY, queryFn: fetchHero });
}

export function useAdminHero() {
  return useQuery({ queryKey: ADMIN_HERO_KEY, queryFn: fetchAdminHero });
}

export function useUpdateHero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HeroContent) => updateAdminHero(payload),
    onSuccess: (hero) => {
      // Write straight into both caches so a saved change is already live on the
      // storefront if the admin opens it in the same session.
      queryClient.setQueryData(ADMIN_HERO_KEY, hero);
      queryClient.setQueryData(HERO_KEY, hero);
    },
  });
}
