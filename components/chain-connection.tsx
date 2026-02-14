"use client";

// GSAP-driven SVG connection line between chain nodes.
// Will be implemented with DrawSVGPlugin for the line-drawing effect.

interface ChainConnectionProps {
  fromId: string;
  toId: string;
  mechanism: string;
  strength: "strong" | "moderate" | "possible";
}

export function ChainConnection({
  fromId: _fromId,
  toId: _toId,
  mechanism: _mechanism,
  strength: _strength,
}: ChainConnectionProps) {
  // TODO: Implement GSAP DrawSVG animation
  // For now, connection is handled by the simple divider in chain-view.tsx
  return null;
}
