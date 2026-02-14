"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";

const PLACEHOLDERS = [
  "My back has been hurting more this week...",
  "I've had headaches since Tuesday...",
  "I feel a crisis coming on...",
  "I've been more tired than usual and my legs ache...",
];

export function TraceInput() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    router.push(`/trace/new?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", bounce: 0.1 }}
      className="w-full"
    >
      {/* Main input container */}
      <div className="relative">
        <div
          className="group relative overflow-hidden rounded-2xl bg-bg-elevated shadow-[0_4px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(245,240,235,0.06)] transition-shadow duration-300 focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_2px_rgba(240,200,122,0.2)]"
        >
          {/* Animated glow on focus */}
          <motion.div
            animate={{
              opacity: isFocused ? 0.1 : 0,
              scale: isFocused ? 1 : 0.95,
            }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chain-active to-transparent"
          />

          <div className="relative p-6">
            {/* Character count */}
            {input.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-6 top-6 text-xs text-text-tertiary"
              >
                {input.length}
              </motion.div>
            )}

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={PLACEHOLDERS[0]}
              className="min-h-[140px] w-full resize-none bg-transparent text-base leading-relaxed text-text-primary placeholder:text-text-tertiary focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            {/* Bottom bar */}
            <div className="mt-4 flex items-end justify-between">
              <motion.p
                animate={{ opacity: isFocused ? 1 : 0.5 }}
                className="text-xs text-text-tertiary"
              >
                {isFocused ? "Press Enter to trace" : "Describe what you're feeling"}
              </motion.p>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isSubmitting}
                  className="shadow-lg"
                >
                  {isSubmitting ? "Tracing..." : "Trace →"}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Border highlight */}
          <motion.div
            animate={{
              opacity: isFocused ? 1 : 0,
              scaleX: isFocused ? 1 : 0,
            }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-chain-active via-chain-active/50 to-transparent"
          />
        </div>

        {/* Quick examples */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Quick examples
          </p>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDERS.slice(1, 3).map((placeholder, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInput(placeholder)}
                className="rounded-lg bg-bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-chain-active/10 hover:text-text-primary"
              >
                {placeholder.split("...")[0]}...
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
