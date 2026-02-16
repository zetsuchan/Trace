import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { spaceGrotesk, inter } from "../fonts";
import { colors } from "../colors";

export const ClosingCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 80 },
  });

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const linkOpacity = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gold glow that persists
  const glowIntensity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [15, 30],
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
      }}
    >
      {/* TRACE Logo */}
      <div
        style={{
          fontFamily: spaceGrotesk,
          fontSize: 100,
          fontWeight: 700,
          color: colors.goldBright,
          letterSpacing: 14,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          textShadow: `0 0 ${glowIntensity}px ${colors.gold}, 0 0 ${glowIntensity * 2}px ${colors.gold}30`,
        }}
      >
        TRACE
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 32,
          fontWeight: 300,
          color: colors.textSecondary,
          opacity: taglineOpacity,
          lineHeight: 1.4,
        }}
      >
        Trace the invisible. Understand the why.
      </div>

      {/* GitHub link */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 22,
          fontWeight: 400,
          color: colors.textTertiary,
          opacity: linkOpacity,
          marginTop: 20,
          background: colors.bgElevated,
          padding: "12px 28px",
          borderRadius: 12,
          border: `1px solid ${colors.chainConnection}`,
        }}
      >
        github.com/zetsuchan/Trace
      </div>

      {/* Hackathon badge */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 500,
          color: colors.textTertiary,
          opacity: linkOpacity,
          marginTop: 10,
          letterSpacing: 2,
        }}
      >
        ANTHROPIC HACKATHON 2026
      </div>
    </div>
  );
};
