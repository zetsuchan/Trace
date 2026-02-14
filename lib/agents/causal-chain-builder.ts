import { anthropic } from "@/lib/claude";
import type Anthropic from "@anthropic-ai/sdk";
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

// ── System Prompt ────────────────────────────
const CAUSAL_CHAIN_PROMPT = `You are a sickle cell disease pathophysiology expert. Your job is to trace CAUSAL CHAINS from symptoms back to root causes, through the biological mechanisms that connect them.

You receive structured symptom data and must build causal chains showing WHY the patient feels what they feel.

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

// ── Tools ────────────────────────────────────
const tools: Anthropic.Messages.Tool[] = [
  {
    name: "search_medical_research",
    description:
      "Search for medical research and sickle cell disease information relevant to the patient's symptoms",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Search query about SCD symptoms, mechanisms, or treatments",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "scrape_article",
    description:
      "Scrape the full content of a medical article or research paper for detailed information",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "URL of the article to scrape",
        },
      },
      required: ["url"],
    },
  },
];

// ── Agent Function ───────────────────────────
export async function buildCausalChains(
  symptoms: SymptomAnalysis,
): Promise<CausalChainResult> {
  const promptText = `Analyze these parsed symptoms and build causal chains:\n\n${JSON.stringify(symptoms, null, 2)}`;

  const params = {
    model: "claude-opus-4-6" as const,
    max_tokens: 16000,
    thinking: {
      type: "enabled" as const,
      budget_tokens: 4000,
    },
    system: CAUSAL_CHAIN_PROMPT,
    tools,
  };

  let messages: Anthropic.Messages.MessageParam[] = [{ role: "user" as const, content: promptText }];
  let response = await anthropic.messages.create({ ...params, messages });

  // ── Tool-use loop ──────────────────────────
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      let result: string;
      const input = block.input as Record<string, string>;

      if (block.name === "search_medical_research") {
        const results = await searchExa(input.query);
        result = JSON.stringify(results, null, 2);
      } else if (block.name === "scrape_article") {
        result = await scrapeUrl(input.url);
      } else {
        result = JSON.stringify({ error: `Unknown tool: ${block.name}` });
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }

    messages = [
      ...messages,
      { role: "assistant" as const, content: response.content as Anthropic.Messages.ContentBlockParam[] },
      { role: "user" as const, content: toolResults },
    ];

    response = await anthropic.messages.create({ ...params, messages });
  }

  // ── Parse final response ───────────────────
  let thinkingText = "";
  let responseText = "";

  for (const block of response.content) {
    if (block.type === "thinking") {
      thinkingText = block.thinking;
    } else if (block.type === "text") {
      responseText = block.text;
    }
  }

  // Strip markdown fences
  let jsonText = responseText.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonText);

  return {
    chains: parsed.chains || [],
    summary: parsed.summary || "",
    thinking: thinkingText,
  };
}
