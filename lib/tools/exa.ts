// lib/tools/exa.ts

interface ExaResult {
  title: string;
  url: string;
  text: string;
}

export async function searchExa(query: string): Promise<ExaResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error("EXA_API_KEY not set");

  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults: 5,
      contents: {
        text: { maxCharacters: 3000 },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Exa API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    title: r.title || "",
    url: r.url || "",
    text: r.text || "",
  }));
}
