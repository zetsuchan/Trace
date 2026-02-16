import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { spaceGrotesk } from "../fonts";
import { colors } from "../colors";

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gold glow pulse
  const glowIntensity = interpolate(
    frame,
    [20, 50, 80],
    [0, 30, 15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtitle appears after logo
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: spaceGrotesk,
          fontSize: 120,
          fontWeight: 700,
          color: colors.goldBright,
          letterSpacing: 16,
          opacity,
          transform: `scale(${scale})`,
          textShadow: `0 0 ${glowIntensity}px ${colors.gold}, 0 0 ${glowIntensity * 2}px ${colors.gold}40`,
        }}
      >
        TRACE
      </div>
      <div
        style={{
          fontFamily: spaceGrotesk,
          fontSize: 24,
          fontWeight: 300,
          color: colors.textSecondary,
          letterSpacing: 6,
          opacity: subtitleOpacity,
        }}
      >
        CAUSAL INTELLIGENCE FOR CHRONIC DISEASE
      </div>
    </div>
  );
};
