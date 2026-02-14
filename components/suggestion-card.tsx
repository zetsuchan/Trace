"use client";

import type { Suggestion } from "@/lib/types";

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <div className="rounded-xl border-l-4 border-l-accent-action bg-bg-surface p-4 shadow-[0_0_0_1px_rgba(245,240,235,0.06)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-accent-action">&#x1f4a1;</span>
        <div>
          <p className="text-sm text-text-primary">{suggestion.text}</p>
          {suggestion.forDoctor && (
            <p className="mt-1 text-xs text-text-tertiary">
              Add to Visit Card for your doctor
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
