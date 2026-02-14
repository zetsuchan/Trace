"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { InvestigationNode, InvestigationThread } from "@/lib/types";

interface BranchingViewProps {
  symptom: string;
  initialThreads: InvestigationThread[];
  onComplete?: (chain: InvestigationNode[]) => void;
}

// Context-aware thread generation based on parent category
const DEEPER_THREADS: Record<string, InvestigationThread[]> = {
  weather: [
    {
      id: "weather-vaso",
      title: "Vasoconstriction from cold",
      category: "mechanism",
      icon: "🧊",
      description: "Cold triggers blood vessel narrowing, reducing flow to extremities",
      confidence: 0.82,
    },
    {
      id: "weather-root",
      title: "Temperature-induced sickling cascade",
      category: "root-cause",
      icon: "🎯",
      description: "Prolonged cold exposure → vasoconstriction → reduced oxygen → sickling",
      confidence: 0.87,
    },
  ],
  hydration: [
    {
      id: "hydration-viscosity",
      title: "Blood viscosity increase",
      category: "mechanism",
      icon: "🩸",
      description: "Dehydration concentrates red blood cells, increasing sickling probability",
      confidence: 0.78,
    },
    {
      id: "hydration-root",
      title: "Dehydration-driven blood concentration",
      category: "root-cause",
      icon: "🎯",
      description: "Insufficient fluids → concentrated blood → increased viscosity → crisis",
      confidence: 0.84,
    },
  ],
  sleep: [
    {
      id: "sleep-hypoxia",
      title: "Nocturnal hypoxia",
      category: "mechanism",
      icon: "🌙",
      description: "Shallow breathing during poor sleep lowers oxygen levels overnight",
      confidence: 0.74,
    },
    {
      id: "sleep-root",
      title: "Sleep-deprived oxygen desaturation",
      category: "root-cause",
      icon: "🎯",
      description: "Poor sleep → shallow breathing → low O2 overnight → morning crisis",
      confidence: 0.80,
    },
  ],
  breathing: [
    {
      id: "breathing-o2",
      title: "Oxygen saturation drop",
      category: "mechanism",
      icon: "📉",
      description: "Congestion impairs gas exchange, dropping SpO2 below safe threshold",
      confidence: 0.89,
    },
    {
      id: "breathing-root",
      title: "Respiratory-driven sickling cascade",
      category: "root-cause",
      icon: "🎯",
      description: "Sinus blockage → impaired breathing → low O2 saturation → sickling → pain",
      confidence: 0.92,
    },
  ],
  activity: [
    {
      id: "activity-demand",
      title: "Oxygen demand exceeds supply",
      category: "mechanism",
      icon: "💨",
      description: "Increased activity creates oxygen debt faster than body can compensate",
      confidence: 0.71,
    },
    {
      id: "activity-root",
      title: "Exertion-triggered oxygen deficit",
      category: "root-cause",
      icon: "🎯",
      description: "Over-exertion → oxygen demand spike → tissue hypoxia → sickling",
      confidence: 0.76,
    },
  ],
  stress: [
    {
      id: "stress-cortisol",
      title: "Cortisol-driven inflammation",
      category: "mechanism",
      icon: "🧬",
      description: "Stress hormones trigger inflammatory response and vasoconstriction",
      confidence: 0.72,
    },
    {
      id: "stress-root",
      title: "Stress-inflammation feedback loop",
      category: "root-cause",
      icon: "🎯",
      description: "Chronic stress → cortisol → inflammation → vascular damage → pain → more stress",
      confidence: 0.77,
    },
  ],
};

// Fallback for mechanism-level threads that go even deeper
const MECHANISM_DEEPER: InvestigationThread[] = [
  {
    id: "cascade-cellular",
    title: "Cellular sickling cascade",
    category: "root-cause",
    icon: "🎯",
    description: "HbS polymerization under low oxygen → rigid sickle cells → vaso-occlusion → pain crisis",
    confidence: 0.91,
  },
  {
    id: "cascade-inflammatory",
    title: "Inflammatory amplification",
    category: "root-cause",
    icon: "🎯",
    description: "Sickled cells damage vessel walls → inflammation → more sickling → escalating crisis",
    confidence: 0.85,
  },
];

export function BranchingView({
  symptom,
  initialThreads,
  onComplete,
}: BranchingViewProps) {
  const [investigationPath, setInvestigationPath] = useState<InvestigationNode[]>([
    {
      id: "symptom-root",
      type: "symptom",
      title: symptom,
      description: "Your reported symptom — select a thread below to begin investigating",
      confidence: 1,
      threads: initialThreads,
    },
  ]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const currentNode = investigationPath[investigationPath.length - 1];
  const depth = investigationPath.length;

  function handleInvestigate(thread: InvestigationThread) {
    // If clicking a root cause, complete the investigation
    if (thread.category === "root-cause") {
      setSelectedThreadId(thread.id);
      setTimeout(() => {
        const rootNode: InvestigationNode = {
          id: `root-${thread.id}-${Date.now()}`,
          type: "root-cause",
          title: thread.title,
          description: thread.description,
          confidence: thread.confidence,
          threads: [], // No more threads - investigation is done
        };
        const completePath = [...investigationPath, rootNode];
        setInvestigationPath(completePath);
        setSelectedThreadId(null);
        setIsComplete(true);
        onComplete?.(completePath);
      }, 700);
      return;
    }

    // Otherwise drill deeper into mechanism
    setSelectedThreadId(thread.id);
    setTimeout(() => {
      const nextThreads = getThreadsForCategory(thread.category, depth);
      const mechanismNode: InvestigationNode = {
        id: `mechanism-${thread.id}-${Date.now()}`,
        type: "mechanism",
        title: thread.title,
        description: thread.description,
        confidence: thread.confidence,
        threads: nextThreads,
      };
      setInvestigationPath((prev) => [...prev, mechanismNode]);
      setSelectedThreadId(null);
    }, 800);
  }

  function getThreadsForCategory(category: string, currentDepth: number): InvestigationThread[] {
    // First level: use category-specific threads
    if (currentDepth <= 2) {
      return DEEPER_THREADS[category] || MECHANISM_DEEPER;
    }
    // Deeper levels: always show root cause options
    return MECHANISM_DEEPER;
  }

  function handleGoBack() {
    if (investigationPath.length > 1) {
      setInvestigationPath((prev) => prev.slice(0, -1));
      setIsComplete(false);
    }
  }

  function handleReset() {
    setInvestigationPath([
      {
        id: "symptom-root",
        type: "symptom",
        title: symptom,
        description: "Your reported symptom — select a thread below to begin investigating",
        confidence: 1,
        threads: initialThreads,
      },
    ]);
    setIsComplete(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb trail */}
      <nav aria-label="Investigation path" className="flex items-center gap-2 overflow-x-auto pb-2">
        {investigationPath.map((node, index) => (
          <div key={node.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                setInvestigationPath((prev) => prev.slice(0, index + 1));
                setIsComplete(false);
              }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                index === investigationPath.length - 1
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
              }`}
              aria-current={index === investigationPath.length - 1 ? "step" : undefined}
            >
              {node.type === "symptom" ? "Symptom" : node.type === "mechanism" ? node.title.slice(0, 20) : "Root Cause"}
            </button>
            {index < investigationPath.length - 1 && (
              <span className="text-muted-foreground" aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </nav>

      {/* Current node display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNode.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", visualDuration: 0.5, bounce: 0.15 }}
        >
          <Card className={`border-l-4 ${
            currentNode.type === "root-cause"
              ? "border-l-chain-root"
              : currentNode.type === "mechanism"
                ? "border-l-chain-mechanism"
                : "border-l-primary"
          }`}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
                    currentNode.type === "root-cause"
                      ? "text-chain-root"
                      : currentNode.type === "mechanism"
                        ? "text-chain-mechanism"
                        : "text-primary"
                  }`}>
                    {currentNode.type === "symptom"
                      ? "Current Symptom"
                      : currentNode.type === "mechanism"
                        ? `Layer ${depth - 1} — Mechanism`
                        : "Root Cause Identified"}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold leading-[1.2] text-card-foreground">
                    {currentNode.title}
                  </h2>
                  <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">
                    {currentNode.description}
                  </p>
                  {currentNode.confidence && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentNode.confidence * 100}%` }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className={`h-full ${
                            currentNode.type === "root-cause" ? "bg-chain-root" : "bg-primary"
                          }`}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {Math.round(currentNode.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {depth > 1 && (
                  <button
                    onClick={handleGoBack}
                    aria-label="Go back to previous step"
                    className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-border/80 hover:bg-secondary hover:text-secondary-foreground"
                  >
                    ← Back
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Investigation complete state */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", visualDuration: 0.5, bounce: 0.2 }}
        >
          <Card className="border-chain-root/40 bg-chain-root/5">
            <CardContent className="pt-5 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.3 }}
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-chain-root/20 text-2xl"
              >
                🎯
              </motion.div>
              <h3 className="text-lg font-bold text-card-foreground">
                Investigation Complete
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Traced through {depth - 1} layer{depth - 1 !== 1 ? "s" : ""} to identify the root cause
              </p>

              <Separator className="my-4" />

              {/* Path summary */}
              <div className="flex flex-col gap-2 text-left">
                {investigationPath.map((node, i) => (
                  <div key={node.id} className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      node.type === "root-cause"
                        ? "bg-chain-root/20 text-chain-root"
                        : node.type === "mechanism"
                          ? "bg-chain-mechanism/20 text-chain-mechanism"
                          : "bg-primary/20 text-primary"
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`text-sm ${
                      node.type === "root-cause" ? "font-semibold text-chain-root" : "text-muted-foreground"
                    }`}>
                      {node.title}
                    </span>
                    {node.confidence && (
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                        {Math.round(node.confidence * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Investigate another path
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Investigation threads - cards that pop up */}
      {!isComplete && currentNode.threads && currentNode.threads.length > 0 && (
        <div>
          <p className="mb-4 text-sm font-semibold text-muted-foreground">
            {currentNode.threads.some((t) => t.category === "root-cause")
              ? "Select a root cause or investigate deeper:"
              : "Choose a thread to investigate:"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {currentNode.threads.map((thread, index) => {
              const isRoot = thread.category === "root-cause";

              return (
                <motion.button
                  key={thread.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    delay: 0.2 + index * 0.1,
                    type: "spring",
                    visualDuration: 0.4,
                    bounce: 0.2,
                  }}
                  onClick={() => handleInvestigate(thread)}
                  disabled={selectedThreadId !== null}
                  aria-label={`Investigate: ${thread.title}`}
                  className={`group relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all ${
                    isRoot
                      ? "border-chain-root/40 bg-chain-root/5 hover:border-chain-root hover:bg-chain-root/10"
                      : "border-border bg-card hover:border-primary/60 hover:bg-primary/5"
                  } ${selectedThreadId === thread.id ? "border-primary animate-pulse" : ""} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {/* Icon + confidence badge */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-3xl" aria-hidden="true">{thread.icon}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                      {Math.round(thread.confidence * 100)}%
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base font-semibold leading-[1.3] transition-colors ${
                    isRoot ? "text-chain-root" : "text-card-foreground group-hover:text-primary"
                  }`}>
                    {thread.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm leading-[1.5] text-muted-foreground">
                    {thread.description}
                  </p>

                  {/* Category tag */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      isRoot ? "bg-chain-root/15 text-chain-root" : "bg-secondary text-muted-foreground"
                    }`}>
                      {isRoot ? "Root Cause" : "Mechanism"}
                    </span>
                  </div>

                  {/* Glow effect for root cause */}
                  {isRoot && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                      className="pointer-events-none absolute inset-0 rounded-xl bg-chain-root/20 blur-xl"
                      aria-hidden="true"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
