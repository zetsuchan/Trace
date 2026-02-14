"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  TreeStructure,
  Lightbulb,
  CircleNotch,
  CheckCircle,
  Hourglass,
  Plugs,
  Database,
  MagnifyingGlass,
  Globe,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";

// ── Types ────────────────────────────────────
type AgentStatus = "idle" | "running" | "complete";

interface AgentState {
  id: string;
  label: string;
  status: AgentStatus;
  description: string;
}

export type TraceStage = "idle" | "symptoms" | "chains" | "recommendations" | "complete";

interface AgentActivityPanelProps {
  stage: TraceStage;
  visible: boolean;
}

// ── Agent definitions ────────────────────────
const AGENTS: { id: string; label: string; descriptions: Record<string, string> }[] = [
  {
    id: "symptom-analyzer",
    label: "Symptom Analyzer",
    descriptions: {
      idle: "Waiting to parse symptoms",
      running: "Parsing symptoms and temporal patterns...",
      complete: "Symptoms identified",
    },
  },
  {
    id: "causal-chain-builder",
    label: "Causal Chain Builder",
    descriptions: {
      idle: "Waiting for symptom data",
      running: "Tracing causal connections across body systems...",
      complete: "Causal chains mapped",
    },
  },
  {
    id: "recommendation-agent",
    label: "Recommendation Agent",
    descriptions: {
      idle: "Waiting for causal analysis",
      running: "Generating actionable suggestions...",
      complete: "Recommendations ready",
    },
  },
];

// Map stage to which agents are active/complete
function getAgentStates(stage: TraceStage): AgentState[] {
  return AGENTS.map((agent) => {
    let status: AgentStatus = "idle";

    if (agent.id === "symptom-analyzer") {
      if (stage === "symptoms") status = "running";
      else if (["chains", "recommendations", "complete"].includes(stage)) status = "complete";
    } else if (agent.id === "causal-chain-builder") {
      if (stage === "chains") status = "running";
      else if (["recommendations", "complete"].includes(stage)) status = "complete";
    } else if (agent.id === "recommendation-agent") {
      if (stage === "recommendations") status = "running";
      else if (stage === "complete") status = "complete";
    }

    return {
      id: agent.id,
      label: agent.label,
      status,
      description: agent.descriptions[status],
    };
  });
}

// ── Icon for each agent ──────────────────────
function AgentIcon({ id, className }: { id: string; className?: string }) {
  const props = { size: 18, weight: "duotone" as const, className };
  switch (id) {
    case "symptom-analyzer":
      return <Brain {...props} />;
    case "causal-chain-builder":
      return <TreeStructure {...props} />;
    case "recommendation-agent":
      return <Lightbulb {...props} />;
    default:
      return <Brain {...props} />;
  }
}

// ── Status indicator ─────────────────────────
function StatusIcon({ status }: { status: AgentStatus }) {
  switch (status) {
    case "idle":
      return <Hourglass size={14} weight="duotone" className="text-muted-foreground" />;
    case "running":
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircleNotch size={14} weight="bold" className="text-primary" />
        </motion.div>
      );
    case "complete":
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", visualDuration: 0.25, bounce: 0.4 }}
        >
          <CheckCircle size={14} weight="fill" className="text-accent-safe" />
        </motion.div>
      );
  }
}

// ── MCP connection dot ───────────────────────
function McpConnections({ stage }: { stage: TraceStage }) {
  const connections = [
    {
      label: "Exa Search",
      icon: <MagnifyingGlass size={14} weight="duotone" className="text-muted-foreground" />,
      isActive: stage === "chains",
    },
    {
      label: "FireCrawl",
      icon: <Globe size={14} weight="duotone" className="text-muted-foreground" />,
      isActive: stage === "chains",
    },
    {
      label: "Obsidian",
      icon: <Database size={14} weight="duotone" className="text-muted-foreground" />,
      isActive: stage === "complete",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {connections.map((conn) => (
        <div key={conn.label} className="flex items-center gap-2.5 px-1">
          <div className="flex items-center gap-2">
            {conn.icon}
            <span className="text-xs text-muted-foreground">{conn.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-2 w-2 items-center justify-center">
              {conn.isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent-safe"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <div
                className={`relative h-2 w-2 rounded-full ${
                  conn.isActive ? "bg-accent-safe" : "bg-muted-foreground/40"
                }`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {conn.isActive ? "Connected" : "Idle"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main panel ───────────────────────────────
export function AgentActivityPanel({ stage, visible }: AgentActivityPanelProps) {
  const agents = getAgentStates(stage);
  const [elapsed, setElapsed] = useState(0);

  // Elapsed timer
  useEffect(() => {
    if (stage === "idle" || stage === "complete") {
      setElapsed(0);
      return;
    }

    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 100) / 10);
    }, 100);

    return () => clearInterval(timer);
  }, [stage]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", visualDuration: 0.4, bounce: 0.08 }}
        >
          <Card className="overflow-hidden border-border/60">
            <CardContent className="pt-5 pb-4">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plugs size={14} weight="duotone" className="text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Agent Pipeline
                  </span>
                </div>
                {stage !== "idle" && stage !== "complete" && (
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {elapsed.toFixed(1)}s
                  </span>
                )}
              </div>

              {/* Agent cards */}
              <div className="flex flex-col gap-2">
                {agents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      agent.status === "running"
                        ? "border-primary/30 bg-primary/5"
                        : agent.status === "complete"
                          ? "border-accent-safe/20 bg-accent-safe/5"
                          : "border-transparent bg-muted/30"
                    }`}
                  >
                    {/* Pulse bar for running agent */}
                    {agent.status === "running" && (
                      <motion.div
                        className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-primary"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}

                    <div className="mt-0.5">
                      <AgentIcon
                        id={agent.id}
                        className={
                          agent.status === "running"
                            ? "text-primary"
                            : agent.status === "complete"
                              ? "text-accent-safe"
                              : "text-muted-foreground"
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-medium ${
                            agent.status === "running"
                              ? "text-card-foreground"
                              : agent.status === "complete"
                                ? "text-card-foreground"
                                : "text-muted-foreground"
                          }`}
                        >
                          {agent.label}
                        </span>
                        <StatusIcon status={agent.status} />
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={agent.description}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground"
                        >
                          {agent.description}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* MCP connections */}
              <div className="mt-4 border-t border-border/40 pt-3">
                <McpConnections stage={stage} />
              </div>

              {/* Progress bar */}
              {stage !== "idle" && (
                <div className="mt-3">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{
                        width:
                          stage === "symptoms"
                            ? "20%"
                            : stage === "chains"
                              ? "55%"
                              : stage === "recommendations"
                                ? "85%"
                                : "100%",
                      }}
                      transition={{ type: "spring", visualDuration: 0.6, bounce: 0 }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
