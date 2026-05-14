import { ChronicleItemType, ChronicleStatus } from "@/types";

export const ITEM_TYPES: ChronicleItemType[] = [
  "movie",
  "series",
  "anime",
  "manga",
  "book",
  "project",
  "course",
  "game",
];

export const ITEM_STATUSES: ChronicleStatus[] = [
  "planned",
  "watching",
  "reading",
  "completed",
  "paused",
  "dropped",
];
