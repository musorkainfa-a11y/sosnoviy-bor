import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Amenity, Location, Review } from "@/data/locations";

export const LOCATIONS_BUCKET = "location-photos";

const isExternal = (path: string) =>
  path.startsWith("http") || path.startsWith("/") || path.startsWith("blob:") || path.startsWith("data:");

/** Превращает пути в хранилище в подписанные ссылки (бакет приватный) */
export const resolveImageUrls = async (paths: string[]): Promise<Record<string, string>> => {
  const map: Record<string, string> = {};
  const storagePaths = Array.from(new Set(paths.filter((p) => p && !isExternal(p))));
  paths.filter((p) => p && isExternal(p)).forEach((p) => (map[p] = p));

  if (storagePaths.length > 0) {
    const { data } = await supabase.storage
      .from(LOCATIONS_BUCKET)
      .createSignedUrls(storagePaths, 60 * 60 * 24 * 7);
    data?.forEach((item) => {
      if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
    });
  }
  return map;
};

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export const fetchLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  const rows = data ?? [];

  const allPaths: string[] = [];
  rows.forEach((row) => {
    if (row.image_url) allPaths.push(row.image_url);
    asArray<string>(row.images).forEach((img) => allPaths.push(img));
  });
  const urlMap = await resolveImageUrls(allPaths);

  return rows.map((row) => {
    const imagePaths = asArray<string>(row.images);
    return {
      id: row.id,
      name: row.name,
      location: row.place ?? "",
      description: row.description ?? "",
      rating: Number(row.rating ?? 0),
      price: row.price_rub ?? 0,
      image: row.image_url ? urlMap[row.image_url] ?? "" : "",
      images: imagePaths.map((p) => urlMap[p] ?? "").filter(Boolean),
      features: asArray<string>(row.features),
      featured: !!row.featured,
      amenities: asArray<Amenity>(row.amenities),
      details: asArray<string>(row.details),
      reviews: asArray<Review>(row.reviews),
      sortOrder: row.sort_order ?? 0,
      imagePath: row.image_url ?? null,
      imagePaths,
    } satisfies Location;
  });
};

export const useLocations = () =>
  useQuery({ queryKey: ["locations"], queryFn: fetchLocations });

export const useFeaturedLocations = () => {
  const query = useLocations();
  return { ...query, data: (query.data ?? []).filter((l) => l.featured) };
};

export const useLocation = (id?: string) => {
  const query = useLocations();
  return { ...query, data: (query.data ?? []).find((l) => l.id === id) };
};
