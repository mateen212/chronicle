import { SearchResult } from "@/types";

const RAWG_BASE_URL = "https://api.rawg.io/api";

export async function searchRawg(query: string): Promise<SearchResult[]> {
  const key = process.env.RAWG_API_KEY;
  if (!key) {
    console.warn("RAWG_API_KEY is missing — game search disabled");
    return [];
  }

  const response = await fetch(
    `${RAWG_BASE_URL}/games?key=${key}&search=${encodeURIComponent(query)}&page_size=12`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) throw new Error("Failed to fetch RAWG data");

  const data = (await response.json()) as {
    results: Array<{
      id: number;
      name: string;
      description_raw?: string;
      background_image?: string;
      rating?: number;
      released?: string;
      genres?: Array<{ name: string }>;
      platforms?: Array<{ platform: { name: string } }>;
      playtime?: number;
    }>;
  };

  return data.results.slice(0, 12).map((item) => ({
    externalId: String(item.id),
    externalSource: "rawg" as const,
    title: item.name,
    description: item.description_raw,
    imageUrl: item.background_image ?? undefined,
    metadata: {
      rating: item.rating,
      released: item.released,
      genres: item.genres?.map((g) => g.name),
      platforms: item.platforms?.map((p) => p.platform.name),
      playtime: item.playtime,
    },
  }));
}
