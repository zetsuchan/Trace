"use client";

interface NormalCellProps {
  className?: string;
  size?: number;
}

export function NormalCell({ className, size = 80 }: NormalCellProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Normal red blood cell"
      role="img"
    >
      <style>{`
        @keyframes normal-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .normal-cell-body {
          animation: normal-float 4s ease-in-out infinite;
        }
      `}</style>
      <g className="normal-cell-body">
        {/* Outer disc */}
        <ellipse
          cx="40"
          cy="40"
          rx="26"
          ry="26"
          fill="var(--color-accent-safe, #7CB89E)"
        />
        {/* Inner dimple — donut centre */}
        <ellipse
          cx="40"
          cy="40"
          rx="12"
          ry="12"
          fill="var(--color-accent-safe, #7CB89E)"
          opacity="0.45"
        />
        {/* Soft ring to define the donut shape */}
        <ellipse
          cx="40"
          cy="40"
          rx="19"
          ry="19"
          stroke="var(--color-accent-safe, #7CB89E)"
          strokeWidth="6"
          fill="none"
          opacity="0.25"
        />
        {/* Highlight */}
        <ellipse
          cx="33"
          cy="33"
          rx="6"
          ry="4"
          fill="white"
          opacity="0.15"
          transform="rotate(-30 33 33)"
        />
      </g>
    </svg>
  );
}
