"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    // Demo-only: no real auth
    localStorage.setItem("trace-auth", "signed-in");
    router.push("/");
  }

  function handleDemoMode() {
    localStorage.setItem("trace-auth", "demo");
    router.push("/");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep">
      {/* Subtle radial glow behind the card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-chain-active/[0.04] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm px-4"
      >
        <Card className="border-bg-elevated/60 bg-bg-surface/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="items-center gap-4 pb-2">
            {/* TRACE branding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center gap-3"
            >
              <h1 className="text-2xl font-semibold tracking-[0.3em] text-chain-active">
                T R A C E
              </h1>
              <p className="text-xs text-text-secondary tracking-wide">
                Sickle Cell Causal Intelligence
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="pt-2">
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-text-secondary"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="clinician@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-text-secondary"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                />
              </div>

              <Button type="submit" variant="primary" className="mt-2 w-full">
                Sign In
              </Button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-bg-elevated" />
                <span className="text-[11px] text-text-tertiary uppercase tracking-wider">
                  or
                </span>
                <div className="h-px flex-1 bg-bg-elevated" />
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleDemoMode}
              >
                Demo Mode
              </Button>
            </form>

            <p className="mt-5 text-center text-[11px] text-text-tertiary">
              Hackathon demo &mdash; no real credentials required
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
