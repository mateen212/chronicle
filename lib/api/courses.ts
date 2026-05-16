import { SearchResult } from "@/types";

export async function searchYouTubePlaylists(query: string): Promise<SearchResult[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.warn("YOUTUBE_API_KEY is missing — course search disabled");
    return [];
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${encodeURIComponent(query)}&maxResults=12&key=${key}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) throw new Error("Failed to fetch YouTube data");

  const data = (await response.json()) as {
    items: Array<{
      id: { playlistId: string };
      snippet: {
        title: string;
        description: string;
        thumbnails?: { medium?: { url: string } };
        channelTitle: string;
      };
    }>;
  };

  const playlists = data.items ?? [];

  // Fetch video counts for each playlist
  const results = await Promise.all(
    playlists.map(async (item) => {
      let videoCount: number | undefined;
      try {
        const detailRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${item.id.playlistId}&key=${key}`,
          { next: { revalidate: 3600 } },
        );
        const detailData = (await detailRes.json()) as {
          items: Array<{ contentDetails: { itemCount: number } }>;
        };
        videoCount = detailData.items?.[0]?.contentDetails?.itemCount;
      } catch {
        // ignore
      }

      return {
        externalId: item.id.playlistId,
        externalSource: "youtube" as const,
        title: item.snippet.title,
        description: `${item.snippet.channelTitle} · ${item.snippet.description}`.trim(),
        imageUrl: item.snippet.thumbnails?.medium?.url,
        metadata: {
          channelTitle: item.snippet.channelTitle,
          videoCount,
          playlistUrl: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
        },
      } satisfies SearchResult;
    }),
  );

  return results;
}
