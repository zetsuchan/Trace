"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChainNode } from "@/components/chain-node";
import type { CausalChain, ChainConnection } from "@/lib/types";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Peeling Layers
 *
 *    0ms   Chain label fades in
 *  300ms   First node (symptom) scales in — LARGE, active
 *          "Tap to trace deeper" prompt visible below
 *
 * [User taps]
 *    0ms   Active node compresses upward → becomes a pill
 *  150ms   Connection line + mechanism text draws down
 *  350ms   Next node scales in large
 *
 * [User taps for root cause]
 *    0ms   Previous node compresses
 *  150ms   Connection draws
 *  350ms   Beat — 150ms pause
 *  500ms   Root cause enters with glow, slower spring
 *  900ms   "Trace complete" state
 * ───────────────────────────────────────────────────────── */

const SPRING = {
  node: { type: "spring" as const, visualDuration: 0.45, bounce: 0.15 },
  compress: { type: "spring" as const, visualDuration: 0.35, bounce: 0.08 },
  rootReveal: { type: "spring" as const, visualDuration: 0.7, bounce: 0.2 },
  connection: { type: "spring" as const, visualDuration: 0.35, bounce: 0 },
};

interface ChainViewProps {
  traceId: string;
  chain?: CausalChain;
}

export function ChainView({ chain }: ChainViewProps) {
  const [revealedCount, setRevealedCount] = useState(1);

  if (!chain || chain.nodes.length === 0) return null;

  const nodes = chain.nodes;
  const isComplete = revealedCount >= nodes.length;
  const activeIndex = revealedCount - 1;

  function findConnection(fromIndex: number, toIndex: number): ChainConnection | undefined {
    const from = nodes[fromIndex];
    const to = nodes[toIndex];
    return chain!.connections.find(
      (c) =>
        (c.fromNodeId === from.id && c.toNodeId === to.id) ||
        (c.fromNodeId === to.id && c.toNodeId === from.id),
    );
  }

  function handlePeel() {
    if (isComplete) return;
    setRevealedCount((c) => c + 1);
  }

  const nextIsRootCause =
    activeIndex + 1 < nodes.length && nodes[activeIndex + 1].type === "root-cause";

  return (
    <div className="flex flex-col gap-0">
      {/* Chain label */}
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="mb-6 text-sm font-semibold tracking-wide text-text-secondary"
      >
        {chain.label}
      </motion.p>

      {/* Peeled (compressed) nodes */}
      <div className="flex flex-col gap-1">
        {nodes.slice(0, activeIndex).map((node, i) => {
          const conn = i < activeIndex - 1 ? findConnection(i, i + 1) : undefined;
          return (
            <div key={node.id}>
              <motion.div
                layout
                initial={{ opacity: 1, scale: 1 }}
                animate={{ 
                  opacity: 0.7, 
                  scale: 0.98,
                }}
                transition={SPRING.compress}
                style={{
                  transformOrigin: "top center",
                }}
              >
                <ChainNode node={node} state="peeled" onTap={() => setRevealedCount(i + 1)} />
              </motion.div>
              {/* Connection line with mechanism */}
              <ConnectionLine connection={conn ?? findConnection(i, i + 1)} />
            </div>
          );
        })}

        {/* Connection from last peeled to active */}
        {activeIndex > 0 && (
          <ConnectionLine connection={findConnection(activeIndex - 1, activeIndex)} />
        )}

        {/* Active (large) node */}
        <AnimatePresence mode="wait">
          <motion.div
            key={nodes[activeIndex].id}
            className="relative"
            initial={{ 
              opacity: 0, 
              y: 32, 
              scale: 0.95,
              filter: "blur(8px)",
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              filter: "blur(0px)",
            }}
            transition={
              nodes[activeIndex].type === "root-cause" ? SPRING.rootReveal : SPRING.node
            }
            style={{
              transformOrigin: "top center",
            }}
          >
            {/* Root cause glow - multiple layers */}
            {nodes[activeIndex].type === "root-cause" && (
              <>
                {/* Outer glow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                  className="pointer-events-none absolute inset-0 -m-8 rounded-3xl bg-chain-root/20 blur-3xl"
                  aria-hidden
                />
                {/* Inner glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.25, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  className="pointer-events-none absolute inset-0 -m-4 rounded-2xl bg-chain-root/10 blur-xl"
                  aria-hidden
                />
                {/* Shadow layer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(192,160,232,0.3),0_0_80px_rgba(192,160,232,0.15)]"
                  aria-hidden
                />
              </>
            )}
            <ChainNode node={nodes[activeIndex]} state="active" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Peel prompt */}
      {!isComplete && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={handlePeel}
          className="group mx-auto mt-8 flex flex-col items-center gap-2 text-sm focus:outline-none"
        >
          <span className="font-medium text-text-tertiary transition-all group-hover:text-text-primary group-hover:scale-105">
            {nextIsRootCause ? "Reveal root cause" : "Trace deeper"}
          </span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="text-lg text-chain-active drop-shadow-[0_2px_8px_rgba(240,200,122,0.4)]"
          >
            &#8595;
          </motion.span>
        </motion.button>
      )}

      {/* Trace complete indicator */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING.node, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-chain-active drop-shadow-[0_2px_4px_rgba(240,200,122,0.3)]">
            Trace complete
          </p>
          <p className="mt-2 text-sm font-medium text-text-tertiary">
            {nodes.length} nodes across{" "}
            {new Set(nodes.map((n) => n.bodySystem)).size} body systems
          </p>
        </motion.div>
      )}
    </div>
  );
}

function ConnectionLine({ connection }: { connection?: ChainConnection }) {
  return (
    <div className="flex flex-col items-center py-2">
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.6 }}
        transition={{ ...SPRING.connection, duration: 0.3 }}
        style={{ originY: 0 }}
        className="h-8 w-0.5 bg-gradient-to-b from-chain-connection/60 to-chain-connection/20"
      />
      {connection?.mechanism && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="max-w-[260px] py-2 text-center text-[11px] font-medium leading-tight text-text-tertiary"
        >
          {connection.mechanism}
        </motion.p>
      )}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.6 }}
        transition={{ ...SPRING.connection, delay: 0.12, duration: 0.3 }}
        style={{ originY: 0 }}
        className="h-8 w-0.5 bg-gradient-to-b from-chain-connection/20 to-chain-connection/60"
      />
    </div>
  );
}
