import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrls } from "@/hooks/useLocations";

export interface SiteImage {
  key: string;
  label: string;
  alt: string;
  recommended: string;
  storagePath: string | null;
  externalUrl: string | null;
  url: string | null;
  sortOrder: number;
}

export const fetchSiteImages = async (): Promise<Record<string, SiteImage>> => {
  const { data, error } = await supabase
    .from("site_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const rows = data ?? [];
  const urlMap = await resolveImageUrls(
    rows.map((r) => r.storage_path).filter(Boolean) as string[]
  );

  const result: Record<string, SiteImage> = {};
  rows.forEach((row) => {
    result[row.key] = {
      key: row.key,
      label: row.label ?? "",
      alt: row.alt ?? "",
      recommended: row.recommended ?? "",
      storagePath: row.storage_path ?? null,
      externalUrl: row.external_url ?? null,
      url: row.storage_path ? urlMap[row.storage_path] ?? null : row.external_url ?? null,
      sortOrder: row.sort_order ?? 0,
    };
  });
  return result;
};

export const useSiteImages = () =>
  useQuery({ queryKey: ["site-images"], queryFn: fetchSiteImages });

/** Возвращает картинку из админки, либо запасную из сборки */
export const useSiteImage = (key: string, fallback: string) => {
  const { data } = useSiteImages();
  const entry = data?.[key];
  return { src: entry?.url || fallback, alt: entry?.alt || "" };
};
