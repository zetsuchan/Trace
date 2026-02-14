"use client";

import { motion } from "motion/react";
import { useState } from "react";

interface TriggerPattern {
  trigger: string;
  frequency: number;
  category: "weather" | "hydration" | "sleep" | "breathing" | "stress" | "activity";
  icon: string;
  lastOccurrence: Date;
}

interface TemporalPattern {
  week: string;
  count: number;
}

interface SystemConnection {
  system: string;
  frequency: number;
  commonPath: string;
}

// Mock insights data
const TRIGGER_PATTERNS: TriggerPattern[] = [
  {
    trigger: "Sinus congestion / breathing impairment",
    frequency: 5,
    category: "breathing",
    icon: "🫁",
    lastOccurrence: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    trigger: "Cold weather / temperature drop",
    frequency: 4,
    category: "weather",
    icon: "🌡️",
    lastOccurrence: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    trigger: "Reduced hydration",
    frequency: 3,
    category: "hydration",
    icon: "💧",
    lastOccurrence: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    trigger: "Poor sleep quality",
    frequency: 3,
    category: "sleep",
    icon: "😴",
    lastOccurrence: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    trigger: "Elevated stress levels",
    frequency: 2,
    category: "stress",
    icon: "😰",
    lastOccurrence: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

const TEMPORAL_PATTERNS: TemporalPattern[] = [
  { week: "Week 1", count: 1 },
  { week: "Week 2", count: 2 },
  { week: "Week 3", count: 3 },
  { week: "Week 4", count: 5 },
];

const SYSTEM_CONNECTIONS: SystemConnection[] = [
  {
    system: "Respiratory → Circulatory",
    frequency: 5,
    commonPath: "Oxygen saturation drop triggers sickling cascade",
  },
  {
    system: "Environmental → Vascular",
    frequency: 4,
    commonPath: "Cold exposure causes vasoconstriction",
  },
  {
    system: "Hydration → Blood",
    frequency: 3,
    commonPath: "Dehydration concentrates blood, increasing viscosity",
  },
];

const CATEGORY_COLORS = {
  breathing: "bg-blue-500",
  weather: "bg-purple-500",
  hydration: "bg-cyan-500",
  sleep: "bg-indigo-500",
  stress: "bg-orange-500",
  activity: "bg-green-500",
};

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTriggers = selectedCategory
    ? TRIGGER_PATTERNS.filter((t) => t.category === selectedCategory)
    : TRIGGER_PATTERNS;

  const maxFrequency = Math.max(...TRIGGER_PATTERNS.map((t) => t.frequency));
  const maxCount = Math.max(...TEMPORAL_PATTERNS.map((t) => t.count));

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-text-primary">
          Insights
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Pattern recognition across {TRIGGER_PATTERNS.reduce((sum, t) => sum + t.frequency, 0)} traces
        </p>
      </motion.div>

      {/* Key Finding - Hero Stat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative overflow-hidden rounded-2xl border-l-4 border-l-chain-active bg-gradient-to-br from-chain-active/10 to-chain-active/5 p-8"
      >
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-chain-active">
            Primary Pattern Detected
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-text-primary">
            Respiratory issues trigger 71% of your crises
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.6] text-text-secondary">
            Sinus congestion and impaired breathing are your most common trigger. Each episode reduces oxygen saturation, initiating a sickling cascade within 2-4 hours.
          </p>
        </div>
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-chain-active/20 blur-3xl" aria-hidden="true" />
      </motion.div>

      {/* Common Triggers */}
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Common Triggers
            </h2>
            <p className="mt-1 text-sm text-text-tertiary">
              Ranked by frequency
            </p>
          </div>
          {/* Category filter */}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              aria-label="Clear category filter"
              className="text-xs text-chain-active hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="grid gap-3">
          {filteredTriggers.map((trigger, index) => (
            <motion.div
              key={trigger.trigger}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.2 + index * 0.05,
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="group relative overflow-hidden rounded-xl border border-chain-connection/10 bg-bg-elevated p-5 transition-all hover:border-chain-connection/30 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                {/* Icon + frequency badge */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl" aria-hidden="true">{trigger.icon}</span>
                  <span className="rounded-full bg-bg-surface px-2 py-0.5 text-xs font-bold tabular-nums text-chain-active">
                    {trigger.frequency}×
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary">
                    {trigger.trigger}
                  </h3>
                  <button
                    onClick={() => setSelectedCategory(trigger.category)}
                    aria-label={`Filter by ${trigger.category}`}
                    aria-pressed={selectedCategory === trigger.category}
                    className="mt-1 rounded px-2 py-0.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {trigger.category}
                  </button>
                  <p className="mt-2 text-xs text-text-tertiary">
                    Last: {formatDate(trigger.lastOccurrence)}
                  </p>
                </div>

                {/* Visual bar */}
                <div className="flex h-full w-32 items-center">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-surface">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(trigger.frequency / maxFrequency) * 100}%` }}
                      transition={{
                        delay: 0.3 + index * 0.05,
                        duration: 0.6,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      className={`h-full ${CATEGORY_COLORS[trigger.category]}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Temporal Pattern - Crisis Frequency Over Time */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Crisis Frequency Trend
          </h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Traces per week over the past month
          </p>
        </div>

        <div className="rounded-xl border border-chain-connection/10 bg-bg-elevated p-8" role="img" aria-label={`Bar chart showing crisis frequency: ${TEMPORAL_PATTERNS.map(w => `${w.week}: ${w.count} traces`).join(', ')}`}>
          <div className="flex h-64 items-end justify-between gap-6" aria-hidden="true">
            {TEMPORAL_PATTERNS.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: 0.4 + index * 0.1,
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="flex flex-1 flex-col items-center gap-3"
                style={{ originY: 1 }}
              >
                {/* Bar */}
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-chain-active to-chain-active/60 transition-all hover:brightness-110"
                    style={{
                      height: `${(week.count / maxCount) * 200}px`,
                    }}
                  />
                  {/* Count label */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold tabular-nums text-text-primary">
                    {week.count}
                  </div>
                </div>
                {/* Week label */}
                <span className="text-xs font-medium text-text-tertiary">
                  {week.week}
                </span>
              </motion.div>
            ))}
          </div>
          {/* Trend indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm"
            role="alert"
          >
            <span className="text-red-400" aria-hidden="true">↗</span>
            <span className="font-medium text-red-400">
              Increasing trend — discuss with your doctor
            </span>
          </motion.div>
        </div>
      </div>

      {/* System Connections */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Cross-System Patterns
          </h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Most common causal pathways
          </p>
        </div>

        <div className="grid gap-4">
          {SYSTEM_CONNECTIONS.map((connection, index) => (
            <motion.div
              key={connection.system}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5 + index * 0.1,
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="rounded-xl border-l-4 border-l-chain-mechanism bg-chain-mechanism/5 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {connection.system}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.5] text-text-secondary">
                    {connection.commonPath}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-bg-surface px-3 py-1 text-sm font-bold tabular-nums text-chain-mechanism">
                  {connection.frequency}×
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="rounded-2xl border-l-4 border-l-accent-action bg-accent-action/5 p-6"
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-accent-action">
          Recommendation
        </p>
        <h3 className="text-xl font-bold leading-[1.2] text-text-primary">
          Consider ENT evaluation for chronic sinus issues
        </h3>
        <p className="mt-3 text-sm leading-[1.6] text-text-secondary">
          Given that respiratory triggers account for 71% of your crises, addressing your sinus congestion could significantly reduce crisis frequency. Discuss with your hematologist about coordinating care with an ENT specialist.
        </p>
      </motion.div>
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
