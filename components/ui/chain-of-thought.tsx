"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "active" | "complete";

interface ChainOfThoughtStep {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
  icon?: string;
  results?: { label: string; url?: string }[];
}

interface ChainOfThoughtProps {
  title?: string;
  steps: ChainOfThoughtStep[];
  defaultOpen?: boolean;
  className?: string;
}

const STATUS_ICONS: Record<StepStatus, React.ReactNode> = {
  pending: (
    <div className="h-2.5 w-2.5 rounded-full border-2 border-muted-foreground/40" aria-label="Pending" role="img" />
  ),
  active: (
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(240,200,122,0.6)]"
      aria-label="In progress"
      role="img"
    />
  ),
  complete: (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-safe text-[8px] text-bg-deep"
      aria-label="Complete"
      role="img"
    >
      <span aria-hidden="true">✓</span>
    </motion.div>
  ),
};

export function ChainOfThought({
  title = "Reasoning",
  steps,
  defaultOpen = true,
  className,
}: ChainOfThoughtProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const completedCount = steps.filter((s) => s.status === "complete").length;
  const isAllComplete = completedCount === steps.length;
  const hasActive = steps.some((s) => s.status === "active");

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-xl border border-border bg-card shadow-md overflow-hidden transition-all",
        className,
      )}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/50">
        {/* Brain icon with animation */}
        <div className="relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className={cn(
              "transition-colors",
              hasActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92a1 1 0 0 0-.75.96V12" />
            <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.92a1 1 0 0 1 .75.96V12" />
            <path d="M16 6a4 4 0 0 1 1.71 7.62 1 1 0 0 0-.46.85L17 16" />
            <path d="M8 6a4 4 0 0 0-1.71 7.62 1 1 0 0 1 .46.85L7 16" />
            <path d="M12 12v4" />
            <path d="M7 16h10" />
            <path d="M8 20h8" />
            <path d="M9 24h6" />
          </svg>
          {hasActive && (
            <motion.div
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 -m-1 rounded-full bg-primary/30 blur-sm"
              aria-hidden="true"
            />
          )}
        </div>

        <span className="flex-1 text-sm font-semibold text-card-foreground">
          {title}
        </span>

        {/* Progress indicator */}
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          {hasActive && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xs font-medium text-primary"
            >
              Thinking...
            </motion.span>
          )}
          {isAllComplete && (
            <span className="text-xs font-medium text-accent-safe">Done</span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {completedCount}/{steps.length}
          </span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          >
            <path d="m6 9 6 6 6-6" />
          </motion.svg>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border px-5 py-4">
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-3">
                {/* Vertical line + status indicator */}
                <div className="flex flex-col items-center">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                    {STATUS_ICONS[step.status]}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-px flex-1 min-h-[24px]",
                        step.status === "complete"
                          ? "bg-accent-safe/40"
                          : "bg-border",
                      )}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2">
                        {step.icon && (
                          <span className="text-sm">{step.icon}</span>
                        )}
                        <p
                          className={cn(
                            "text-sm font-medium",
                            step.status === "active"
                              ? "text-card-foreground"
                              : step.status === "complete"
                                ? "text-muted-foreground"
                                : "text-muted-foreground/60",
                          )}
                        >
                          {step.title}
                        </p>
                      </div>

                      {step.description && step.status !== "pending" && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      )}

                      {/* Search results badges */}
                      {step.results && step.results.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5" role="list" aria-label="Related systems">
                          {step.results.map((result, i) => (
                            <li
                              key={i}
                              className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                            >
                              {result.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
