import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const parsed = paramsSchema.safeParse({ id })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const key = process.env.TMDB_API_KEY
  if (!key) {
    return NextResponse.json({ error: "TMDB not configured" }, { status: 500 })
  }

  const mediaType = request.nextUrl.searchParams.get("type") === "movie" ? "movie" : "tv"
  const url = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${key}&language=en-US&append_to_response=credits`

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) {
      return NextResponse.json({ error: "TMDB request failed" }, { status: 502 })
    }
    const data = await res.json() as Record<string, unknown>

    if (mediaType === "tv") {
      const seasons = (data.seasons as Array<{ season_number: number; episode_count: number; name: string }> ?? [])
        .filter((s) => s.season_number > 0)
        .map((s) => ({
          seasonNumber: s.season_number,
          episodeCount: s.episode_count,
          name: s.name,
        }))

      return NextResponse.json({
        id: data.id,
        name: data.name,
        totalSeasons: data.number_of_seasons ?? 0,
        totalEpisodes: data.number_of_episodes ?? 0,
        seasons,
        backdropPath: data.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
          : null,
        genres: (data.genres as Array<{ name: string }> ?? []).map((g) => g.name),
        status: data.status,
        cast: (
          (data.credits as { cast?: Array<{ name: string; character: string; profile_path?: string }> })?.cast ?? []
        ).slice(0, 10).map((c) => ({
          name: c.name,
          character: c.character,
          photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
        })),
      })
    }

    // movie
    return NextResponse.json({
      id: data.id,
      title: data.title,
      runtime: data.runtime ?? 0,
      backdropPath: data.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
        : null,
      genres: (data.genres as Array<{ name: string }> ?? []).map((g) => g.name),
      releaseDate: data.release_date,
      cast: (
        (data.credits as { cast?: Array<{ name: string; character: string; profile_path?: string }> })?.cast ?? []
      ).slice(0, 10).map((c) => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
      })),
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 })
  }
}
