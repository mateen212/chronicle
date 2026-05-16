export type ChronicleItemType =
  | "movie"
  | "series"
  | "anime"
  | "manga"
  | "book"
  | "project"
  | "course"
  | "game"

export type ChronicleStatus =
  | "planned"
  | "watching"
  | "reading"
  | "completed"
  | "paused"
  | "dropped"

export interface SearchResult {
  externalId: string
  externalSource: string
  title: string
  description?: string
  imageUrl?: string
  metadata: Record<string, unknown>
}

export interface DashboardStats {
  total: number
  active: number
  completed: number
  paused: number
}
