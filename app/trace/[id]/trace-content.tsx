"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Paperclip, X } from "@phosphor-icons/react";
import { ReasoningDisplay } from "@/components/reasoning-display";
import { AgentActivityPanel, type TraceStage, type ToolCallEvent } from "@/components/agent-activity-panel";
import { ChainView } from "@/components/chain-view";
import { BranchingView } from "@/components/branching-view";
import { TimelineView } from "@/components/timeline-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { CausalChain, Suggestion, InvestigationThread } from "@/lib/types";

type Phase = "thinking" | "result" | "error";

const SYMPTOM_SUGGESTIONS = [
  "My back has been aching all week, especially at night",
  "Sinus congestion and stuffiness for the past few days",
  "Feeling really dehydrated, haven't been drinking enough water",
  "Sharp pain in my lower legs, throbbing and persistent",
  "Cold front came through, joints feel stiff and painful",
  "Chest tightness when I breathe deeply",
  "Headaches since Tuesday, won't go away",
  "Didn't sleep well, woke up multiple times gasping",
  "Upper back pain radiating to my shoulders",
  "Feeling exhausted, low energy, short of breath walking upstairs",
  "Stuffy nose making it hard to breathe at night",
  "Stress from work has been through the roof this week",
  "Hands and feet feel cold and tingly",
  "Pain crisis coming on, I can feel it building",
  "Swelling in my ankles, worse in the evening",
];

// Mock initial investigation threads
const MOCK_INITIAL_THREADS: InvestigationThread[] = [
  {
    id: "weather-thread",
    title: "Recent cold front",
    category: "weather",
    icon: "🌡️",
    description: "Temperature dropped significantly this week, which can trigger vasoconstriction",
    confidence: 0.73,
  },
  {
    id: "hydration-thread",
    title: "Hydration levels",
    category: "hydration",
    icon: "💧",
    description: "Fluid intake may have decreased, concentrating blood and increasing sickling risk",
    confidence: 0.68,
  },
  {
    id: "sleep-thread",
    title: "Sleep quality down",
    category: "sleep",
    icon: "😴",
    description: "Poor sleep can trigger stress response and shallow breathing",
    confidence: 0.71,
  },
  {
    id: "breathing-thread",
    title: "Sinus congestion",
    category: "breathing",
    icon: "🫁",
    description: "Impaired breathing from congestion reduces oxygen saturation",
    confidence: 0.85,
  },
  {
    id: "activity-thread",
    title: "Increased activity",
    category: "activity",
    icon: "🏃",
    description: "More walking/exercise than usual increases oxygen demand",
    confidence: 0.62,
  },
  {
    id: "stress-thread",
    title: "Stress levels elevated",
    category: "stress",
    icon: "😰",
    description: "Higher stress triggers inflammation and vasoconstriction",
    confidence: 0.66,
  },
];

// Mock causal chain for Linear view demo
const MOCK_CHAINS: CausalChain[] = [
  {
    id: "chain-1",
    label: "Respiratory → Circulatory Cascade",
    overallConfidence: 0.88,
    nodes: [
      {
        id: "node-symptom",
        type: "symptom",
        title: "Back pain during crisis",
        description: "Sharp, persistent pain in the lower back — a hallmark of vaso-occlusive crisis triggered by sickled red blood cells blocking small vessels.",
        bodySystem: "Musculoskeletal",
        confidence: 0.95,
      },
      {
        id: "node-mech-1",
        type: "mechanism",
        title: "Vaso-occlusion in lumbar vessels",
        description: "Sickled cells aggregate and block microvascular flow in the lower back, causing ischemic pain and tissue damage.",
        bodySystem: "Circulatory",
        confidence: 0.88,
        patientEvidence: "You reported back pain worsening at night, consistent with positional blood flow changes.",
      },
      {
        id: "node-mech-2",
        type: "mechanism",
        title: "Oxygen desaturation from congestion",
        description: "Sinus congestion impairs gas exchange, dropping SpO2 below the sickling threshold of ~85%.",
        bodySystem: "Respiratory",
        confidence: 0.91,
        patientEvidence: "Nasal congestion reported for the past week.",
      },
      {
        id: "node-root",
        type: "root-cause",
        title: "Respiratory-driven sickling cascade",
        description: "Sinus blockage → impaired breathing → low O2 saturation → HbS polymerization → rigid sickle cells → vaso-occlusion → back pain crisis.",
        bodySystem: "Respiratory",
        confidence: 0.92,
        citations: [
          { title: "Nocturnal hypoxemia in sickle cell disease", source: "Blood Journal, 2023" },
          { title: "Upper airway obstruction and SCD crises", source: "Haematologica, 2022" },
        ],
      },
    ],
    connections: [
      {
        fromNodeId: "node-symptom",
        toNodeId: "node-mech-1",
        mechanism: "Pain signals from ischemic tissue",
        strength: "strong",
      },
      {
        fromNodeId: "node-mech-1",
        toNodeId: "node-mech-2",
        mechanism: "Sickling triggered by low oxygen",
        strength: "strong",
      },
      {
        fromNodeId: "node-mech-2",
        toNodeId: "node-root",
        mechanism: "Impaired breathing reduces O2 saturation",
        strength: "strong",
      },
    ],
  },
];

export function TraceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputText = searchParams.get("q") ?? "";
  const [localInput, setLocalInput] = useState("");
  const [analysisMode, setAnalysisMode] = useState<"deep" | "quick">("deep");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("thinking");
  const [thinking, setThinking] = useState("");
  const [chains, setChains] = useState<CausalChain[]>([]);
  const [summary, setSummary] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState("");
  const [activeChainIndex, setActiveChainIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"branching" | "linear" | "timeline">("branching");
  const [agentStage, setAgentStage] = useState<TraceStage>("idle");
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [toolCalls, setToolCalls] = useState<ToolCallEvent[]>([]);
  const started = useRef(false);

  // Auto-hide agent panel after results arrive
  useEffect(() => {
    if (phase === "result") {
      const timer = setTimeout(() => setShowAgentPanel(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (!inputText || started.current) return;
    started.current = true;

    async function run() {
      try {
        setPhase("thinking");
        setAgentStage("idle");
        setShowAgentPanel(true);

        const mode = searchParams.get("mode") ?? "deep";

        const res = await fetch("/api/trace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputText, mode }),
        });

        if (!res.ok || !res.body) {
          setError(`Server error: ${res.status}`);
          setPhase("error");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ") && currentEvent) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (currentEvent) {
                  case "status":
                    if (data.stage) setAgentStage(data.stage);
                    if (data.message) setThinking((prev) => prev + "\n" + data.message);
                    break;
                  case "thinking":
                    if (data.content) setThinking((prev) => prev + (prev ? "\n\n" : "") + data.content);
                    break;
                  case "tool_call":
                    if (data.tool) {
                      setToolCalls((prev) => {
                        const key = `${data.tool}:${data.input}`;
                        const idx = prev.findIndex((c) => `${c.tool}:${c.input}` === key);
                        if (idx !== -1) {
                          const updated = [...prev];
                          updated[idx] = data as ToolCallEvent;
                          return updated;
                        }
                        return [...prev, data as ToolCallEvent];
                      });
                    }
                    break;
                  case "symptoms":
                    setAgentStage("symptoms");
                    break;
                  case "chain":
                    if (data.chain) setChains((prev) => [...prev, data.chain]);
                    break;
                  case "summary":
                    if (data.content) setSummary(data.content);
                    break;
                  case "suggestions":
                    if (data.suggestions) setSuggestions(data.suggestions);
                    break;
                  case "done":
                    setAgentStage("complete");
                    setPhase("result");
                    // If no chains came from API, use mock chains for demo views
                    setChains((prev) => (prev.length > 0 ? prev : MOCK_CHAINS));
                    break;
                  case "error":
                    setError(data.message || "An error occurred");
                    setPhase("error");
                    break;
                }
              } catch {
                // ignore parse errors
              }
              currentEvent = "";
            }
          }
        }

        // If stream ended without explicit done event
        setPhase((prev) => {
          if (prev !== "result" && prev !== "error") return "result";
          return prev;
        });
        setAgentStage("complete");
        setChains((prev) => (prev.length > 0 ? prev : MOCK_CHAINS));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        setPhase("error");
      }
    }

    run();
  }, [inputText]);

  // If no query provided, show input UI (must be after all hooks)
  if (!inputText) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">New Trace</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Describe what you're feeling — we'll trace it to the root cause
          </p>
        </div>

        {/* Scrolling marquee of suggestions */}
        <div className="w-full overflow-hidden" aria-label="Example symptoms">
          <div className="flex gap-3 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...SYMPTOM_SUGGESTIONS, ...SYMPTOM_SUGGESTIONS].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setLocalInput(suggestion)}
                className="shrink-0 rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground transition-all hover:border-chain-active/40 hover:text-chain-active hover:bg-chain-active/5"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis mode toggle */}
        <div className="w-full max-w-xl flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAnalysisMode("deep")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                analysisMode === "deep"
                  ? "bg-chain-active/15 text-chain-active border-chain-active/40"
                  : "bg-card text-muted-foreground border-border hover:border-chain-active/20"
              }`}
            >
              Deep Trace Agent
            </button>
            <button
              type="button"
              onClick={() => setAnalysisMode("quick")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                analysisMode === "quick"
                  ? "bg-chain-active/15 text-chain-active border-chain-active/40"
                  : "bg-card text-muted-foreground border-border hover:border-chain-active/20"
              }`}
            >
              Quick Trace
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {analysisMode === "deep"
              ? "3 agents \u00b7 Opus reasoning \u00b7 Medical research \u00b7 ~2 min"
              : "Single analysis \u00b7 Sonnet 4.5 \u00b7 ~15 sec"}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (localInput.trim()) {
              router.push(`/trace/new?q=${encodeURIComponent(localInput.trim())}&mode=${analysisMode}`);
            }
          }}
          className="w-full max-w-xl"
        >
          <textarea
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="e.g. My nostrils have been giving me sinus issues, feeling stuffed, having some lower leg pains, throbbing pains..."
            rows={4}
            className="w-full rounded-xl border border-border bg-card p-4 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            aria-label="Describe your symptoms"
          />

          {/* File upload */}
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,.txt,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setUploadedFile(file);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-text-primary"
              aria-label="Upload a file"
            >
              <Paperclip size={14} />
              Attach file
            </button>
            {uploadedFile && (
              <span className="inline-flex items-center gap-1 rounded-full bg-chain-active/10 px-2.5 py-0.5 text-xs text-chain-active">
                {uploadedFile.name}
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-chain-active/20 transition-colors"
                  aria-label="Remove file"
                >
                  <X size={10} weight="bold" />
                </button>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!localInput.trim()}
            className="mt-4 w-full rounded-xl bg-chain-active px-6 py-3 text-base font-semibold text-bg-deep transition-all hover:shadow-[0_4px_20px_rgba(240,200,122,0.3)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start Trace →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center justify-between">
        <a
          href="/trace/new"
          className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          &larr; New trace
        </a>
        
        {/* View mode toggle with shadcn Tabs */}
        {phase === "result" && (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="branching">Interactive</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="linear">Linear</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* What the user said */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">You said</p>
          <p className="mt-2 text-base leading-relaxed text-card-foreground">{inputText}</p>
        </CardContent>
      </Card>

      {/* Error state */}
      {phase === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Agent Activity Panel — visible during processing */}
      <AgentActivityPanel
        stage={agentStage}
        visible={showAgentPanel && (phase === "thinking" || phase === "result")}
        toolCalls={toolCalls}
      />

      {/* Thinking — visible during stream */}
      <ReasoningDisplay
        thinking={thinking}
        isThinking={phase === "thinking"}
      />

      {/* View switcher — single AnimatePresence for smooth transitions */}
      {phase === "result" && (
        <AnimatePresence mode="wait">
          {viewMode === "branching" && (
            <motion.div
              key="branching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", visualDuration: 0.35, bounce: 0.08 }}
            >
              <BranchingView
                symptom={inputText}
                initialThreads={MOCK_INITIAL_THREADS}
                onComplete={(chain) => {
                  console.log("Investigation complete:", chain);
                }}
              />
            </motion.div>
          )}

          {viewMode === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", visualDuration: 0.35, bounce: 0.08 }}
            >
              <TimelineView currentSymptom={inputText} />
            </motion.div>
          )}

          {viewMode === "linear" && (
            <motion.div
              key="linear"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", visualDuration: 0.35, bounce: 0.08 }}
              className="flex flex-col gap-6"
            >
              {/* Chain selector tabs */}
              {chains.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {chains.map((chain, i) => (
                    <button
                      key={chain.id}
                      onClick={() => setActiveChainIndex(i)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        i === activeChainIndex
                          ? "bg-chain-active/15 text-chain-active"
                          : "bg-bg-elevated text-text-tertiary hover:text-text-secondary"
                      }`}
                    >
                      Chain {i + 1}
                      <span className="ml-1.5 tabular-nums opacity-60">
                        {Math.round(chain.overallConfidence * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Active chain — peeling layers */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={chains[activeChainIndex]?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {chains[activeChainIndex] && (
                    <ChainView
                      traceId="new"
                      chain={chains[activeChainIndex]}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Summary — below investigation */}
      {phase === "result" && summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {summary}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Separator className="my-2" />

      {/* Suggestions */}
      {phase === "result" && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-accent-safe">
            Suggestions
          </p>
          {suggestions.map((s, i) => (
            <Card key={i} className="border-l-4 border-l-accent-safe">
              <CardContent className="pt-4">
                <p className="text-sm text-card-foreground">{s.text}</p>
                {s.forDoctor && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Discuss with your doctor
                  </p>
                )}
                <span
                  className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.urgency === "urgent"
                      ? "bg-destructive/15 text-destructive"
                      : s.urgency === "discuss"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s.urgency}
                </span>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
