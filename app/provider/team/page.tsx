"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Member = {
  id: string;
  role: string;
  name: string | null;
  email: string;
  acceptedAt: string | null;
};

type Practice = {
  practiceId: string;
  role: string;
  practiceName: string;
  practiceSlug: string;
};

export default function TeamPage() {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("provider");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      // Get user's practice
      const practicesRes = await fetch("/api/practices");
      const practicesData = await practicesRes.json();
      const primary = practicesData.practices?.[0];

      if (!primary) {
        setLoading(false);
        return;
      }

      setPractice(primary);

      // Get members
      const membersRes = await fetch(`/api/practices/${primary.practiceId}/members`);
      const membersData = await membersRes.json();
      setMembers(membersData.members || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!practice) return;

    setMessage("");
    setInviting(true);

    try {
      const res = await fetch(`/api/practices/${practice.practiceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to invite");
      } else {
        setMessage(data.pending ? "Invite sent — user will be added on registration." : "Member added.");
        setInviteEmail("");
        await loadData();
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-text-primary">Team</h1>
        <p className="text-sm text-text-tertiary">Loading...</p>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-text-primary">Team</h1>
        <p className="text-sm text-text-secondary">
          No practice found. <a href="/provider/setup" className="text-chain-active underline">Set up your practice</a> first.
        </p>
      </div>
    );
  }

  const isAdmin = practice.role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Team</h1>
        <p className="mt-1 text-sm text-text-secondary">{practice.practiceName}</p>
      </div>

      {/* Members list */}
      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-chain-connection/20 bg-bg-surface p-4"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">{m.name || m.email}</p>
              {m.name && <p className="text-xs text-text-tertiary">{m.email}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-bg-elevated px-2.5 py-1 text-xs font-medium text-text-secondary capitalize">
                {m.role}
              </span>
              {!m.acceptedAt && (
                <span className="text-xs text-chain-active">Pending</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite form — admin only */}
      {isAdmin && (
        <Card className="border-bg-elevated/60 bg-bg-surface/80">
          <CardHeader>
            <h2 className="text-base font-medium text-text-primary">Invite Team Member</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="invite-email" className="text-xs font-medium text-text-secondary">
                  Email
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@hospital.org"
                  required
                  className="mt-1 bg-bg-deep/60 border-bg-elevated placeholder:text-text-tertiary"
                />
              </div>
              <div className="w-36">
                <label htmlFor="invite-role" className="text-xs font-medium text-text-secondary">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-bg-elevated bg-bg-deep/60 px-3 py-2 text-sm text-text-primary"
                >
                  <option value="provider">Provider</option>
                  <option value="nurse">Nurse</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <Button type="submit" variant="primary" disabled={inviting}>
                {inviting ? "Sending..." : "Invite"}
              </Button>
            </form>
            {message && (
              <p className="mt-3 text-xs text-text-secondary">{message}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
