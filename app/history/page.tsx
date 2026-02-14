"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

interface HistoryTrace {
  id: string;
  symptom: string;
  date: Date;
  rootCause: string;
  confidence: number;
  urgency: "info" | "discuss" | "urgent";
}

// Mock historical data
const MOCK_HISTORY: HistoryTrace[] = [
  {
    id: "trace-1",
    symptom: "Lower back tightness and dehydration",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    rootCause: "Sinus congestion reducing oxygen saturation",
    confidence: 0.85,
    urgency: "discuss",
  },
  {
    id: "trace-2",
    symptom: "Back pain getting worse this week",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    rootCause: "Cold weather triggering vasoconstriction",
    confidence: 0.73,
    urgency: "info",
  },
  {
    id: "trace-3",
    symptom: "Sinus congestion with chest throbbing",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    rootCause: "Upper respiratory inflammation cascade",
    confidence: 0.81,
    urgency: "discuss",
  },
  {
    id: "trace-4",
    symptom: "Stuffy nose, cold front, upper back tightness",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    rootCause: "Temperature drop with reduced hydration",
    confidence: 0.68,
    urgency: "info",
  },
  {
    id: "trace-5",
    symptom: "Headaches since Tuesday",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    rootCause: "Sleep deprivation lowering oxygen levels",
    confidence: 0.76,
    urgency: "info",
  },
];

const URGENCY_COLORS = {
  info: "border-l-text-tertiary bg-text-tertiary/5",
  discuss: "border-l-chain-active bg-chain-active/5",
  urgent: "border-l-red-500 bg-red-500/10",
};

export default function HistoryPage() {
  const [selectedTrace, setSelectedTrace] = useState<HistoryTrace | null>(null);
  const [filter, setFilter] = useState<"all" | "discuss" | "urgent">("all");

  const filteredHistory = MOCK_HISTORY.filter((trace) => {
    if (filter === "all") return true;
    return trace.urgency === filter;
  });

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header with asymmetric layout */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-text-primary">
            History
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {MOCK_HISTORY.length} traces · Past 2 weeks
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 rounded-lg bg-bg-elevated p-1" role="group" aria-label="Filter traces by urgency">
          <button
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              filter === "all"
                ? "bg-chain-active/15 text-chain-active"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("discuss")}
            aria-pressed={filter === "discuss"}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              filter === "discuss"
                ? "bg-chain-active/15 text-chain-active"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            To Discuss
          </button>
          <button
            onClick={() => setFilter("urgent")}
            aria-pressed={filter === "urgent"}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              filter === "urgent"
                ? "bg-red-500/15 text-red-400"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            Urgent
          </button>
        </div>
      </motion.div>

      {/* Traces list */}
      <div className="grid gap-4" role="list">
        {filteredHistory.map((trace, index) => (
          <motion.button
            key={trace.id}
            role="listitem"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
            }}
            onClick={() => setSelectedTrace(trace)}
            aria-label={`${formatDate(trace.date)}: ${trace.symptom} — ${trace.urgency}`}
            className={`group relative flex w-full flex-col gap-3 rounded-xl border-l-4 p-5 text-left transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${URGENCY_COLORS[trace.urgency]}`}
          >
            {/* Date badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-tertiary">
                {formatDate(trace.date)}
              </span>
              <span className="tabular-nums text-xs font-medium text-text-tertiary">
                {Math.round(trace.confidence * 100)}% confidence
              </span>
            </div>

            {/* Symptom */}
            <h3 className="text-lg font-semibold leading-[1.3] text-text-primary transition-colors group-hover:text-chain-active">
              {trace.symptom}
            </h3>

            {/* Root cause found */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-xs text-chain-root">→</span>
              <p className="text-sm leading-[1.5] text-text-secondary">
                {trace.rootCause}
              </p>
            </div>

            {/* Urgency badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  trace.urgency === "urgent"
                    ? "bg-red-500/15 text-red-400"
                    : trace.urgency === "discuss"
                      ? "bg-chain-active/15 text-chain-active"
                      : "bg-bg-elevated text-text-tertiary"
                }`}
              >
                {trace.urgency}
              </span>
            </div>

            {/* Hover arrow */}
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-text-tertiary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true">
              →
            </span>
          </motion.button>
        ))}
      </div>

      {/* Selected trace detail modal */}
      <AnimatePresence>
        {selectedTrace && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrace(null)}
              className="fixed inset-0 z-40 bg-bg-deep/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="trace-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", visualDuration: 0.4, bounce: 0.15 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-chain-connection/20 bg-bg-surface p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-tertiary">
                      {formatDate(selectedTrace.date)}
                    </span>
                    <h2 id="trace-modal-title" className="mt-2 text-2xl font-bold leading-[1.2] text-text-primary">
                      {selectedTrace.symptom}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedTrace(null)}
                    aria-label="Close dialog"
                    className="text-2xl text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
                  >
                    ×
                  </button>
                </div>

                {/* Root cause */}
                <div className="rounded-xl border-l-4 border-l-chain-root bg-chain-root/5 p-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-chain-root">
                    Root Cause Found
                  </p>
                  <p className="text-base leading-[1.6] text-text-primary">
                    {selectedTrace.rootCause}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="tabular-nums text-sm font-medium text-text-tertiary">
                      {Math.round(selectedTrace.confidence * 100)}% confidence
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        selectedTrace.urgency === "urgent"
                          ? "bg-red-500/15 text-red-400"
                          : selectedTrace.urgency === "discuss"
                            ? "bg-chain-active/15 text-chain-active"
                            : "bg-bg-elevated text-text-tertiary"
                      }`}
                    >
                      {selectedTrace.urgency}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/trace/${selectedTrace.id}`}
                    className="flex-1 rounded-lg bg-chain-active px-4 py-2.5 text-center text-sm font-medium text-bg-deep transition-all hover:shadow-lg hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    View Full Trace
                  </Link>
                  <button
                    onClick={() => setSelectedTrace(null)}
                    className="rounded-lg border border-chain-connection/20 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}
