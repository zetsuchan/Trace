"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import type { Suggestion } from "@/lib/types";

type FlaggedTrace = {
  id: string;
  inputText: string;
  summary: string | null;
  suggestions: Suggestion[];
  createdAt: string;
  patientName: string | null;
  genotype: string | null;
  highestUrgency: "urgent" | "discuss";
};

const URGENCY_STYLES = {
  urgent: {
    badge: "bg-accent-warning/10 text-accent-warning border-accent-warning/30",
    bar: "bg-accent-warning",
  },
  discuss: {
    badge: "bg-chain-active/10 text-chain-active border-chain-active/30",
    bar: "bg-chain-active",
  },
};

export default function ProviderFlagged() {
  const [traces, setTraces] = useState<FlaggedTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "urgent" | "discuss">("all");

  useEffect(() => {
    fetch("/api/provider/flagged")
      .then((res) => res.json())
      .then((data) => setTraces(data.traces || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all"
      ? traces
      : traces.filter((t) => t.highestUrgency === filter);

  const urgentCount = traces.filter((t) => t.highestUrgency === "urgent").length;
  const discussCount = traces.filter((t) => t.highestUrgency === "discuss").length;

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold text-text-primary">
          Flagged Traces
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Traces requiring attention across your patient panel
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-chain-active/15 text-chain-active"
              : "bg-bg-surface text-text-tertiary hover:text-text-secondary"
          }`}
        >
          All ({traces.length})
        </button>
        <button
          onClick={() => setFilter("urgent")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "urgent"
              ? "bg-accent-warning/15 text-accent-warning"
              : "bg-bg-surface text-text-tertiary hover:text-text-secondary"
          }`}
        >
          Urgent ({urgentCount})
        </button>
        <button
          onClick={() => setFilter("discuss")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "discuss"
              ? "bg-chain-active/15 text-chain-active"
              : "bg-bg-surface text-text-tertiary hover:text-text-secondary"
          }`}
        >
          Discuss ({discussCount})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-chain-connection/20 bg-bg-surface"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">
            {traces.length === 0
              ? "No flagged traces. Your patients are doing well."
              : "No traces match this filter."}
          </p>
        </div>
      )}

      {/* Flagged trace list */}
      <div className="space-y-3">
        {filtered.map((trace, i) => {
          const style = URGENCY_STYLES[trace.highestUrgency];
          const flaggedSuggestions = trace.suggestions.filter(
            (s) => s.urgency === "urgent" || s.urgency === "discuss",
          );

          return (
            <motion.div
              key={trace.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={`/trace/${trace.id}`}
                className="relative flex overflow-hidden rounded-xl border border-chain-connection/20 bg-bg-surface transition-colors hover:border-chain-connection/40"
              >
                {/* Urgency indicator bar */}
                <div className={`w-1 shrink-0 ${style.bar}`} />

                <div className="flex flex-1 items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">
                        {trace.patientName ?? "Patient"}
                      </p>
                      {trace.genotype && (
                        <span className="text-xs text-text-tertiary">
                          {trace.genotype}
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${style.badge}`}
                      >
                        {trace.highestUrgency}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-text-secondary">
                      "{trace.inputText}"
                    </p>

                    {/* Flagged suggestions preview */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {flaggedSuggestions.slice(0, 3).map((s, j) => (
                        <span
                          key={j}
                          className="rounded-md bg-bg-elevated px-2 py-1 text-xs text-text-secondary line-clamp-1"
                        >
                          {s.text.length > 60 ? s.text.slice(0, 60) + "..." : s.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="shrink-0 text-xs text-text-tertiary">
                    {timeAgo(trace.createdAt)}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
