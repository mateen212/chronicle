import { NextResponse } from "next/server";
import { z } from "zod";

import { searchGithubRepositories } from "@/lib/api/github";
import { searchGoogleBooks } from "@/lib/api/google-books";
import { searchJikan } from "@/lib/api/jikan";
import { searchTmdb } from "@/lib/api/tmdb";
import { ITEM_TYPES } from "@/lib/constants";

const querySchema = z.object({
  q: z.string().min(2),
  type: z.enum(ITEM_TYPES as [string, ...string[]]),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      q: searchParams.get("q"),
      type: searchParams.get("type"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { q, type } = parsed.data;

    if (type === "movie" || type === "series") {
      const results = await searchTmdb(q, type);
      return NextResponse.json({ results });
    }

    if (type === "anime" || type === "manga") {
      const results = await searchJikan(q, type);
      return NextResponse.json({ results });
    }

    if (type === "book") {
      const results = await searchGoogleBooks(q);
      return NextResponse.json({ results });
    }

    if (type === "project") {
      const results = await searchGithubRepositories(q);
      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected search error",
      },
      { status: 500 },
    );
  }
}
