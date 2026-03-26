"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

type Patient = {
  profileId: string;
  userId: string;
  name: string;
  email: string | null;
  genotype: string;
  hbfLevel: string | null;
  linkedAt: string;
  traceCount: number;
  lastTraceDate: string | null;
  lastTraceInput: string | null;
  lastUrgency: string;
};

const URGENCY_COLORS: Record<string, string> = {
  urgent: "bg-accent-warning/10 text-accent-warning border-accent-warning/30",
  discuss: "bg-chain-active/10 text-chain-active border-chain-active/30",
  info: "bg-accent-action/10 text-accent-action border-accent-action/30",
  none: "bg-bg-elevated text-text-tertiary border-chain-connection/20",
};

export default function ProviderPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/provider/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data.patients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = patients;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.genotype.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q),
      );
    }

    if (urgencyFilter !== "all") {
      result = result.filter((p) => p.lastUrgency === urgencyFilter);
    }

    return result;
  }, [patients, search, urgencyFilter]);

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "No traces";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold text-text-primary">Patients</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {patients.length} patient{patients.length !== 1 ? "s" : ""} in your panel
        </p>
      </motion.div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients..."
          className="flex-1 bg-bg-surface border-chain-connection/20 placeholder:text-text-tertiary"
        />
        <div className="flex gap-2">
          {["all", "urgent", "discuss", "info"].map((level) => (
            <button
              key={level}
              onClick={() => setUrgencyFilter(level)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                urgencyFilter === level
                  ? "bg-chain-active/15 text-chain-active"
                  : "bg-bg-surface text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patient list */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-chain-connection/20 bg-bg-surface"
            />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-chain-connection/20 bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">
            {patients.length === 0
              ? "No patients linked to your practice yet."
              : "No patients match your filters."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((patient, i) => (
          <motion.div
            key={patient.profileId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/provider/patients/${patient.userId}`}
              className="flex items-center gap-4 rounded-xl border border-chain-connection/20 bg-bg-surface p-4 transition-colors hover:border-chain-connection/40"
            >
              {/* Avatar placeholder */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-sm font-medium text-text-secondary">
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">
                    {patient.name}
                  </p>
                  <span className="text-xs text-text-tertiary">
                    {patient.genotype}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary truncate">
                  {patient.lastTraceInput
                    ? `Last: "${patient.lastTraceInput}"`
                    : "No traces yet"}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-xs text-text-tertiary">
                  {formatDate(patient.lastTraceDate)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary">
                    {patient.traceCount} trace{patient.traceCount !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                      URGENCY_COLORS[patient.lastUrgency] ?? URGENCY_COLORS.none
                    }`}
                  >
                    {patient.lastUrgency === "none" ? "ok" : patient.lastUrgency}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
