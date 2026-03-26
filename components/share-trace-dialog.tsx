"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PracticeLink = {
  linkId: string;
  practiceId: string;
  practiceName: string;
  status: string;
};

export function ShareTraceButton({ traceId }: { traceId: string }) {
  const [open, setOpen] = useState(false);
  const [practices, setPractices] = useState<PracticeLink[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "already">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/patient/link-practice")
        .then((res) => res.json())
        .then((data) => {
          const active = (data.links || []).filter((l: PracticeLink) => l.status === "active");
          setPractices(active);
          if (active.length === 1) setSelectedPractice(active[0].practiceId);
        })
        .catch(() => {});
    }
  }, [open]);

  async function handleShare() {
    if (!selectedPractice) return;
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/traces/${traceId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceId: selectedPractice, note: note || undefined }),
      });

      if (res.status === 409) {
        setStatus("already");
      } else if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to share");
        setStatus("error");
      } else {
        setStatus("success");
        setTimeout(() => setOpen(false), 1500);
      }
    } catch {
      setErrorMsg("Something went wrong");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto"
      >
        Share with Doctor
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-chain-connection/20 bg-bg-surface p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-text-primary">
                Share Trace with Your Doctor
              </h3>
              <p className="mt-1 text-xs text-text-secondary">
                Your doctor will see this trace in their dashboard.
              </p>

              {practices.length === 0 ? (
                <div className="mt-6">
                  <p className="text-sm text-text-tertiary">
                    You're not linked to any practice yet.{" "}
                    <a href="/settings/practice" className="text-chain-active underline">
                      Link your practice
                    </a>{" "}
                    first.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {/* Practice selector */}
                  {practices.length > 1 && (
                    <div>
                      <label className="text-xs font-medium text-text-secondary">
                        Select Practice
                      </label>
                      <div className="mt-2 space-y-2">
                        {practices.map((p) => (
                          <button
                            key={p.practiceId}
                            onClick={() => setSelectedPractice(p.practiceId)}
                            className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                              selectedPractice === p.practiceId
                                ? "border-chain-active bg-chain-active/10 text-text-primary"
                                : "border-chain-connection/20 text-text-secondary hover:border-chain-connection/40"
                            }`}
                          >
                            {p.practiceName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {practices.length === 1 && (
                    <p className="text-sm text-text-secondary">
                      Sharing with <span className="font-medium text-text-primary">{practices[0].practiceName}</span>
                    </p>
                  )}

                  {/* Optional note */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary">
                      Add a note (optional)
                    </label>
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Started feeling this before my Thursday appointment"
                      className="mt-1.5 bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                    />
                  </div>

                  {/* Status messages */}
                  {status === "success" && (
                    <p className="text-xs text-accent-action font-medium">
                      Shared successfully. Your doctor will see this trace.
                    </p>
                  )}
                  {status === "already" && (
                    <p className="text-xs text-chain-active">
                      Already shared with this practice.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-xs text-accent-warning">{errorMsg}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => setOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleShare}
                      disabled={!selectedPractice || loading || status === "success"}
                      className="flex-1"
                    >
                      {loading ? "Sharing..." : "Share"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
