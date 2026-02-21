import { generateText } from "ai";
import { openrouter } from "@/lib/claude";
import type { CausalChain, Suggestion } from "@/lib/types";

type SendFn = (event: string, data: unknown) => void;

export async function runQuickTrace(inputText: string, send: SendFn) {
  send("status", { stage: "symptoms", message: "Analyzing symptoms..." });

  const { text } = await generateText({
    model: openrouter("minimax/minimax-m2.5"),
    system: `You are a sickle cell disease specialist AI. Analyze the patient's symptoms.

RESPOND WITH ONLY A JSON OBJECT. No prose before or after. No markdown fences. Just the raw JSON object.

The JSON must have this exact shape:
{"chain":{"id":"chain-1","label":"...","overallConfidence":0.8,"nodes":[{"id":"n1","type":"symptom","title":"...","description":"...","bodySystem":"...","confidence":0.9},{"id":"n2","type":"mechanism","title":"...","description":"...","bodySystem":"...","confidence":0.8},{"id":"n3","type":"root-cause","title":"...","description":"...","bodySystem":"...","confidence":0.85}],"connections":[{"fromNodeId":"n1","toNodeId":"n2","mechanism":"...","strength":"strong"},{"fromNodeId":"n2","toNodeId":"n3","mechanism":"...","strength":"strong"}]},"summary":"...","suggestions":[{"text":"...","forDoctor":true,"urgency":"discuss"},{"text":"...","forDoctor":false,"urgency":"info"}]}

Include 3-5 nodes in the chain. Urgency must be "urgent", "discuss", or "info". Include 2-4 suggestions.`,
    prompt: inputText,
    maxOutputTokens: 4000,
  });

  send("status", { stage: "chains", message: "Building causal chain..." });

  let jsonStr = text.trim();
  jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = jsonStr.indexOf("{");
  const end = jsonStr.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Failed to parse response — no JSON found");
  }
  jsonStr = jsonStr.slice(start, end + 1);

  const data = JSON.parse(jsonStr);

  send("chain", { chain: data.chain });
  send("summary", { content: data.summary });
  send("status", { stage: "recommendations", message: "Finalizing..." });
  send("suggestions", { suggestions: data.suggestions });

  return {
    chains: [data.chain] as CausalChain[],
    summary: data.summary as string,
    suggestions: data.suggestions as Suggestion[],
    thinking: "",
    symptoms: { symptoms: [], environmentalFactors: [], temporalPattern: "" },
  };
}
