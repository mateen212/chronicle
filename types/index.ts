export type ChronicleItemType =
  | "movie"
  | "series"
  | "anime"
  | "manga"
  | "book"
  | "project"
  | "course"
  | "game";

export type ChronicleStatus =
  | "planned"
  | "watching"
  | "reading"
  | "completed"
  | "paused"
  | "dropped";

export type SearchResult = {
  externalId: string;
  externalSource: "tmdb" | "jikan" | "google_books" | "github";
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
};
