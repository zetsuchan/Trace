"use client";

import { motion } from "motion/react";
import type { ChainNode as ChainNodeType } from "@/lib/types";

const NODE_COLORS: Record<ChainNodeType["type"], string> = {
  symptom: "border-l-chain-symptom",
  mechanism: "border-l-chain-mechanism",
  "root-cause": "border-l-chain-root",
};

const NODE_BG: Record<ChainNodeType["type"], string> = {
  symptom: "bg-chain-symptom/[0.03]",
  mechanism: "bg-chain-mechanism/[0.03]",
  "root-cause": "bg-chain-root/[0.05]",
};

const NODE_LABELS: Record<ChainNodeType["type"], string> = {
  symptom: "What you're feeling",
  mechanism: "What's happening",
  "root-cause": "Root Cause",
};

interface ChainNodeProps {
  node: ChainNodeType;
  state: "active" | "peeled";
  onTap?: () => void;
}

export function ChainNode({ node, state, onTap }: ChainNodeProps) {
  if (state === "peeled") {
    return (
      <motion.button
        layout
        onClick={onTap}
        className={`flex w-full items-center gap-2.5 rounded-lg border-l-3 px-3 py-1.5 text-left transition-all hover:bg-bg-elevated hover:shadow-sm ${NODE_COLORS[node.type]}`}
        aria-label={`${node.type}: ${node.title}`}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          {node.type === "root-cause" ? "Root" : node.type}
        </span>
        <span className="truncate text-xs font-medium text-text-secondary">{node.title}</span>
        <span className="ml-auto shrink-0 tabular-nums text-[9px] font-medium text-text-tertiary">
          {Math.round(node.confidence * 100)}%
        </span>
      </motion.button>
    );
  }

  // Active state — large, detailed, elevated
  const isRoot = node.type === "root-cause";

  return (
    <motion.div
      layout
      className={`relative w-full rounded-2xl border-l-4 p-6 text-left shadow-[0_0_0_1px_rgba(245,240,235,0.08),0_4px_16px_rgba(0,0,0,0.4),0_8px_32px_rgba(0,0,0,0.2)] ${NODE_COLORS[node.type]} ${NODE_BG[node.type]}`}
      style={{
        transform: "translateZ(0)", // Force GPU acceleration
      }}
      role="article"
      aria-label={`${NODE_LABELS[node.type]}: ${node.title}`}
    >
      <span
        className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
          isRoot ? "text-chain-root" : "text-text-tertiary"
        }`}
      >
        {NODE_LABELS[node.type]}
      </span>

      <h3
        className={`mt-3 font-semibold leading-[1.2] ${
          isRoot
            ? "text-3xl text-text-primary tracking-tight"
            : "text-2xl text-text-primary"
        }`}
        style={{ textWrap: "balance" }}
      >
        {node.title}
      </h3>

      <p className="mt-4 text-base leading-[1.6] text-text-secondary">
        {node.description}
      </p>

      {node.patientEvidence && (
        <p className="mt-4 border-t border-chain-connection/20 pt-4 text-sm leading-[1.5] italic text-text-tertiary">
          From your history: {node.patientEvidence}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-full bg-bg-elevated px-2.5 py-1 text-[10px] font-medium text-text-tertiary shadow-inner">
          {node.bodySystem}
        </span>
        <span className="tabular-nums text-xs font-medium text-text-tertiary">
          {Math.round(node.confidence * 100)}% confidence
        </span>
      </div>

      {node.citations && node.citations.length > 0 && (
        <div className="mt-4 border-t border-chain-connection/20 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-tertiary">
            Sources
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {node.citations.map((c, i) => (
              <li key={i} className="text-[11px] leading-[1.4] text-text-tertiary">
                {c.title} — {c.source}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
