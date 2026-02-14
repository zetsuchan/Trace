"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const GENOTYPES = [
  { value: "HbSS", label: "HbSS (most common)" },
  { value: "HbSC", label: "HbSC" },
  { value: "HbS-beta-thal-plus", label: "HbS/Beta-Thal+" },
  { value: "HbS-beta-thal-zero", label: "HbS/Beta-Thal0" },
];

const COMMON_TRIGGERS = [
  "Cold weather",
  "Dehydration",
  "Stress",
  "Over-exertion",
  "Infection / illness",
  "Poor sleep",
  "High altitude",
  "Menstrual cycle",
];

export function PatientProfileForm() {
  const router = useRouter();
  const [genotype, setGenotype] = useState("");
  const [hbfLevel, setHbfLevel] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  function toggleTrigger(trigger: string) {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Save to DB
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
      {/* Genotype */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">SCD Genotype</legend>
        <div className="grid grid-cols-2 gap-2">
          {GENOTYPES.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGenotype(g.value)}
              className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                genotype === g.value
                  ? "bg-chain-active/20 text-chain-active shadow-[0_0_0_1px_var(--color-chain-active)]"
                  : "bg-bg-elevated text-text-secondary shadow-[0_0_0_1px_rgba(245,240,235,0.06)] hover:text-text-primary"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* HbF Level */}
      <div>
        <label htmlFor="hbf" className="mb-2 block text-sm font-medium">
          Fetal Hemoglobin Level (%)
          <span className="ml-1 text-text-tertiary">optional</span>
        </label>
        <input
          id="hbf"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={hbfLevel}
          onChange={(e) => setHbfLevel(e.target.value)}
          placeholder="e.g., 12.5"
          className="w-full rounded-lg bg-bg-elevated px-3 py-2.5 text-base text-text-primary placeholder:text-text-tertiary shadow-[0_0_0_1px_rgba(245,240,235,0.06)] focus:outline-none focus:shadow-[0_0_0_2px_var(--color-chain-active)]"
        />
      </div>

      {/* Known Triggers */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Known Triggers</legend>
        <div className="flex flex-wrap gap-2">
          {COMMON_TRIGGERS.map((trigger) => (
            <button
              key={trigger}
              type="button"
              onClick={() => toggleTrigger(trigger)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                selectedTriggers.includes(trigger)
                  ? "bg-chain-active/20 text-chain-active"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              {trigger}
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={!genotype} className="w-full">
        Continue
      </Button>
    </form>
  );
}
