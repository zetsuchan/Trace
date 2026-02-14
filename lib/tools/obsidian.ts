// lib/tools/obsidian.ts

const BASE_URL = "http://localhost:27124";

function getHeaders() {
  const apiKey = process.env.OBSIDIAN_API_KEY;
  if (!apiKey) throw new Error("OBSIDIAN_API_KEY not set");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export interface SearchResult {
  filename: string;
  score: number;
  matches: { match: string; context: string }[];
}

export async function searchNotes(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${BASE_URL}/search/simple/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ query, contextLength: 200 }),
  });

  if (!res.ok) {
    console.error(`Obsidian search failed: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return (data || []).slice(0, 5).map((r: any) => ({
    filename: r.filename || "",
    score: r.score || 0,
    matches: (r.matches || []).slice(0, 3).map((m: any) => ({
      match: m.match || "",
      context: m.context || "",
    })),
  }));
}

export async function readNote(path: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/vault/${encodeURIComponent(path)}`, {
    headers: {
      ...getHeaders(),
      Accept: "text/markdown",
    },
  });

  if (!res.ok) {
    console.error(`Obsidian read failed: ${res.status}`);
    return "";
  }

  return res.text();
}

export async function saveTraceNote(title: string, content: string): Promise<boolean> {
  const date = new Date().toISOString().split("T")[0];
  const safeName = title.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 60);
  const path = `TRACE Patient Notes/${date} - ${safeName}.md`;

  const res = await fetch(`${BASE_URL}/vault/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: {
      ...getHeaders(),
      "Content-Type": "text/markdown",
    },
    body: content,
  });

  if (!res.ok) {
    console.error(`Obsidian save failed: ${res.status}`);
    return false;
  }

  return true;
}
