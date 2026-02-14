"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { HeroIllustration } from "@/components/svg/HeroIllustration";
import { SickleCell } from "@/components/svg/SickleCell";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   page mounts
 *  100ms   sickle cell floats in (top-right, decorative)
 *  200ms   "T R A C E" title scales in from 0.95
 *  400ms   tagline fades up
 *  600ms   description paragraph fades up
 *  800ms   CTA button springs in with bounce
 * 1000ms   hero illustration fades in from right
 * 1200ms   bottom stats row fades up (staggered)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  cell: 0.1,
  title: 0.2,
  tagline: 0.4,
  description: 0.6,
  cta: 0.8,
  hero: 1.0,
  stats: 1.2,
};

const SPRING = {
  gentle: { type: "spring" as const, visualDuration: 0.5, bounce: 0.1 },
  bounce: { type: "spring" as const, visualDuration: 0.5, bounce: 0.25 },
};

function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-bg-deep/80 backdrop-blur-md"
      role="navigation"
      aria-label="Top navigation"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Left: Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
        >
          T R A C E
        </Link>

        {/* Right: Nav links + theme toggle */}
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="text-sm text-muted-foreground transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
          >
            Docs
          </Link>
          <Link
            href="/docs/architecture"
            className="text-sm text-muted-foreground transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
          >
            Architecture
          </Link>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
          >
            GitHub
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="relative flex min-h-[85vh] flex-col justify-center gap-0 overflow-hidden pt-14">
        {/* Decorative sickle cells */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20 }}
          animate={{ opacity: 0.15, x: 0, y: 0 }}
          transition={{ delay: TIMING.cell, ...SPRING.gentle }}
          className="pointer-events-none absolute -right-8 -top-4"
          aria-hidden="true"
        >
          <SickleCell size={120} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ delay: TIMING.cell + 0.3, ...SPRING.gentle }}
          className="pointer-events-none absolute bottom-12 left-[-40px]"
          aria-hidden="true"
        >
          <SickleCell size={80} />
        </motion.div>

        {/* Main content — two column layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left column: Text + CTA */}
          <div className="flex flex-col gap-0">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: TIMING.title, ...SPRING.gentle }}
              className="text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.9] tracking-[-0.04em] text-text-primary"
            >
              T R A C E
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: TIMING.tagline, ...SPRING.gentle }}
              className="mt-5 text-xl font-medium leading-[1.3] text-chain-active"
            >
              Sickle Cell Causal Intelligence
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: TIMING.description, ...SPRING.gentle }}
              className="mt-4 max-w-md text-base leading-[1.7] text-text-secondary"
            >
              Trace invisible connections across your body systems. Understand the
              chain from symptom to root cause — powered by multi-agent reasoning.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: TIMING.cta, ...SPRING.bounce }}
              className="mt-8 flex items-center gap-4"
            >
              <Link
                href="/trace/new?q="
                className="inline-flex items-center gap-2 rounded-xl bg-chain-active px-7 py-3.5 text-base font-semibold text-bg-deep transition-all hover:shadow-[0_4px_20px_rgba(240,200,122,0.3)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start Tracing
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/history"
                className="rounded-xl border border-border px-6 py-3.5 text-base font-medium text-text-secondary transition-all hover:bg-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View History
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: TIMING.stats, ...SPRING.gentle }}
              className="mt-12 flex gap-8"
            >
              {[
                { value: "3", label: "AI Agents" },
                { value: "3", label: "View Modes" },
                { value: "3", label: "MCP Integrations" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: TIMING.stats + i * 0.1, ...SPRING.gentle }}
                >
                  <p className="text-2xl font-bold tabular-nums text-text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-text-tertiary">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right column: Hero illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: TIMING.hero, ...SPRING.gentle }}
            className="flex items-center justify-center"
          >
            <HeroIllustration className="w-full max-w-[440px]" />
          </motion.div>
        </div>

        {/* Background gradient */}
        <div
          className="pointer-events-none fixed right-0 top-0 h-screen w-1/3 bg-gradient-to-l from-chain-active/[0.03] to-transparent"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
