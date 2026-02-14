import { anthropic } from "@/lib/claude";
import type { CausalChain, Suggestion } from "@/lib/types";

// ── Types ────────────────────────────────────
export interface RecommendationResult {
  suggestions: Suggestion[];
}

// ── System Prompt ────────────────────────────
const RECOMMENDATION_PROMPT = `You are a sickle cell disease care advisor. You receive causal chains that trace a patient's symptoms to root causes, and you generate actionable recommendations.

You are NOT a doctor. You generate suggestions for the patient to DISCUSS with their healthcare team. Frame everything as "consider discussing" or "ask your doctor about", never as direct medical advice.

RECOMMENDATION CATEGORIES:

URGENT (urgency: "urgent"):
- Signs of acute chest syndrome: chest pain + fever + respiratory symptoms
- Stroke symptoms: sudden weakness, speech changes, vision loss
- Splenic sequestration: rapid spleen enlargement, sudden severe anemia
- Priapism lasting > 2 hours
- Fever > 101.3F (38.5C) in functionally asplenic patient
- Severe dehydration with inability to keep fluids down
- Pain not responding to home management after reasonable attempt

DISCUSS WITH DOCTOR (urgency: "discuss"):
- New symptom patterns not previously experienced
- Increasing frequency of pain episodes
- Medication side effects or interactions
- Need for specialist referral based on chain findings
- Preventive measures for identified triggers
- Lab work or imaging that might clarify a chain

INFORMATIONAL (urgency: "info"):
- Hydration reminders tied to identified dehydration chains
- Weather/environment awareness
- Sleep hygiene when sleep-related chains found
- Stress management techniques
- Activity modifications
- General SCD self-management tips relevant to findings

RULES:
- Generate 3-6 suggestions
- At least one should be "forDoctor: true"
- Order by urgency: urgent first, then discuss, then info
- Be specific — reference the actual chains and symptoms found
- Urgent items should name which emergency action to consider
- Include which specialist type when recommending doctor discussion

Return valid JSON:
{
  "suggestions": [
    {
      "text": "Clear, actionable suggestion text",
      "forDoctor": true/false,
      "urgency": "urgent" | "discuss" | "info"
    }
  ]
}`;

// ── Agent Function ───────────────────────────
export async function generateRecommendations(
  chains: CausalChain[],
  summary: string,
): Promise<RecommendationResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2000,
    system: RECOMMENDATION_PROMPT,
    messages: [
      {
        role: "user",
        content: `Based on these causal chains and summary, generate recommendations:\n\nSUMMARY: ${summary}\n\nCHAINS:\n${JSON.stringify(chains, null, 2)}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let jsonText = text.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonText);
  return { suggestions: parsed.suggestions || [] };
}
