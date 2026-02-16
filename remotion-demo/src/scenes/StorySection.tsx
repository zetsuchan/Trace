import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { spaceGrotesk, inter } from "../fonts";
import { colors } from "../colors";

// Recreated sickle cell for Remotion (no CSS keyframes)
const SickleCellShape: React.FC<{
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
}> = ({ x, y, size, rotation, opacity }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `rotate(${rotation}deg)`,
      opacity,
    }}
  >
    <path
      d="M58 20C48 14 34 16 26 26C18 36 18 50 26 60C34 70 48 72 58 66C50 72 38 70 30 62C22 54 20 40 26 30C32 20 46 16 58 20Z"
      fill={colors.chainMechanism}
    />
    <path
      d="M56 22C47 17 35 19 28 28C21 37 21 49 28 58C35 67 47 69 56 64C49 69 38 67 31 60C24 53 22 41 28 32C34 23 47 19 56 22Z"
      fill={colors.chainMechanism}
      opacity={0.6}
    />
  </svg>
);

const NormalCellShape: React.FC<{
  x: number;
  y: number;
  size: number;
  floatOffset: number;
  opacity: number;
}> = ({ x, y, size, floatOffset, opacity }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    style={{
      position: "absolute",
      left: x,
      top: y + floatOffset,
      opacity,
    }}
  >
    <ellipse cx="40" cy="40" rx="26" ry="26" fill={colors.accentSafe} />
    <ellipse cx="40" cy="40" rx="12" ry="12" fill={colors.accentSafe} opacity={0.45} />
    <ellipse cx="40" cy="40" rx="19" ry="19" stroke={colors.accentSafe} strokeWidth="6" fill="none" opacity={0.25} />
  </svg>
);

const storyLines = [
  { text: "Full SS genotype. I almost died at 7.", start: 0 },
  { text: "I believed I wouldn't make it to 19. I'm 37.", start: 180 },
  { text: "A sinoplasty fixed my chronic back pain.", start: 360 },
  { text: "Nobody connected the sinus to the sickle cell sickling pain.", start: 540 },
  { text: "The chain was crossing three body systems.", start: 660 },
];

export const StorySection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Floating sickle cells in background
  const cells = [
    { x: 100, y: 200, size: 60 },
    { x: 1600, y: 150, size: 50 },
    { x: 300, y: 700, size: 45 },
    { x: 1400, y: 600, size: 55 },
    { x: 800, y: 100, size: 40 },
  ];

  // Normal cells
  const normalCells = [
    { x: 1700, y: 400, size: 50 },
    { x: 200, y: 500, size: 45 },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background cells */}
      {cells.map((cell, i) => {
        const rotation = (frame * (1 + i * 0.3)) % 360;
        const opacity = interpolate(
          Math.sin(frame * 0.03 + i),
          [-1, 1],
          [0.1, 0.25],
        );
        return (
          <SickleCellShape
            key={`s${i}`}
            x={cell.x}
            y={cell.y}
            size={cell.size}
            rotation={rotation}
            opacity={opacity}
          />
        );
      })}

      {normalCells.map((cell, i) => {
        const floatOffset = Math.sin(frame * 0.05 + i * 2) * 5;
        const opacity = interpolate(
          Math.sin(frame * 0.02 + i * 3),
          [-1, 1],
          [0.1, 0.2],
        );
        return (
          <NormalCellShape
            key={`n${i}`}
            x={cell.x}
            y={cell.y}
            size={cell.size}
            floatOffset={floatOffset}
            opacity={opacity}
          />
        );
      })}

      {/* Center text content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 120,
          gap: 24,
        }}
      >
        {storyLines.map((line, i) => {
          const opacity = interpolate(
            frame,
            [line.start, line.start + 30, line.start + 150, line.start + 180],
            [0, 1, 1, 0.3],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const translateY = interpolate(
            frame,
            [line.start, line.start + 30],
            [15, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                fontFamily: inter,
                fontSize: 40,
                fontWeight: 400,
                color: colors.textPrimary,
                textAlign: "center",
                opacity,
                transform: `translateY(${translateY}px)`,
                maxWidth: 1200,
                lineHeight: 1.4,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Subtle gradient overlay at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(transparent, ${colors.bg})`,
        }}
      />
    </div>
  );
};
