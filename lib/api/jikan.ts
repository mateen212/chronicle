import { SearchResult } from "@/types";

type JikanType = "anime" | "manga";

export async function searchJikan(query: string, type: JikanType): Promise<SearchResult[]> {
  const endpoint = type === "anime" ? "anime" : "manga";
  const response = await fetch(
    `https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(query)}&limit=12`,
    { next: { revalidate: 1800 } },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Jikan data");
  }

  const data = (await response.json()) as {
    data: Array<{
      mal_id: number;
      title: string;
      synopsis?: string;
      images?: { jpg?: { image_url?: string } };
      episodes?: number;
      chapters?: number;
      score?: number;
      genres?: Array<{ name: string }>;
    }>;
  };

  return data.data.map((item) => ({
    externalId: String(item.mal_id),
    externalSource: "jikan",
    title: item.title,
    description: item.synopsis,
    imageUrl: item.images?.jpg?.image_url,
    metadata: {
      episodes: item.episodes,
      chapters: item.chapters,
      score: item.score,
      genres: item.genres?.map((genre) => genre.name),
    },
  }));
}
