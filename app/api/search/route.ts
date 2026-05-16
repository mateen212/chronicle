import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { searchGithubRepositories } from "@/lib/api/github"
import { searchGoogleBooks } from "@/lib/api/google-books"
import { searchJikan } from "@/lib/api/jikan"
import { searchRawg } from "@/lib/api/rawg"
import { searchTmdb } from "@/lib/api/tmdb"
import { ITEM_TYPES } from "@/lib/constants"

const querySchema = z.object({
  q: z.string().min(2).max(200),
  type: z.enum(ITEM_TYPES as unknown as [string, ...string[]]),
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const parsed = querySchema.safeParse({
    q: searchParams.get("q"),
    type: searchParams.get("type"),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 })
  }

  const { q, type } = parsed.data

  try {
    let results: import("@/types").SearchResult[]
    if (type === "movie" || type === "series") {
      results = await searchTmdb(q, type as "movie" | "series")
    } else if (type === "anime" || type === "manga") {
      results = await searchJikan(q, type as "anime" | "manga")
    } else if (type === "book") {
      results = await searchGoogleBooks(q)
    } else if (type === "project") {
      results = await searchGithubRepositories(q)
    } else if (type === "game") {
      results = await searchRawg(q)
    } else {
      results = []
    }
    return NextResponse.json(results)
  } catch (e) {
    console.error("Search error:", e)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
