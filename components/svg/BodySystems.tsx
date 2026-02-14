"use client";

interface BodySystemProps {
  className?: string;
  size?: number;
}

/* ── Respiratory (Lungs) ─────────────────────── */
export function RespiratoryIcon({ className, size = 40 }: BodySystemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Respiratory system"
      role="img"
    >
      <style>{`
        @keyframes lungs-breathe {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.04); }
        }
        .lungs-body {
          animation: lungs-breathe 4s ease-in-out infinite;
          transform-origin: 20px 20px;
        }
      `}</style>
      <g className="lungs-body">
        {/* Trachea */}
        <path
          d="M20 6V16"
          stroke="var(--color-chain-symptom, #E8A87C)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Left lung */}
        <path
          d="M20 16C20 16 14 18 11 22C8 26 8 30 10 33C12 36 16 36 18 34C19 33 20 30 20 28"
          stroke="var(--color-chain-symptom, #E8A87C)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="var(--color-chain-symptom, #E8A87C)"
          fillOpacity="0.15"
        />
        {/* Right lung */}
        <path
          d="M20 16C20 16 26 18 29 22C32 26 32 30 30 33C28 36 24 36 22 34C21 33 20 30 20 28"
          stroke="var(--color-chain-symptom, #E8A87C)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="var(--color-chain-symptom, #E8A87C)"
          fillOpacity="0.15"
        />
      </g>
    </svg>
  );
}

/* ── Circulatory (Heart / vessel) ─────────────── */
export function CirculatoryIcon({ className, size = 40 }: BodySystemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Circulatory system"
      role="img"
    >
      <style>{`
        @keyframes heart-beat {
          0%, 80%, 100% { transform: scale(1); }
          10% { transform: scale(1.08); }
          30% { transform: scale(1.04); }
        }
        .heart-body {
          animation: heart-beat 1.6s ease-in-out infinite;
          transform-origin: 20px 20px;
        }
      `}</style>
      <g className="heart-body">
        <path
          d="M20 34L8 22C4 18 4 12 8 9C12 6 16 7 20 12C24 7 28 6 32 9C36 12 36 18 32 22L20 34Z"
          stroke="var(--color-chain-mechanism, #D4786A)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="var(--color-chain-mechanism, #D4786A)"
          fillOpacity="0.15"
        />
      </g>
    </svg>
  );
}

/* ── Musculoskeletal (Bone) ───────────────────── */
export function MusculoskeletalIcon({ className, size = 40 }: BodySystemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Musculoskeletal system"
      role="img"
    >
      <style>{`
        @keyframes bone-glow {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        .bone-body {
          animation: bone-glow 3s ease-in-out infinite;
        }
      `}</style>
      <g className="bone-body">
        {/* Top knob */}
        <circle
          cx="16"
          cy="10"
          r="4"
          stroke="var(--color-chain-root, #C0A0E8)"
          strokeWidth="2"
          fill="var(--color-chain-root, #C0A0E8)"
          fillOpacity="0.15"
        />
        <circle
          cx="24"
          cy="10"
          r="4"
          stroke="var(--color-chain-root, #C0A0E8)"
          strokeWidth="2"
          fill="var(--color-chain-root, #C0A0E8)"
          fillOpacity="0.15"
        />
        {/* Shaft */}
        <rect
          x="17"
          y="10"
          width="6"
          height="20"
          rx="3"
          stroke="var(--color-chain-root, #C0A0E8)"
          strokeWidth="2"
          fill="var(--color-chain-root, #C0A0E8)"
          fillOpacity="0.15"
        />
        {/* Bottom knob */}
        <circle
          cx="16"
          cy="30"
          r="4"
          stroke="var(--color-chain-root, #C0A0E8)"
          strokeWidth="2"
          fill="var(--color-chain-root, #C0A0E8)"
          fillOpacity="0.15"
        />
        <circle
          cx="24"
          cy="30"
          r="4"
          stroke="var(--color-chain-root, #C0A0E8)"
          strokeWidth="2"
          fill="var(--color-chain-root, #C0A0E8)"
          fillOpacity="0.15"
        />
      </g>
    </svg>
  );
}
