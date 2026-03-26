"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import type { Suggestion } from "@/lib/types";

type PatientTrace = {
  id: string;
  inputText: string;
  summary: string | null;
  suggestions: Suggestion[];
  createdAt: string;
};

type PatientDetail = {
  name: string;
  email: string | null;
  genotype: string;
  hbfLevel: string | null;
  baselineSpo2: string | null;
  traces: PatientTrace[];
};

const URGENCY_COLORS: Record<string, string> = {
  urgent: "bg-accent-warning/10 text-accent-warning border-accent-warning/30",
  discuss: "bg-chain-active/10 text-chain-active border-chain-active/30",
  info: "bg-accent-action/10 text-accent-action border-accent-action/30",
};

export default function ProviderPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch patient detail from provider API
    fetch(`/api/provider/patients/${id}`)
      .then((res) => res.json())
      .then((data) => setPatient(data.patient ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function getHighestUrgency(suggestions: Suggestion[]): string {
    if (suggestions?.some((s) => s.urgency === "urgent")) return "urgent";
    if (suggestions?.some((s) => s.urgency === "discuss")) return "discuss";
    return "info";
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-elevated" />
        <div className="h-32 animate-pulse rounded-xl border border-chain-connection/20 bg-bg-surface" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-8 text-center">
        <p className="text-sm text-text-secondary">Patient not found or access denied.</p>
        <Link href="/provider/patients" className="mt-3 inline-block text-sm text-chain-active hover:underline">
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Patient header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <Link
            href="/provider/patients"
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Patients /
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-text-primary">
            {patient.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-3">
            <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs font-medium text-text-secondary">
              {patient.genotype}
            </span>
            {patient.hbfLevel && (
              <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-tertiary">
                HbF: {patient.hbfLevel}%
              </span>
            )}
            {patient.baselineSpo2 && (
              <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-tertiary">
                SpO2 baseline: {patient.baselineSpo2}%
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-4">
          <p className="text-xs text-text-tertiary">Total Traces</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {patient.traces.length}
          </p>
        </div>
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-4">
          <p className="text-xs text-text-tertiary">Urgent</p>
          <p className="mt-1 text-2xl font-semibold text-accent-warning">
            {patient.traces.filter((t) => getHighestUrgency(t.suggestions) === "urgent").length}
          </p>
        </div>
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-4">
          <p className="text-xs text-text-tertiary">Discuss</p>
          <p className="mt-1 text-2xl font-semibold text-chain-active">
            {patient.traces.filter((t) => getHighestUrgency(t.suggestions) === "discuss").length}
          </p>
        </div>
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-4">
          <p className="text-xs text-text-tertiary">Last Trace</p>
          <p className="mt-1 text-sm font-medium text-text-primary">
            {patient.traces.length > 0
              ? new Date(patient.traces[0].createdAt).toLocaleDateString()
              : "—"}
          </p>
        </div>
      </div>

      {/* Trace history */}
      <div>
        <h2 className="text-lg font-medium text-text-primary">Trace History</h2>
        <div className="mt-4 space-y-3">
          {patient.traces.length === 0 && (
            <p className="text-sm text-text-tertiary">No traces yet.</p>
          )}
          {patient.traces.map((trace, i) => {
            const urgency = getHighestUrgency(trace.suggestions);
            return (
              <motion.div
                key={trace.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/trace/${trace.id}`}
                  className="block rounded-xl border border-chain-connection/20 bg-bg-surface p-4 transition-colors hover:border-chain-connection/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary">{trace.inputText}</p>
                      {trace.summary && (
                        <p className="mt-1 text-xs text-text-tertiary line-clamp-2">
                          {trace.summary}
                        </p>
                      )}
                      {/* Suggestions preview */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {trace.suggestions
                          .filter((s) => s.urgency !== "info")
                          .slice(0, 2)
                          .map((s, j) => (
                            <span
                              key={j}
                              className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${
                                URGENCY_COLORS[s.urgency] ?? ""
                              }`}
                            >
                              {s.text.length > 50 ? s.text.slice(0, 50) + "..." : s.text}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-xs text-text-tertiary">
                        {new Date(trace.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                          URGENCY_COLORS[urgency] ?? ""
                        }`}
                      >
                        {urgency}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
