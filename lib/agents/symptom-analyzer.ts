import { generateText } from "ai";
import { openrouter } from "@/lib/claude";

// ── Types ────────────────────────────────────
export interface ParsedSymptom {
  id: string;
  text: string;
  bodySystem: string;
  severity: "mild" | "moderate" | "severe";
  temporalMarker?: string; // "since yesterday", "for 3 days", etc.
  isNewOnset: boolean;
}

export interface SymptomAnalysis {
  symptoms: ParsedSymptom[];
  environmentalFactors: string[];
  temporalPattern: string; // "acute", "gradual", "recurring"
  rawInput: string;
}

// ── System Prompt ────────────────────────────
const SYMPTOM_ANALYZER_PROMPT = `You are a sickle cell disease symptom parser. Your ONLY job is to extract structured symptom data from patient input.

You must identify:
1. Each distinct symptom mentioned
2. Which body system it relates to (respiratory, circulatory, musculoskeletal, neurological, renal, immune, gastrointestinal, integumentary, endocrine)
3. Severity indicators (mild, moderate, severe) based on language intensity
4. Temporal markers (when it started, duration, pattern)
5. Whether this seems like a new onset or recurring issue
6. Environmental factors mentioned (weather, temperature, activity, stress, hydration, sleep)

SCD-SPECIFIC PARSING RULES:
- "Crisis" or "episode" = severe pain, likely vaso-occlusive
- "Tired" / "fatigue" in SCD context often indicates anemia exacerbation
- Shortness of breath in SCD = potential acute chest syndrome — flag as severe
- Priapism, stroke symptoms, sudden vision changes = always severe
- Joint/bone pain = musculoskeletal, common VOC sites
- Abdominal pain in SCD = could be splenic sequestration or hepatic crisis
- Fever + SCD = infection risk is elevated, treat as moderate minimum

Return valid JSON matching this exact structure:
{
  "symptoms": [
    {
      "id": "s1",
      "text": "exact or close paraphrase of what patient said",
      "bodySystem": "one of the systems listed above",
      "severity": "mild" | "moderate" | "severe",
      "temporalMarker": "temporal info if any, or null",
      "isNewOnset": true/false
    }
  ],
  "environmentalFactors": ["list of environmental factors mentioned"],
  "temporalPattern": "acute" | "gradual" | "recurring",
  "rawInput": "the original input text"
}

Be thorough. Separate compound symptoms into individual entries. A statement like "my legs and back hurt" is TWO symptoms.`;

// ── Agent Function ───────────────────────────
export async function analyzeSymptoms(
  inputText: string,
): Promise<SymptomAnalysis> {
  const { text } = await generateText({
    model: openrouter("minimax/minimax-m2.5"),
    system: SYMPTOM_ANALYZER_PROMPT,
    prompt: `Parse the following patient input:\n\n"${inputText}"`,
    maxOutputTokens: 2000,
  });

  let jsonText = text.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonText = fenceMatch[1].trim();

  const parsed = JSON.parse(jsonText) as SymptomAnalysis;
  parsed.rawInput = inputText;
  return parsed;
}
