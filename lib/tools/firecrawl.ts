// lib/tools/firecrawl.ts

export async function scrapeUrl(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not set");

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FireCrawl API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const markdown = data.data?.markdown || "";
  // Trim to 4000 chars max to keep context manageable
  return markdown.slice(0, 4000);
}
