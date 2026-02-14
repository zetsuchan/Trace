import { analyzeSymptoms } from "./symptom-analyzer";
import { buildCausalChains } from "./causal-chain-builder";
import { generateRecommendations } from "./recommendation-agent";
import { saveTraceNote } from "@/lib/tools/obsidian";
import { db } from "@/lib/db";
import { traces, traceChains, suggestions as suggestionsTable } from "@/lib/db/schema";
import type { CausalChain, Suggestion } from "@/lib/types";
import type { SymptomAnalysis } from "./symptom-analyzer";

// ── Types ────────────────────────────────────
export interface TraceResult {
  symptoms: SymptomAnalysis;
  chains: CausalChain[];
  summary: string;
  suggestions: Suggestion[];
  thinking: string;
}

type SendFn = (event: string, data: unknown) => void;

// ── MCP Tool Definitions ─────────────────────
// Tools are now called directly via API helpers (lib/tools/obsidian.ts).
export const mcpToolDefinitions: never[] = [];

// ── Orchestrator ─────────────────────────────
export async function runTrace(
  inputText: string,
  send: SendFn,
): Promise<TraceResult> {
  // ── Step 1: Symptom Analysis ──
  send("status", {
    stage: "symptoms",
    message: "Parsing symptoms...",
  });

  const symptoms = await analyzeSymptoms(inputText);

  send("symptoms", {
    symptoms: symptoms.symptoms,
    environmentalFactors: symptoms.environmentalFactors,
    temporalPattern: symptoms.temporalPattern,
  });

  // ── Step 2: Causal Chain Building ──
  send("status", {
    stage: "chains",
    message: "Tracing causal connections across body systems...",
  });

  const chainResult = await buildCausalChains(symptoms);

  // Stream thinking from the chain builder
  if (chainResult.thinking) {
    send("thinking", { content: chainResult.thinking });
  }

  // Send each chain as it's available
  for (const chain of chainResult.chains) {
    send("chain", { chain });
  }

  send("summary", { content: chainResult.summary });

  // ── Step 3: Recommendations ──
  send("status", {
    stage: "recommendations",
    message: "Generating actionable suggestions...",
  });

  const recResult = await generateRecommendations(
    chainResult.chains,
    chainResult.summary,
  );

  send("suggestions", { suggestions: recResult.suggestions });

  // ── Step 4: Save Results ──

  // Save to Obsidian
  send("status", {
    stage: "saving",
    message: "Saving to Obsidian...",
    mcps: ["obsidian"],
  });

  try {
    const symptomSummary = symptoms.symptoms.map((s) => s.text).join(", ");
    const markdown = formatTraceMarkdown(
      symptomSummary,
      chainResult.thinking,
      chainResult.chains,
      chainResult.summary,
      recResult.suggestions,
    );
    await saveTraceNote(symptomSummary, markdown);
  } catch (err) {
    console.error("Obsidian save failed:", err);
  }

  // Save to Postgres
  send("status", {
    stage: "saving",
    message: "Saving to database...",
    mcps: ["postgres"],
  });

  try {
    const [traceRow] = await db
      .insert(traces)
      .values({
        inputText,
        summary: chainResult.summary,
        thinking: chainResult.thinking,
        chains: chainResult.chains,
        suggestions: recResult.suggestions,
      })
      .returning({ id: traces.id });

    if (traceRow) {
      // Insert chain nodes
      const chainNodeRows = chainResult.chains.flatMap((chain, ci) =>
        chain.nodes.map((node, ni) => ({
          traceId: traceRow.id,
          nodeType: node.type,
          title: node.title,
          description: node.description,
          confidence: node.confidence,
          position: ci * 100 + ni,
        })),
      );

      if (chainNodeRows.length > 0) {
        await db.insert(traceChains).values(chainNodeRows);
      }

      // Insert suggestions
      const suggestionRows = recResult.suggestions.map((s) => ({
        traceId: traceRow.id,
        text: s.text,
        urgency: s.urgency,
        forDoctor: s.forDoctor,
      }));

      if (suggestionRows.length > 0) {
        await db.insert(suggestionsTable).values(suggestionRows);
      }
    }
  } catch (err) {
    console.error("Database save failed:", err);
  }

  // ── Complete ──
  send("status", { stage: "complete", message: "Trace complete" });

  return {
    symptoms,
    chains: chainResult.chains,
    summary: chainResult.summary,
    suggestions: recResult.suggestions,
    thinking: chainResult.thinking,
  };
}

// ── Helpers ──────────────────────────────────
function formatTraceMarkdown(
  symptomSummary: string,
  thinking: string,
  chains: CausalChain[],
  summary: string,
  suggestions: Suggestion[],
): string {
  const lines: string[] = [
    `# TRACE Analysis`,
    ``,
    `**Symptoms:** ${symptomSummary}`,
    `**Date:** ${new Date().toISOString()}`,
    ``,
    `## Thinking`,
    ``,
    thinking || "_No extended thinking captured._",
    ``,
    `## Causal Chains`,
    ``,
  ];

  for (const chain of chains) {
    lines.push(`### ${chain.label} (confidence: ${Math.round(chain.overallConfidence * 100)}%)`);
    lines.push(``);
    for (const node of chain.nodes) {
      lines.push(`- **[${node.type}]** ${node.title} — ${node.description}`);
    }
    lines.push(``);
  }

  lines.push(`## Summary`, ``, summary, ``);

  lines.push(`## Suggestions`, ``);
  for (const s of suggestions) {
    const badge = s.urgency === "urgent" ? "🔴" : s.urgency === "discuss" ? "🟡" : "🔵";
    const audience = s.forDoctor ? "(for doctor)" : "(for patient)";
    lines.push(`- ${badge} ${s.text} ${audience}`);
  }

  return lines.join("\n");
}
