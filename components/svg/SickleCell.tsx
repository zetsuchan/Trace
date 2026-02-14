"use client";

interface SickleCellProps {
  className?: string;
  size?: number;
}

export function SickleCell({ className, size = 80 }: SickleCellProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sickle cell"
      role="img"
    >
      <style>{`
        @keyframes sickle-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sickle-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        .sickle-cell-body {
          animation: sickle-rotate 12s linear infinite, sickle-pulse 3s ease-in-out infinite;
          transform-origin: 40px 40px;
        }
      `}</style>
      <g className="sickle-cell-body">
        {/* Sickle / crescent shape */}
        <path
          d="M58 20C48 14 34 16 26 26C18 36 18 50 26 60C34 70 48 72 58 66C50 72 38 70 30 62C22 54 20 40 26 30C32 20 46 16 58 20Z"
          fill="var(--color-chain-mechanism, #D4786A)"
        />
        {/* Inner shadow for depth */}
        <path
          d="M56 22C47 17 35 19 28 28C21 37 21 49 28 58C35 67 47 69 56 64C49 69 38 67 31 60C24 53 22 41 28 32C34 23 47 19 56 22Z"
          fill="var(--color-chain-mechanism, #D4786A)"
          opacity="0.6"
        />
        {/* Highlight edge */}
        <path
          d="M58 20C48 14 34 16 26 26C24 28 22 31 21 34"
          stroke="var(--color-chain-symptom, #E8A87C)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
      </g>
    </svg>
  );
}
