"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuthContext } from "@/components/auth-provider";
import type { Suggestion } from "@/lib/types";

type DashboardData = {
  stats: {
    totalPatients: number;
    tracesThisWeek: number;
    flaggedCount: number;
  };
  recentTraces: Array<{
    id: string;
    inputText: string;
    summary: string | null;
    suggestions: Suggestion[];
    createdAt: string;
    patientName: string | null;
    genotype: string | null;
  }>;
  practiceId: string | null;
};

type SharedTrace = {
  id: string;
  traceId: string;
  patientName: string;
  note: string | null;
  sharedAt: string;
  viewedAt: string | null;
  inputText: string;
  summary: string | null;
  suggestions: Suggestion[];
};

const URGENCY_COLORS = {
  urgent: "bg-accent-warning/10 text-accent-warning border-accent-warning/30",
  discuss: "bg-chain-active/10 text-chain-active border-chain-active/30",
  info: "bg-accent-action/10 text-accent-action border-accent-action/30",
};

export default function ProviderDashboard() {
  const { user } = useAuthContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [shared, setShared] = useState<SharedTrace[]>([]);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/provider/dashboard").then((r) => r.json()),
      fetch("/api/provider/shared").then((r) => r.json()),
    ])
      .then(([dashData, sharedData]) => {
        setData(dashData);
        setShared(sharedData.shared || []);
        setUnviewedCount(sharedData.unviewedCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function markViewed(sharedId: string) {
    await fetch(`/api/provider/shared/${sharedId}/view`, { method: "PATCH" });
    setShared((prev) =>
      prev.map((s) => (s.id === sharedId ? { ...s, viewedAt: new Date().toISOString() } : s)),
    );
    setUnviewedCount((c) => Math.max(0, c - 1));
  }

  function getHighestUrgency(suggestions: Suggestion[]): string {
    if (suggestions?.some((s) => s.urgency === "urgent")) return "urgent";
    if (suggestions?.some((s) => s.urgency === "discuss")) return "discuss";
    return "info";
  }

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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Welcome back, {user?.name || "Provider"}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-chain-connection/20 bg-bg-surface p-5"
        >
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Patients
          </p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">
            {loading ? "—" : data?.stats.totalPatients ?? 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-chain-connection/20 bg-bg-surface p-5"
        >
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Traces This Week
          </p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">
            {loading ? "—" : data?.stats.tracesThisWeek ?? 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-accent-warning/30 bg-accent-warning/5 p-5"
        >
          <Link href="/provider/flagged" className="block">
            <p className="text-xs font-medium text-accent-warning uppercase tracking-wider">
              Flagged
            </p>
            <p className="mt-2 text-3xl font-semibold text-accent-warning">
              {loading ? "—" : data?.stats.flaggedCount ?? 0}
            </p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl border p-5 ${
            unviewedCount > 0
              ? "border-chain-active/30 bg-chain-active/5"
              : "border-chain-connection/20 bg-bg-surface"
          }`}
        >
          <p className={`text-xs font-medium uppercase tracking-wider ${
            unviewedCount > 0 ? "text-chain-active" : "text-text-tertiary"
          }`}>
            Shared with You
          </p>
          <p className={`mt-2 text-3xl font-semibold ${
            unviewedCount > 0 ? "text-chain-active" : "text-text-primary"
          }`}>
            {loading ? "—" : unviewedCount}
          </p>
        </motion.div>
      </div>

      {/* No practice state */}
      {!loading && !data?.practiceId && (
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">
            No practice set up yet.
          </p>
          <Link
            href="/provider/setup"
            className="mt-3 inline-block text-sm font-medium text-chain-active hover:underline"
          >
            Set up your practice
          </Link>
        </div>
      )}

      {/* Shared Traces */}
      {!loading && shared.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-medium text-text-primary">
            Shared with You
            {unviewedCount > 0 && (
              <span className="ml-2 rounded-full bg-chain-active/15 px-2 py-0.5 text-xs font-medium text-chain-active">
                {unviewedCount} new
              </span>
            )}
          </h2>
          <div className="mt-4 space-y-3">
            {shared.filter((s) => !s.viewedAt).slice(0, 5).map((s) => (
              <Link
                key={s.id}
                href={`/trace/${s.traceId}`}
                onClick={() => { if (!s.viewedAt) markViewed(s.id); }}
                className="flex items-start gap-4 rounded-xl border border-chain-active/20 bg-chain-active/5 p-4 transition-colors hover:border-chain-active/40"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">
                      {s.patientName}
                    </p>
                    <span className="rounded-full bg-chain-active/15 px-2 py-0.5 text-[11px] font-medium text-chain-active">
                      Shared
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary truncate">
                    {s.inputText}
                  </p>
                  {s.note && (
                    <p className="mt-1 text-xs text-text-tertiary italic">
                      "{s.note}"
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-text-tertiary">
                  {timeAgo(s.sharedAt)}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {!loading && data && data.recentTraces.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-medium text-text-primary">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {data.recentTraces.map((trace) => {
              const urgency = getHighestUrgency(trace.suggestions);
              return (
                <Link
                  key={trace.id}
                  href={`/trace/${trace.id}`}
                  className="flex items-start gap-4 rounded-xl border border-chain-connection/20 bg-bg-surface p-4 transition-colors hover:border-chain-connection/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {trace.patientName ?? "Patient"}
                      </p>
                      {trace.genotype && (
                        <span className="shrink-0 text-xs text-text-tertiary">
                          {trace.genotype}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary truncate">
                      {trace.inputText}
                    </p>
                    {trace.summary && (
                      <p className="mt-1 text-xs text-text-tertiary line-clamp-1">
                        {trace.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-xs text-text-tertiary">
                      {timeAgo(trace.createdAt)}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${URGENCY_COLORS[urgency as keyof typeof URGENCY_COLORS]}`}
                    >
                      {urgency}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {!loading && data && data.recentTraces.length === 0 && data.practiceId && (
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">
            No traces yet. Activity will appear here as patients use TRACE.
          </p>
        </div>
      )}
    </div>
  );
}
