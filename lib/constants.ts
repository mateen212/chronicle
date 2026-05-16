import type { ChronicleItemType, ChronicleStatus } from "@/types"

export const ITEM_TYPES = ["movie","series","anime","manga","book","project","course","game"] as const
export const ITEM_STATUSES = ["planned","watching","reading","completed","paused","dropped"] as const

export type ItemType = ChronicleItemType
export type ItemStatus = ChronicleStatus

export const TYPE_LABELS: Record<string, string> = {
  movie:"Movie", series:"Series", anime:"Anime", manga:"Manga",
  book:"Book", project:"Project", course:"Course", game:"Game"
}
export const STATUS_LABELS: Record<string, string> = {
  planned:"Planned", watching:"Watching", reading:"Reading",
  completed:"Completed", paused:"Paused", dropped:"Dropped"
}
export const STATUS_COLORS: Record<string, string> = {
  planned:"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  watching:"bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  reading:"bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  completed:"bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  paused:"bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  dropped:"bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}
export const TYPE_COLORS: Record<string, string> = {
  movie:"#3b82f6", series:"#8b5cf6", anime:"#ec4899", manga:"#f59e0b",
  book:"#10b981", project:"#6366f1", course:"#14b8a6", game:"#f97316"
}
