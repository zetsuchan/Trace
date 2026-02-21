import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { openrouter } from "@/lib/claude";
import { searchExa } from "@/lib/tools/exa";
import { scrapeUrl } from "@/lib/tools/firecrawl";
import type { SymptomAnalysis } from "./symptom-analyzer";
import type { CausalChain } from "@/lib/types";

// ── Types ────────────────────────────────────
export interface CausalChainResult {
  chains: CausalChain[];
  summary: string;
  thinking: string;
}

type SendFn = (event: string, data: unknown) => void;

// ── System Prompt ────────────────────────────
const CAUSAL_CHAIN_PROMPT = `You are a sickle cell disease pathophysiology expert. Your job is to trace CAUSAL CHAINS from symptoms back to root causes, through the biological mechanisms that connect them.

You receive structured symptom data and must build causal chains showing WHY the patient feels what they feel.

RESEARCH REQUIREMENT:
Before building the causal chains, you MUST use the search_medical_research tool at least once to find relevant recent medical research on the patient's primary symptoms. Use the scrape_article tool on promising results to get full details. This grounds your chains in current evidence.

SCD PATHOPHYSIOLOGY KNOWLEDGE:
- HbS polymerization triggers: dehydration, hypoxia, acidosis, cold, stress
- Vaso-occlusion cascade: HbS polymerization → RBC sickling → adhesion to endothelium → microvascular occlusion → ischemia → pain
- Hemolytic anemia: chronic RBC destruction → low Hb → fatigue, pallor, jaundice
- Endothelial dysfunction: free hemoglobin scavenges NO → vasoconstriction → pulmonary hypertension
- Splenic dysfunction: autosplenectomy by adulthood in HbSS → infection vulnerability
- Chronic organ damage: kidneys (hyposthenuria, CKD), liver (iron overload), bones (avascular necrosis), lungs (ACS, fibrosis), brain (silent infarcts)
- Inflammatory state: elevated WBC, IL-6, TNF-alpha, CRP → chronic endothelial activation
- Iron overload from transfusions → cardiac/hepatic damage

CROSS-SYSTEM CHAINS TO CONSIDER:
- Respiratory → Circulatory: hypoxia → sickling → vaso-occlusion
- Musculoskeletal → Neurological: bone marrow infarction → fat embolism → stroke
- Immune → All systems: infection → fever → dehydration → sickling cascade
- Endocrine → Circulatory: stress hormones → vasoconstriction → trapped sickle cells
- Renal → Circulatory: hyposthenuria → dehydration → blood viscosity → VOC
- Sleep → Immune → Circulatory: poor sleep → inflammation → endothelial activation → VOC

RULES:
- Build 2-4 chains per analysis, ordered by confidence (highest first)
- Each chain must have the biological MECHANISM at each step
- Confidence: 0.8-1.0 = strong evidence, 0.5-0.79 = moderate, below 0.5 = speculative
- Connection strength: "strong" = well-established mechanism, "moderate" = plausible, "possible" = speculative
- Always trace TO a root cause — don't stop at intermediate mechanisms
- Node types flow: symptom → mechanism → ... → root-cause
- Each node needs a bodySystem tag

Return valid JSON:
{
  "chains": [
    {
      "id": "chain-1",
      "label": "Descriptive name for this causal pathway",
      "overallConfidence": 0.0-1.0,
      "nodes": [
        {
          "id": "node-1",
          "type": "symptom",
          "title": "Short title",
          "description": "Detailed explanation",
          "bodySystem": "system name",
          "confidence": 0.0-1.0
        }
      ],
      "connections": [
        {
          "fromNodeId": "node-2",
          "toNodeId": "node-1",
          "mechanism": "Biological mechanism linking these",
          "strength": "strong" | "moderate" | "possible"
        }
      ]
    }
  ],
  "summary": "2-3 sentence plain-language summary of findings"
}`;

// ── Agent Function ───────────────────────────
export async function buildCausalChains(
  symptoms: SymptomAnalysis,
  send?: SendFn,
): Promise<CausalChainResult> {
  let reasoning = "";

  const { text } = await generateText({
    model: openrouter("moonshotai/kimi-k2.5"),
    system: CAUSAL_CHAIN_PROMPT,
    prompt: `Analyze these parsed symptoms and build causal chains:\n\n${JSON.stringify(symptoms, null, 2)}`,
    maxOutputTokens: 16000,
    stopWhen: stepCountIs(5),
    tools: {
      search_medical_research: tool({
        description:
          "Search for medical research and sickle cell disease information relevant to the patient's symptoms",
        inputSchema: z.object({
          query: z.string().describe("Search query about SCD symptoms, mechanisms, or treatments"),
        }),
        execute: async ({ query }) => {
          send?.("tool_call", { tool: "exa", name: "Exa Search", input: query, status: "calling" });
          const results = await searchExa(query);
          send?.("tool_call", { tool: "exa", name: "Exa Search", input: query, status: "done" });
          return JSON.stringify(results, null, 2);
        },
      }),
      scrape_article: tool({
        description:
          "Scrape the full content of a medical article or research paper for detailed information",
        inputSchema: z.object({
          url: z.string().describe("URL of the article to scrape"),
        }),
        execute: async ({ url }) => {
          send?.("tool_call", { tool: "firecrawl", name: "FireCrawl", input: url, status: "calling" });
          const result = await scrapeUrl(url);
          send?.("tool_call", { tool: "firecrawl", name: "FireCrawl", input: url, status: "done" });
          return result;
        },
      }),
    },
    onStepFinish: (step) => {
      if (step.reasoningText) {
        reasoning += step.reasoningText;
        send?.("thinking", { content: step.reasoningText });
      }
    },
  });

  let jsonText = text.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonText = fenceMatch[1].trim();

  const parsed = JSON.parse(jsonText);

  return {
    chains: parsed.chains || [],
    summary: parsed.summary || "",
    thinking: reasoning,
  };
}
