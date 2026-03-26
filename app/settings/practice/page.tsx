"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PracticeLink = {
  linkId: string;
  status: string;
  linkedAt: string;
  practiceId: string;
  practiceName: string;
  practiceSlug: string;
};

export default function PracticeSettings() {
  const [links, setLinks] = useState<PracticeLink[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/link-practice");
      const data = await res.json();
      setLinks(data.links || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLinking(true);

    try {
      const res = await fetch("/api/patient/link-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to link");
      } else {
        setMessage(`Linked to ${data.practiceName}`);
        setCode("");
        await loadLinks();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLinking(false);
    }
  }

  async function handleRevoke(linkId: string) {
    try {
      await fetch("/api/patient/link-practice", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });
      await loadLinks();
    } catch {
      // silently fail
    }
  }

  const activeLinks = links.filter((l) => l.status === "active");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">My Practice</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Link your account to your doctor's practice to share traces.
        </p>
      </div>

      {/* Current links */}
      {!loading && activeLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary">Linked Practices</h2>
          {activeLinks.map((link) => (
            <div
              key={link.linkId}
              className="flex items-center justify-between rounded-xl border border-chain-connection/20 bg-bg-surface p-4"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{link.practiceName}</p>
                <p className="text-xs text-text-tertiary">
                  Code: {link.practiceSlug} — Linked {new Date(link.linkedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(link.linkId)}
                className="text-xs text-text-tertiary hover:text-accent-warning transition-colors"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && activeLinks.length === 0 && (
        <p className="text-sm text-text-tertiary">
          You're not linked to any practice yet. Enter your practice code below.
        </p>
      )}

      {/* Link form */}
      <Card className="border-bg-elevated/60 bg-bg-surface/80">
        <CardHeader>
          <h2 className="text-base font-medium text-text-primary">Link to a Practice</h2>
          <p className="text-xs text-text-secondary">
            Ask your doctor for your practice code.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLink} className="flex gap-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. atlanta-scc"
              required
              className="flex-1 bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
            />
            <Button type="submit" variant="primary" disabled={linking}>
              {linking ? "Linking..." : "Link"}
            </Button>
          </form>
          {error && <p className="mt-3 text-xs text-accent-warning">{error}</p>}
          {message && <p className="mt-3 text-xs text-accent-action">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
