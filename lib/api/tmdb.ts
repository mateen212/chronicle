import { SearchResult } from "@/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type TmdbType = "movie" | "series";

export async function searchTmdb(query: string, type: TmdbType): Promise<SearchResult[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is missing");
  }

  const endpoint = type === "movie" ? "search/movie" : "search/tv";
  const response = await fetch(
    `${TMDB_BASE_URL}/${endpoint}?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch TMDB data");
  }

  const data = (await response.json()) as {
    results: Array<{
      id: number;
      title?: string;
      name?: string;
      overview?: string;
      poster_path?: string;
      genre_ids?: number[];
      original_language?: string;
      release_date?: string;
      first_air_date?: string;
    }>;
  };

  return data.results.slice(0, 12).map((item) => ({
    externalId: String(item.id),
    externalSource: "tmdb",
    title: item.title ?? item.name ?? "Untitled",
    description: item.overview,
    imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
    metadata: {
      language: item.original_language,
      genreIds: item.genre_ids,
      releasedAt: item.release_date ?? item.first_air_date,
    },
  }));
}
