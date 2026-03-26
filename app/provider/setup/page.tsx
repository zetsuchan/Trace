"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PracticeSetup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [npi, setNpi] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/practices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          npi: npi || undefined,
          address: street ? { street, city, state, zip } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create practice");
      }

      router.push("/provider/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg border-bg-elevated/60 bg-bg-surface/80">
        <CardHeader>
          <h1 className="text-xl font-semibold text-text-primary">
            Set Up Your Practice
          </h1>
          <p className="text-sm text-text-secondary">
            Create your practice to start managing patients with TRACE.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-text-secondary">
                Practice Name *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Atlanta Sickle Cell Center"
                required
                className="bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="npi" className="text-xs font-medium text-text-secondary">
                NPI (National Provider Identifier)
              </label>
              <Input
                id="npi"
                value={npi}
                onChange={(e) => setNpi(e.target.value)}
                placeholder="1234567890"
                className="bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
              />
            </div>

            <div className="border-t border-chain-connection/10 pt-4">
              <p className="mb-3 text-xs font-medium text-text-secondary">
                Address (optional)
              </p>
              <div className="flex flex-col gap-3">
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address"
                  className="bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="col-span-1 bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                  />
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                  />
                  <Input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP"
                    className="bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-accent-warning">{error}</p>
            )}

            <Button type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Practice"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
