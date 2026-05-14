import { SearchResult } from "@/types";

export async function searchGoogleBooks(query: string): Promise<SearchResult[]> {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_BOOKS_API_KEY is missing");
  }

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&key=${key}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google Books data");
  }

  const data = (await response.json()) as {
    items?: Array<{
      id: string;
      volumeInfo?: {
        title?: string;
        description?: string;
        imageLinks?: { thumbnail?: string };
        pageCount?: number;
        authors?: string[];
        categories?: string[];
      };
    }>;
  };

  return (data.items ?? []).map((item) => ({
    externalId: item.id,
    externalSource: "google_books",
    title: item.volumeInfo?.title ?? "Untitled",
    description: item.volumeInfo?.description,
    imageUrl: item.volumeInfo?.imageLinks?.thumbnail,
    metadata: {
      pageCount: item.volumeInfo?.pageCount,
      authors: item.volumeInfo?.authors,
      categories: item.volumeInfo?.categories,
    },
  }));
}
