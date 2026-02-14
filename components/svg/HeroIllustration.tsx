"use client";

interface HeroIllustrationProps {
  className?: string;
}

export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <svg
      width="480"
      height="360"
      viewBox="0 0 480 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Interconnected body systems illustration"
      role="img"
    >
      <style>{`
        @keyframes flow-dash {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes node-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes cell-drift {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        @keyframes cell-drift-reverse {
          0% { offset-distance: 100%; }
          100% { offset-distance: 0%; }
        }
        .flow-line {
          stroke-dasharray: 8 4;
          animation: flow-dash 1.5s linear infinite;
        }
        .system-node {
          animation: node-pulse 3s ease-in-out infinite;
        }
        .system-node-delay {
          animation: node-pulse 3s ease-in-out 1s infinite;
        }
        .system-node-delay2 {
          animation: node-pulse 3s ease-in-out 2s infinite;
        }
        .sickle-1 {
          offset-path: path("M160 110 C220 80 300 120 340 170 C370 210 360 260 320 280");
          animation: cell-drift 6s linear infinite;
        }
        .sickle-2 {
          offset-path: path("M160 110 C180 160 200 200 200 250 C200 280 180 300 160 310");
          animation: cell-drift 8s linear infinite;
        }
        .sickle-3 {
          offset-path: path("M340 170 C310 200 260 230 200 250");
          animation: cell-drift-reverse 5s linear infinite;
        }
      `}</style>

      <defs>
        {/* Isometric grid hint */}
        <linearGradient id="hero-fade" x1="0" y1="0" x2="480" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-chain-symptom, #E8A87C)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--color-chain-root, #C0A0E8)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Subtle background wash */}
      <rect width="480" height="360" fill="url(#hero-fade)" rx="16" />

      {/* ── Flow lines connecting the three systems ── */}
      {/* Lungs -> Heart */}
      <path
        className="flow-line"
        d="M160 110 C220 80 300 120 340 170"
        stroke="var(--color-chain-connection, #4A4540)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Heart -> Bone */}
      <path
        className="flow-line"
        d="M340 170 C360 210 360 260 320 280"
        stroke="var(--color-chain-connection, #4A4540)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ animationDelay: "0.5s" }}
      />
      {/* Lungs -> Bone (lower arc) */}
      <path
        className="flow-line"
        d="M160 110 C180 160 200 200 200 250 C200 280 180 300 160 310"
        stroke="var(--color-chain-connection, #4A4540)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ animationDelay: "1s" }}
      />
      {/* Heart -> Lungs (return) */}
      <path
        className="flow-line"
        d="M340 170 C310 200 260 230 200 250"
        stroke="var(--color-chain-connection, #4A4540)"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ animationDelay: "0.3s" }}
      />

      {/* ── Sickle cells along flow paths ── */}
      {/* Cell 1 on path lungs->heart->bone */}
      <g className="sickle-1">
        <path
          d="M8 0C4 -3 0 -2 -2 1C-4 4 -4 7 -2 9C0 11 4 11 8 9C5 11 2 10 0 8C-2 6 -3 3 -2 1C0 -1 3 -2 8 0Z"
          fill="var(--color-chain-mechanism, #D4786A)"
        />
      </g>
      {/* Cell 2 on path lungs->bone */}
      <g className="sickle-2">
        <path
          d="M8 0C4 -3 0 -2 -2 1C-4 4 -4 7 -2 9C0 11 4 11 8 9C5 11 2 10 0 8C-2 6 -3 3 -2 1C0 -1 3 -2 8 0Z"
          fill="var(--color-chain-mechanism, #D4786A)"
          opacity="0.8"
        />
      </g>
      {/* Cell 3 on return path */}
      <g className="sickle-3">
        <path
          d="M6 0C3 -2 0 -2 -2 1C-3 3 -3 5 -2 7C0 8 3 8 6 7C4 8 1 8 0 6C-1 4 -2 2 -1 1C0 0 2 -1 6 0Z"
          fill="var(--color-chain-mechanism, #D4786A)"
          opacity="0.6"
        />
      </g>

      {/* ── System node: Lungs (Respiratory) ── */}
      <g className="system-node">
        <circle cx="160" cy="110" r="36" fill="var(--color-bg-elevated, #242120)" stroke="var(--color-chain-symptom, #E8A87C)" strokeWidth="2" />
        {/* Simplified lungs inside */}
        <g transform="translate(140, 92)">
          <path d="M20 4V12" stroke="var(--color-chain-symptom, #E8A87C)" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M20 12C20 12 15 14 13 17C11 20 11 23 12 25C13 27 16 27 17 26C18 25 20 23 20 22"
            stroke="var(--color-chain-symptom, #E8A87C)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="var(--color-chain-symptom, #E8A87C)"
            fillOpacity="0.2"
          />
          <path
            d="M20 12C20 12 25 14 27 17C29 20 29 23 28 25C27 27 24 27 23 26C22 25 20 23 20 22"
            stroke="var(--color-chain-symptom, #E8A87C)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="var(--color-chain-symptom, #E8A87C)"
            fillOpacity="0.2"
          />
        </g>
        <text x="160" y="158" textAnchor="middle" fill="var(--color-text-secondary, #9B938A)" fontSize="11" fontFamily="system-ui, sans-serif">
          Respiratory
        </text>
      </g>

      {/* ── System node: Heart (Circulatory) ── */}
      <g className="system-node-delay">
        <circle cx="340" cy="170" r="36" fill="var(--color-bg-elevated, #242120)" stroke="var(--color-chain-mechanism, #D4786A)" strokeWidth="2" />
        {/* Simplified heart inside */}
        <g transform="translate(322, 154)">
          <path
            d="M18 30L8 20C4 16 4 11 7 9C10 7 13 8 18 12C23 8 26 7 29 9C32 11 32 16 28 20L18 30Z"
            stroke="var(--color-chain-mechanism, #D4786A)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="var(--color-chain-mechanism, #D4786A)"
            fillOpacity="0.2"
          />
        </g>
        <text x="340" y="218" textAnchor="middle" fill="var(--color-text-secondary, #9B938A)" fontSize="11" fontFamily="system-ui, sans-serif">
          Circulatory
        </text>
      </g>

      {/* ── System node: Bone (Musculoskeletal) ── */}
      <g className="system-node-delay2">
        <circle cx="200" cy="270" r="36" fill="var(--color-bg-elevated, #242120)" stroke="var(--color-chain-root, #C0A0E8)" strokeWidth="2" />
        {/* Simplified bone inside */}
        <g transform="translate(187, 254)">
          <circle cx="10" cy="8" r="4" stroke="var(--color-chain-root, #C0A0E8)" strokeWidth="1.5" fill="var(--color-chain-root, #C0A0E8)" fillOpacity="0.2" />
          <circle cx="18" cy="8" r="4" stroke="var(--color-chain-root, #C0A0E8)" strokeWidth="1.5" fill="var(--color-chain-root, #C0A0E8)" fillOpacity="0.2" />
          <rect x="11" y="8" width="6" height="16" rx="3" stroke="var(--color-chain-root, #C0A0E8)" strokeWidth="1.5" fill="var(--color-chain-root, #C0A0E8)" fillOpacity="0.2" />
          <circle cx="10" cy="24" r="4" stroke="var(--color-chain-root, #C0A0E8)" strokeWidth="1.5" fill="var(--color-chain-root, #C0A0E8)" fillOpacity="0.2" />
          <circle cx="18" cy="24" r="4" stroke="var(--color-chain-root, #C0A0E8)" strokeWidth="1.5" fill="var(--color-chain-root, #C0A0E8)" fillOpacity="0.2" />
        </g>
        <text x="200" y="318" textAnchor="middle" fill="var(--color-text-secondary, #9B938A)" fontSize="11" fontFamily="system-ui, sans-serif">
          Musculoskeletal
        </text>
      </g>

      {/* ── Decorative isometric grid lines ── */}
      <g opacity="0.06">
        <line x1="0" y1="60" x2="480" y2="60" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="0" y1="120" x2="480" y2="120" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="0" y1="180" x2="480" y2="180" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="0" y1="240" x2="480" y2="240" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="0" y1="300" x2="480" y2="300" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="80" y1="0" x2="80" y2="360" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="160" y1="0" x2="160" y2="360" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="240" y1="0" x2="240" y2="360" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="320" y1="0" x2="320" y2="360" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
        <line x1="400" y1="0" x2="400" y2="360" stroke="var(--color-text-tertiary, #5C554E)" strokeWidth="0.5" />
      </g>
    </svg>
  );
}
