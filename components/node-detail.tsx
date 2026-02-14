"use client";

import type { ChainNode } from "@/lib/types";

interface NodeDetailProps {
  node: ChainNode;
}

export function NodeDetail({ node }: NodeDetailProps) {
  // TODO: Extended detail view for a chain node
  // Shown in a panel or expanded inline
  return (
    <div className="rounded-xl bg-bg-surface p-5">
      <h3 className="text-lg font-medium">{node.title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{node.description}</p>
    </div>
  );
}
