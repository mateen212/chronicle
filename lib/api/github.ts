import { SearchResult } from "@/types";

export async function searchGithubRepositories(query: string): Promise<SearchResult[]> {
  const token = process.env.GITHUB_TOKEN;

  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=12`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      next: { revalidate: 900 },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub repositories");
  }

  const data = (await response.json()) as {
    items: Array<{
      id: number;
      full_name: string;
      description?: string;
      stargazers_count: number;
      language?: string;
      owner?: { avatar_url?: string };
      html_url: string;
    }>;
  };

  return data.items.map((item) => ({
    externalId: String(item.id),
    externalSource: "github",
    title: item.full_name,
    description: item.description,
    imageUrl: item.owner?.avatar_url,
    metadata: {
      stars: item.stargazers_count,
      language: item.language,
      url: item.html_url,
    },
  }));
}
