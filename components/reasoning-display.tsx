"use client";

import { motion } from "motion/react";
import { ChainOfThought } from "@/components/ui/chain-of-thought";

interface ReasoningDisplayProps {
  thinking: string;
  isThinking: boolean;
}

// Parse thinking text into structured steps
function parseThinkingToSteps(thinking: string, isThinking: boolean) {
  const lines = thinking.split("\n").filter((l) => l.trim());

  if (lines.length === 0 && isThinking) {
    return [
      {
        id: "init",
        title: "Initializing trace analysis",
        icon: "🔍",
        status: "active" as const,
      },
    ];
  }

  return lines.map((line, i) => ({
    id: `step-${i}`,
    title: line.trim(),
    icon: getStepIcon(line, i),
    status:
      i < lines.length - 1
        ? ("complete" as const)
        : isThinking
          ? ("active" as const)
          : ("complete" as const),
    description: getStepDescription(line),
    results: getStepResults(line),
  }));
}

function getStepIcon(line: string, index: number): string {
  const lower = line.toLowerCase();
  if (lower.includes("analyz")) return "🔬";
  if (lower.includes("symptom")) return "🩺";
  if (lower.includes("causal") || lower.includes("pathway")) return "🔗";
  if (lower.includes("cross-system") || lower.includes("connection")) return "⚡";
  if (lower.includes("weather") || lower.includes("temperature")) return "🌡️";
  if (lower.includes("hydra")) return "💧";
  if (lower.includes("sleep")) return "😴";
  if (lower.includes("breath") || lower.includes("sinus")) return "🫁";
  if (lower.includes("evaluat")) return "📊";
  if (lower.includes("consider")) return "🧠";
  const icons = ["🔍", "🧠", "⚡", "🔗", "📊", "🎯"];
  return icons[index % icons.length];
}

function getStepDescription(line: string): string | undefined {
  const lower = line.toLowerCase();
  if (lower.includes("analyz"))
    return "Parsing your input for symptom patterns and temporal markers";
  if (lower.includes("causal"))
    return "Evaluating multiple causal chains across body systems";
  if (lower.includes("cross-system"))
    return "Checking for cascading effects between respiratory, circulatory, and musculoskeletal systems";
  return undefined;
}

function getStepResults(line: string): { label: string }[] | undefined {
  const lower = line.toLowerCase();
  if (lower.includes("cross-system") || lower.includes("connection")) {
    return [
      { label: "Respiratory" },
      { label: "Circulatory" },
      { label: "Musculoskeletal" },
    ];
  }
  return undefined;
}

export function ReasoningDisplay({
  thinking,
  isThinking,
}: ReasoningDisplayProps) {
  if (!isThinking && !thinking) return null;

  const steps = parseThinkingToSteps(thinking, isThinking);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", visualDuration: 0.4, bounce: 0.08 }}
    >
      <ChainOfThought
        title={isThinking ? "Tracing connections..." : "Trace reasoning"}
        steps={steps}
        defaultOpen={isThinking}
      />
    </motion.div>
  );
}
