"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/trace/new";
  const { login, guestLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDev = process.env.NODE_ENV === "development";

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestSignIn(role: "patient" | "provider") {
    setError("");
    setLoading(true);
    try {
      const user = await guestLogin(role);
      if (user.role === "provider" || user.role === "admin") {
        router.push("/provider/dashboard");
      } else {
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guest login failed");
    } finally {
      setLoading(false);
    }
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

              {error && (
                <p className="text-xs text-accent-warning">{error}</p>
              )}

              <Button type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Guest sign-in buttons — dev only */}
            {isDev && (
              <>
                <div className="relative flex items-center gap-3 py-4">
                  <div className="h-px flex-1 bg-bg-elevated" />
                  <span className="text-[11px] text-text-tertiary uppercase tracking-wider">
                    dev mode
                  </span>
                  <div className="h-px flex-1 bg-bg-elevated" />
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={loading}
                    onClick={() => handleGuestSignIn("patient")}
                  >
                    Guest Sign In — Patient
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={loading}
                    onClick={() => handleGuestSignIn("provider")}
                  >
                    Guest Sign In — Provider
                  </Button>
                </div>

                <p className="mt-4 text-center text-[11px] text-text-tertiary">
                  Guest accounts require <code className="text-text-secondary">bun run db:seed</code>
                </p>
              </>
            )}

            {!isDev && (
              <p className="mt-5 text-center text-[11px] text-text-tertiary">
                Contact your practice administrator for access
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
