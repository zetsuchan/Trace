"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: "PDF" | "CSV" | "TXT" | "JSON";
  uploadedAt: Date;
}

interface PersonalBaseline {
  metric: string;
  avgValue: number | null;
  stdDev: number | null;
  minNormal: number | null;
  maxNormal: number | null;
}

interface DailyData {
  date: string;
  avgHeartRate: number | null;
  restingHeartRate: number | null;
  hrvSdnn: number | null;
  sleepDurationHours: number | null;
  stepCount: number | null;
  riskScore: number | null;
}

interface HealthSummary {
  totalRecords: number;
  dateRange: { start: string; end: string };
  totalDays: number;
}

interface HealthApiResponse {
  personalBaselines: PersonalBaseline[];
  dailyData: DailyData[];
  summary: HealthSummary;
}

// ─────────────────────────────────────────────
// Fallback Health Data (realistic SCD patient)
// ─────────────────────────────────────────────

// Generate dates going back N days from today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Baselines for this patient
const FALLBACK_BASELINES = {
  restingHR: 67,
  hrv: 58,
  sleepHours: 7.1,
  dailySteps: 7800,
};

// Current values (showing deviation — patient is trending toward a crisis)
const FALLBACK_CURRENT = {
  restingHR: 74,
  hrv: 42,
  sleepHours: 6.2,
  dailySteps: 4200,
};

// 30-day resting heart rate data (bpm) — gradual upward drift with a spike around day 10-14
const FALLBACK_HR_30D = [
  { date: daysAgo(29), value: 66 }, { date: daysAgo(28), value: 67 },
  { date: daysAgo(27), value: 65 }, { date: daysAgo(26), value: 68 },
  { date: daysAgo(25), value: 67 }, { date: daysAgo(24), value: 69 },
  { date: daysAgo(23), value: 70 }, { date: daysAgo(22), value: 68 },
  { date: daysAgo(21), value: 71 }, { date: daysAgo(20), value: 69 },
  { date: daysAgo(19), value: 72 }, { date: daysAgo(18), value: 74 },
  { date: daysAgo(17), value: 76 }, { date: daysAgo(16), value: 78 },
  { date: daysAgo(15), value: 77 }, { date: daysAgo(14), value: 80 },
  { date: daysAgo(13), value: 79 }, { date: daysAgo(12), value: 76 },
  { date: daysAgo(11), value: 74 }, { date: daysAgo(10), value: 73 },
  { date: daysAgo(9), value: 72 },  { date: daysAgo(8), value: 74 },
  { date: daysAgo(7), value: 73 },  { date: daysAgo(6), value: 75 },
  { date: daysAgo(5), value: 74 },  { date: daysAgo(4), value: 76 },
  { date: daysAgo(3), value: 75 },  { date: daysAgo(2), value: 73 },
  { date: daysAgo(1), value: 74 },  { date: daysAgo(0), value: 74 },
];

// 30-day HRV (SDNN ms) — declining trend reflects autonomic stress
const FALLBACK_HRV_30D = [
  { date: daysAgo(29), value: 60 }, { date: daysAgo(28), value: 58 },
  { date: daysAgo(27), value: 62 }, { date: daysAgo(26), value: 57 },
  { date: daysAgo(25), value: 59 }, { date: daysAgo(24), value: 55 },
  { date: daysAgo(23), value: 54 }, { date: daysAgo(22), value: 56 },
  { date: daysAgo(21), value: 52 }, { date: daysAgo(20), value: 53 },
  { date: daysAgo(19), value: 50 }, { date: daysAgo(18), value: 47 },
  { date: daysAgo(17), value: 44 }, { date: daysAgo(16), value: 40 },
  { date: daysAgo(15), value: 38 }, { date: daysAgo(14), value: 36 },
  { date: daysAgo(13), value: 37 }, { date: daysAgo(12), value: 40 },
  { date: daysAgo(11), value: 42 }, { date: daysAgo(10), value: 44 },
  { date: daysAgo(9), value: 43 },  { date: daysAgo(8), value: 41 },
  { date: daysAgo(7), value: 42 },  { date: daysAgo(6), value: 40 },
  { date: daysAgo(5), value: 43 },  { date: daysAgo(4), value: 41 },
  { date: daysAgo(3), value: 42 },  { date: daysAgo(2), value: 44 },
  { date: daysAgo(1), value: 43 },  { date: daysAgo(0), value: 42 },
];

// 14-day sleep hours
const FALLBACK_SLEEP_14D = [
  { date: daysAgo(13), value: 7.3 }, { date: daysAgo(12), value: 6.8 },
  { date: daysAgo(11), value: 7.1 }, { date: daysAgo(10), value: 5.5 },
  { date: daysAgo(9), value: 6.4 },  { date: daysAgo(8), value: 5.9 },
  { date: daysAgo(7), value: 7.2 },  { date: daysAgo(6), value: 6.0 },
  { date: daysAgo(5), value: 5.8 },  { date: daysAgo(4), value: 6.5 },
  { date: daysAgo(3), value: 6.1 },  { date: daysAgo(2), value: 5.7 },
  { date: daysAgo(1), value: 6.4 },  { date: daysAgo(0), value: 6.2 },
];

// 28-day risk scores (0-1 composite from HR + HRV + sleep deviations)
const FALLBACK_RISK_28D = [
  0.15, 0.18, 0.12, 0.22, 0.20, 0.28, 0.32, // week 1 — mostly low
  0.35, 0.40, 0.48, 0.55, 0.62, 0.70, 0.75, // week 2 — escalating
  0.72, 0.78, 0.80, 0.68, 0.60, 0.55, 0.50, // week 3 — peak then easing
  0.48, 0.52, 0.55, 0.50, 0.58, 0.53, 0.55, // week 4 — moderate plateau
];

// ─────────────────────────────────────────────
// API data → chart format transformers
// ─────────────────────────────────────────────

function getBaselineValue(baselines: PersonalBaseline[], metric: string): number | null {
  const entry = baselines.find((b) => b.metric === metric);
  return entry?.avgValue ?? null;
}

function transformDailyToHR(daily: DailyData[]): { date: string; value: number }[] {
  return daily
    .filter((d) => d.restingHeartRate != null)
    .map((d) => ({ date: d.date, value: d.restingHeartRate! }));
}

function transformDailyToHRV(daily: DailyData[]): { date: string; value: number }[] {
  return daily
    .filter((d) => d.hrvSdnn != null)
    .map((d) => ({ date: d.date, value: d.hrvSdnn! }));
}

function transformDailyToSleep(daily: DailyData[]): { date: string; value: number }[] {
  return daily
    .filter((d) => d.sleepDurationHours != null)
    .map((d) => ({ date: d.date, value: Math.round(d.sleepDurationHours! * 10) / 10 }))
    .slice(-14);
}

function transformDailyToRisk(daily: DailyData[]): number[] {
  return daily
    .filter((d) => d.riskScore != null)
    .map((d) => d.riskScore!)
    .slice(-28);
}

// ─────────────────────────────────────────────
// Upload helpers
// ─────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  PDF: "bg-red-500/15 text-red-400",
  CSV: "bg-green-500/15 text-green-400",
  TXT: "bg-blue-500/15 text-blue-400",
  JSON: "bg-purple-500/15 text-purple-400",
};

const ACCEPTED_TYPES: Record<string, UploadedFile["type"]> = {
  "application/pdf": "PDF",
  "text/csv": "CSV",
  "text/plain": "TXT",
  "application/json": "JSON",
};

const ACCEPTED_EXTENSIONS: Record<string, UploadedFile["type"]> = {
  pdf: "PDF",
  csv: "CSV",
  txt: "TXT",
  json: "JSON",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFileType(file: File): UploadedFile["type"] | null {
  const mimeType = ACCEPTED_TYPES[file.type];
  if (mimeType) return mimeType;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && ext in ACCEPTED_EXTENSIONS) return ACCEPTED_EXTENSIONS[ext];
  return null;
}

// ─────────────────────────────────────────────
// Chart helpers
// ─────────────────────────────────────────────

function buildLinePath(
  data: { value: number }[],
  width: number,
  height: number,
  padding: { top: number; bottom: number; left: number; right: number },
  minVal: number,
  maxVal: number
): string {
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const range = maxVal - minVal || 1;

  return data
    .map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * plotW;
      const y = padding.top + plotH - ((d.value - minVal) / range) * plotH;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function getRiskColor(score: number): string {
  if (score < 0.25) return "#7CB89E"; // green — low
  if (score < 0.5) return "#F0C87A";  // yellow — moderate
  if (score < 0.7) return "#E8A87C";  // orange — elevated
  return "#D4786A";                    // red — high
}

function getRiskLabel(score: number): string {
  if (score < 0.25) return "Low";
  if (score < 0.5) return "Moderate";
  if (score < 0.7) return "Elevated";
  return "High";
}

// ─────────────────────────────────────────────
// Baseline card status helpers
// ─────────────────────────────────────────────

type CardStatus = "normal" | "borderline" | "concerning";

function getHRStatus(current: number, baseline: number): CardStatus {
  const delta = current - baseline;
  if (delta <= 3) return "normal";
  if (delta <= 8) return "borderline";
  return "concerning";
}

function getHRVStatus(current: number, baseline: number): CardStatus {
  const delta = baseline - current; // lower is worse
  if (delta <= 5) return "normal";
  if (delta <= 12) return "borderline";
  return "concerning";
}

function getSleepStatus(current: number, baseline: number): CardStatus {
  const delta = baseline - current;
  if (delta <= 0.3) return "normal";
  if (delta <= 0.8) return "borderline";
  return "concerning";
}

function getStepsStatus(current: number, baseline: number): CardStatus {
  const ratio = current / baseline;
  if (ratio >= 0.85) return "normal";
  if (ratio >= 0.65) return "borderline";
  return "concerning";
}

const STATUS_BORDER: Record<CardStatus, string> = {
  normal: "border-accent-safe/60",
  borderline: "border-chain-active/60",
  concerning: "border-accent-warning/60",
};

const STATUS_BG: Record<CardStatus, string> = {
  normal: "bg-accent-safe/5",
  borderline: "bg-chain-active/5",
  concerning: "bg-accent-warning/5",
};

const DELTA_COLOR: Record<CardStatus, string> = {
  normal: "text-accent-safe",
  borderline: "text-chain-active",
  concerning: "text-accent-warning",
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function AnalyticsPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── API data state ───
  const [apiData, setApiData] = useState<HealthApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: HealthApiResponse = await res.json();
        setApiData(data);
      } catch (err) {
        console.error("Failed to fetch health data, using fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHealth();
  }, []);

  // ─── Derive chart data from API or fallback ───
  const hasApiDaily = (apiData?.dailyData?.length ?? 0) > 0;

  const BASELINES = useMemo(() => {
    if (!apiData?.personalBaselines?.length) return FALLBACK_BASELINES;
    return {
      restingHR: getBaselineValue(apiData.personalBaselines, "resting_heart_rate") ?? FALLBACK_BASELINES.restingHR,
      hrv: getBaselineValue(apiData.personalBaselines, "hrv") ?? FALLBACK_BASELINES.hrv,
      sleepHours: getBaselineValue(apiData.personalBaselines, "sleep") ?? FALLBACK_BASELINES.sleepHours,
      dailySteps: getBaselineValue(apiData.personalBaselines, "step_count") ?? FALLBACK_BASELINES.dailySteps,
    };
  }, [apiData]);

  const hrData = useMemo(() => {
    if (!hasApiDaily) return FALLBACK_HR_30D;
    const transformed = transformDailyToHR(apiData!.dailyData);
    return transformed.length > 0 ? transformed : FALLBACK_HR_30D;
  }, [apiData, hasApiDaily]);

  const hrvData = useMemo(() => {
    if (!hasApiDaily) return FALLBACK_HRV_30D;
    const transformed = transformDailyToHRV(apiData!.dailyData);
    return transformed.length > 0 ? transformed : FALLBACK_HRV_30D;
  }, [apiData, hasApiDaily]);

  const sleepData = useMemo(() => {
    if (!hasApiDaily) return FALLBACK_SLEEP_14D;
    const transformed = transformDailyToSleep(apiData!.dailyData);
    return transformed.length > 0 ? transformed : FALLBACK_SLEEP_14D;
  }, [apiData, hasApiDaily]);

  const riskData = useMemo(() => {
    if (!hasApiDaily) return FALLBACK_RISK_28D;
    const transformed = transformDailyToRisk(apiData!.dailyData);
    return transformed.length >= 7 ? transformed : FALLBACK_RISK_28D;
  }, [apiData, hasApiDaily]);

  const CURRENT = useMemo(() => {
    if (!hasApiDaily) return FALLBACK_CURRENT;
    const latest = apiData!.dailyData[apiData!.dailyData.length - 1];
    return {
      restingHR: latest.restingHeartRate ?? FALLBACK_CURRENT.restingHR,
      hrv: latest.hrvSdnn ?? FALLBACK_CURRENT.hrv,
      sleepHours: latest.sleepDurationHours ?? FALLBACK_CURRENT.sleepHours,
      dailySteps: latest.stepCount ?? FALLBACK_CURRENT.dailySteps,
    };
  }, [apiData, hasApiDaily]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = getFileType(file);
      if (!fileType) continue;
      newFiles.push({
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: fileType,
        uploadedAt: new Date(),
      });
    }
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ─── SVG chart dimensions ───
  const chartW = 720;
  const chartH = 220;
  const pad = { top: 20, bottom: 30, left: 45, right: 15 };

  // ─── Heart rate chart data ───
  const hrMinMax = useMemo(() => {
    const vals = hrData.map((d) => d.value);
    return { min: Math.min(...vals) - 4, max: Math.max(...vals) + 4 };
  }, [hrData]);
  const hrPath = useMemo(
    () => buildLinePath(hrData, chartW, chartH, pad, hrMinMax.min, hrMinMax.max),
    [hrData, hrMinMax]
  );
  const hrBaselineY = useMemo(() => {
    const plotH = chartH - pad.top - pad.bottom;
    const range = hrMinMax.max - hrMinMax.min;
    return pad.top + plotH - ((BASELINES.restingHR - hrMinMax.min) / range) * plotH;
  }, [hrMinMax, BASELINES]);

  // ─── HRV chart data ───
  const hrvMinMax = useMemo(() => {
    const vals = hrvData.map((d) => d.value);
    return { min: Math.min(...vals) - 4, max: Math.max(...vals) + 4 };
  }, [hrvData]);
  const hrvPath = useMemo(
    () => buildLinePath(hrvData, chartW, chartH, pad, hrvMinMax.min, hrvMinMax.max),
    [hrvData, hrvMinMax]
  );
  const hrvBaselineY = useMemo(() => {
    const plotH = chartH - pad.top - pad.bottom;
    const range = hrvMinMax.max - hrvMinMax.min;
    return pad.top + plotH - ((BASELINES.hrv - hrvMinMax.min) / range) * plotH;
  }, [hrvMinMax, BASELINES]);

  // ─── Baseline cards config ───
  const baselineCards = [
    {
      label: "Resting Heart Rate",
      unit: "bpm",
      current: CURRENT.restingHR,
      baseline: BASELINES.restingHR,
      delta: CURRENT.restingHR - BASELINES.restingHR,
      deltaSign: "+",
      arrowUp: true,
      status: getHRStatus(CURRENT.restingHR, BASELINES.restingHR),
    },
    {
      label: "HRV (SDNN)",
      unit: "ms",
      current: CURRENT.hrv,
      baseline: BASELINES.hrv,
      delta: BASELINES.hrv - CURRENT.hrv,
      deltaSign: "-",
      arrowUp: false,
      status: getHRVStatus(CURRENT.hrv, BASELINES.hrv),
    },
    {
      label: "Sleep Duration",
      unit: "hrs",
      current: CURRENT.sleepHours,
      baseline: BASELINES.sleepHours,
      delta: +(BASELINES.sleepHours - CURRENT.sleepHours).toFixed(1),
      deltaSign: "-",
      arrowUp: false,
      status: getSleepStatus(CURRENT.sleepHours, BASELINES.sleepHours),
    },
    {
      label: "Daily Steps",
      unit: "",
      current: CURRENT.dailySteps.toLocaleString(),
      baseline: BASELINES.dailySteps.toLocaleString(),
      delta: (BASELINES.dailySteps - CURRENT.dailySteps).toLocaleString(),
      deltaSign: "-",
      arrowUp: false,
      status: getStepsStatus(CURRENT.dailySteps, BASELINES.dailySteps),
    },
  ];

  // ─── Risk calendar weeks ───
  const riskWeeks = useMemo(() => {
    // Pad riskData to exactly 28 entries if shorter
    const padded = riskData.length >= 28
      ? riskData.slice(-28)
      : [...Array(28 - riskData.length).fill(0), ...riskData];

    const weeks: { date: string; score: number }[][] = [];
    for (let w = 0; w < 4; w++) {
      const week: { date: string; score: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d;
        week.push({ date: daysAgo(27 - idx), score: padded[idx] });
      }
      weeks.push(week);
    }
    return weeks;
  }, [riskData]);

  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ─── Y-axis tick generation ───
  function yTicks(min: number, max: number, count: number) {
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(min + i * step));
  }

  const hrTicks = yTicks(hrMinMax.min, hrMinMax.max, 5);
  const hrvTicks = yTicks(hrvMinMax.min, hrvMinMax.max, 5);

  // ─── Loading skeleton ───
  if (isLoading) {
    return (
      <div className="flex flex-col gap-12 pb-20">
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-text-primary">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Loading health metrics...</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-chain-connection/10 bg-bg-elevated" />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl border border-chain-connection/10 bg-bg-elevated" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-text-primary">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Health metrics and risk trends from Apple Health data
        </p>
        {apiData?.summary && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated px-3 py-1 border border-chain-connection/10">
              {apiData.summary.totalRecords.toLocaleString()} records
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated px-3 py-1 border border-chain-connection/10">
              {apiData.summary.dateRange.start} to {apiData.summary.dateRange.end}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated px-3 py-1 border border-chain-connection/10">
              {apiData.summary.totalDays} days of data
            </span>
            {!hasApiDaily && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-chain-active/10 text-chain-active px-3 py-1 border border-chain-active/20">
                Showing sample data — import health records to see your metrics
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* ═══════ Upload Section ═══════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop files or click to upload. Accepts PDF, CSV, TXT, and JSON files."
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isDragging
              ? "border-chain-active bg-chain-active/10"
              : "border-chain-connection/30 bg-bg-elevated/50 hover:border-chain-connection/50 hover:bg-bg-elevated"
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-text-primary">Drop files or click to upload</p>
            <p className="mt-1 text-xs text-text-tertiary">Accepts .pdf, .csv, .txt, .json</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.csv,.txt,.json"
          multiple
          className="hidden"
          aria-hidden="true"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
      </motion.div>

      {/* Uploaded files list */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Uploaded Files</h2>
            <div className="grid gap-3" role="list" aria-label="Uploaded files">
              <AnimatePresence>
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    role="listitem"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="group flex items-center justify-between rounded-xl border border-chain-connection/10 bg-bg-elevated p-4 transition-all hover:border-chain-connection/30"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${TYPE_COLORS[file.type]}`}>
                        {file.type}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{file.name}</p>
                        <p className="text-xs text-text-tertiary">{formatFileSize(file.size)} · {formatDate(file.uploadedAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      aria-label={`Remove ${file.name}`}
                      className="rounded-lg p-2 text-text-tertiary opacity-0 transition-all hover:bg-bg-surface hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ 1. Personal Baseline Dashboard ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Personal Baseline</h2>
          <p className="mt-1 text-sm text-text-tertiary">Current readings vs. your established baseline</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="list" aria-label="Baseline metrics">
          {baselineCards.map((card, index) => (
            <motion.div
              key={card.label}
              role="listitem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <Card className={`border-2 ${STATUS_BORDER[card.status]} ${STATUS_BG[card.status]}`}>
                <CardHeader className="pb-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-text-tertiary">
                    {card.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-text-primary">
                      {card.current}
                    </span>
                    <span className="text-sm text-text-tertiary">{card.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-tertiary">
                      Baseline: {card.baseline} {card.unit}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${DELTA_COLOR[card.status]}`}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={card.arrowUp ? "" : "rotate-180"}
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    <span>{card.deltaSign}{card.delta} {card.unit}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══════ 2. Heart Rate Trend (SVG) ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="border-chain-connection/10 bg-bg-elevated overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-text-primary">Heart Rate Trend</CardTitle>
            <p className="text-xs text-text-tertiary">Resting HR over past 30 days (bpm)</p>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full"
                style={{ minWidth: 480 }}
                role="img"
                aria-label="Heart rate trend line chart showing 30 days of data"
              >
                {/* Y-axis grid lines and labels */}
                {hrTicks.map((tick) => {
                  const plotH = chartH - pad.top - pad.bottom;
                  const range = hrMinMax.max - hrMinMax.min;
                  const y = pad.top + plotH - ((tick - hrMinMax.min) / range) * plotH;
                  return (
                    <g key={tick}>
                      <line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} stroke="var(--color-chain-connection)" strokeOpacity="0.2" strokeWidth="1" />
                      <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="var(--color-text-tertiary)" fontSize="10" fontFamily="inherit">
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels (every 5th point) */}
                {hrData.filter((_, i) => i % 5 === 0).map((d, i) => {
                  const plotW = chartW - pad.left - pad.right;
                  const idx = i * 5;
                  const x = pad.left + (idx / (hrData.length - 1)) * plotW;
                  return (
                    <text key={d.date} x={x} y={chartH - 8} textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="10" fontFamily="inherit">
                      {shortDate(d.date)}
                    </text>
                  );
                })}

                {/* Baseline reference line */}
                <line
                  x1={pad.left}
                  y1={hrBaselineY}
                  x2={chartW - pad.right}
                  y2={hrBaselineY}
                  stroke="var(--color-accent-safe)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  strokeOpacity="0.6"
                />
                <text x={chartW - pad.right + 4} y={hrBaselineY + 3} fill="var(--color-accent-safe)" fontSize="9" fontFamily="inherit" opacity="0.8">
                  baseline
                </text>

                {/* Data line */}
                <path
                  d={hrPath}
                  fill="none"
                  stroke="var(--color-chain-symptom)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {hrData.map((d, i) => {
                  const plotW = chartW - pad.left - pad.right;
                  const plotH = chartH - pad.top - pad.bottom;
                  const range = hrMinMax.max - hrMinMax.min;
                  const x = pad.left + (i / (hrData.length - 1)) * plotW;
                  const y = pad.top + plotH - ((d.value - hrMinMax.min) / range) * plotH;
                  return (
                    <circle
                      key={d.date}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="var(--color-bg-elevated)"
                      stroke="var(--color-chain-symptom)"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════ 3. HRV Trend (SVG) ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="border-chain-connection/10 bg-bg-elevated overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-text-primary">HRV Trend</CardTitle>
            <p className="text-xs text-text-tertiary">Heart Rate Variability (SDNN) over past 30 days (ms) — lower values indicate autonomic stress</p>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full"
                style={{ minWidth: 480 }}
                role="img"
                aria-label="HRV trend line chart showing 30 days of data"
              >
                {/* Y-axis grid lines and labels */}
                {hrvTicks.map((tick) => {
                  const plotH = chartH - pad.top - pad.bottom;
                  const range = hrvMinMax.max - hrvMinMax.min;
                  const y = pad.top + plotH - ((tick - hrvMinMax.min) / range) * plotH;
                  return (
                    <g key={tick}>
                      <line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} stroke="var(--color-chain-connection)" strokeOpacity="0.2" strokeWidth="1" />
                      <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="var(--color-text-tertiary)" fontSize="10" fontFamily="inherit">
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {hrvData.filter((_, i) => i % 5 === 0).map((d, i) => {
                  const plotW = chartW - pad.left - pad.right;
                  const idx = i * 5;
                  const x = pad.left + (idx / (hrvData.length - 1)) * plotW;
                  return (
                    <text key={d.date} x={x} y={chartH - 8} textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="10" fontFamily="inherit">
                      {shortDate(d.date)}
                    </text>
                  );
                })}

                {/* Baseline reference line */}
                <line
                  x1={pad.left}
                  y1={hrvBaselineY}
                  x2={chartW - pad.right}
                  y2={hrvBaselineY}
                  stroke="var(--color-accent-safe)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  strokeOpacity="0.6"
                />
                <text x={chartW - pad.right + 4} y={hrvBaselineY + 3} fill="var(--color-accent-safe)" fontSize="9" fontFamily="inherit" opacity="0.8">
                  baseline
                </text>

                {/* Data line */}
                <path
                  d={hrvPath}
                  fill="none"
                  stroke="var(--color-chain-root)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {hrvData.map((d, i) => {
                  const plotW = chartW - pad.left - pad.right;
                  const plotH = chartH - pad.top - pad.bottom;
                  const range = hrvMinMax.max - hrvMinMax.min;
                  const x = pad.left + (i / (hrvData.length - 1)) * plotW;
                  const y = pad.top + plotH - ((d.value - hrvMinMax.min) / range) * plotH;
                  return (
                    <circle
                      key={d.date}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="var(--color-bg-elevated)"
                      stroke="var(--color-chain-root)"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════ 4. Sleep Duration (SVG Bar Chart) ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="border-chain-connection/10 bg-bg-elevated overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-text-primary">Sleep Duration</CardTitle>
            <p className="text-xs text-text-tertiary">Nightly sleep hours — past 14 days</p>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full"
                style={{ minWidth: 480 }}
                role="img"
                aria-label="Sleep duration bar chart showing 14 days of data"
              >
                {(() => {
                  const sleepPad = { top: 15, bottom: 30, left: 45, right: 15 };
                  const plotW = chartW - sleepPad.left - sleepPad.right;
                  const plotH = chartH - sleepPad.top - sleepPad.bottom;
                  const maxSleep = 9;
                  const barGap = 8;
                  const barW = (plotW - barGap * (sleepData.length - 1)) / sleepData.length;

                  // Y-axis ticks
                  const sleepTicks = [0, 3, 6, 7, 9];

                  return (
                    <>
                      {/* Y grid lines */}
                      {sleepTicks.map((tick) => {
                        const y = sleepPad.top + plotH - (tick / maxSleep) * plotH;
                        return (
                          <g key={tick}>
                            <line x1={sleepPad.left} y1={y} x2={chartW - sleepPad.right} y2={y} stroke="var(--color-chain-connection)" strokeOpacity="0.2" strokeWidth="1" />
                            <text x={sleepPad.left - 8} y={y + 4} textAnchor="end" fill="var(--color-text-tertiary)" fontSize="10" fontFamily="inherit">
                              {tick}h
                            </text>
                          </g>
                        );
                      })}

                      {/* 7-hour threshold line */}
                      {(() => {
                        const y7 = sleepPad.top + plotH - (7 / maxSleep) * plotH;
                        return (
                          <line x1={sleepPad.left} y1={y7} x2={chartW - sleepPad.right} y2={y7} stroke="var(--color-accent-safe)" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.4" />
                        );
                      })()}

                      {/* Bars */}
                      {sleepData.map((d, i) => {
                        const x = sleepPad.left + i * (barW + barGap);
                        const h = (d.value / maxSleep) * plotH;
                        const y = sleepPad.top + plotH - h;
                        const color =
                          d.value >= 7 ? "var(--color-accent-safe)" :
                          d.value >= 6 ? "var(--color-chain-active)" :
                          "var(--color-accent-warning)";
                        return (
                          <g key={d.date}>
                            <rect
                              x={x}
                              y={y}
                              width={barW}
                              height={h}
                              rx="4"
                              fill={color}
                              fillOpacity="0.7"
                            />
                            {/* Value on top */}
                            <text
                              x={x + barW / 2}
                              y={y - 4}
                              textAnchor="middle"
                              fill="var(--color-text-secondary)"
                              fontSize="9"
                              fontFamily="inherit"
                            >
                              {d.value}
                            </text>
                            {/* X label */}
                            <text
                              x={x + barW / 2}
                              y={chartH - 8}
                              textAnchor="middle"
                              fill="var(--color-text-tertiary)"
                              fontSize="9"
                              fontFamily="inherit"
                            >
                              {shortDate(d.date).split(" ")[1]}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "var(--color-accent-safe)" }} /> 7+ hrs</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "var(--color-chain-active)" }} /> 6-7 hrs</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "var(--color-accent-warning)" }} /> &lt;6 hrs</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════ 5. Risk Score Calendar ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="border-chain-connection/10 bg-bg-elevated">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-text-primary">Risk Score Calendar</CardTitle>
            <p className="text-xs text-text-tertiary">
              Composite crisis risk over the past 4 weeks — derived from HR, HRV, and sleep deviations
            </p>
          </CardHeader>
          <CardContent>
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDayLabels.map((label) => (
                <div key={label} className="text-center text-[10px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex flex-col gap-2">
              {riskWeeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-2">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className="relative aspect-square rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105"
                      style={{ backgroundColor: getRiskColor(day.score), opacity: 0.85 }}
                      title={`${shortDate(day.date)}: ${getRiskLabel(day.score)} risk (${Math.round(day.score * 100)}%)`}
                    >
                      <span className="text-[10px] font-bold text-bg-deep/80">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#7CB89E" }} /> Low</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#F0C87A" }} /> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#E8A87C" }} /> Elevated</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#D4786A" }} /> High</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
