import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { spaceGrotesk, inter } from "../fonts";
import { colors } from "../colors";

const StatCard: React.FC<{
  value: string;
  label: string;
  enterFrame: number;
}> = ({ value, label, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 15 },
  });

  const opacity = interpolate(frame, [enterFrame, enterFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: spaceGrotesk,
          fontSize: 72,
          fontWeight: 700,
          color: colors.goldBright,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 20,
          color: colors.textSecondary,
          marginTop: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const visionLines = [
  { text: "Sickle cell is the demo.", start: 0, bold: true },
  { text: "But the problem is universal.", start: 60, bold: false },
  { text: "Cancer patients in remission who don't feel well \u2014", start: 300, bold: false },
  { text: "that's a signal that needs tracing, not dismissing.", start: 360, bold: true },
  { text: "Same pipeline. Different knowledge base.", start: 600, bold: false },
  { text: "The architecture is domain-agnostic.", start: 660, bold: true },
];

const diseases = [
  { name: "Sickle Cell", color: colors.chainMechanism, enter: 800 },
  { name: "Cancer", color: colors.chainRoot, enter: 830 },
  { name: "Autoimmune", color: colors.chainSymptom, enter: 860 },
  { name: "Chronic Pain", color: colors.accentSafe, enter: 890 },
];

export const VisionSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
      {/* Stats row at top */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 160,
        }}
      >
        <StatCard value="20M+" label="People affected worldwide" enterFrame={120} />
        <StatCard value="3" label="AI agents in pipeline" enterFrame={150} />
        <StatCard value="10" label="Database tables" enterFrame={180} />
      </div>

      {/* Vision text */}
      <div
        style={{
          position: "absolute",
          top: 350,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "0 160px",
        }}
      >
        {visionLines.map((line, i) => {
          const opacity = interpolate(
            frame,
            [line.start, line.start + 30],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const translateY = interpolate(
            frame,
            [line.start, line.start + 30],
            [12, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                fontFamily: line.bold ? spaceGrotesk : inter,
                fontSize: line.bold ? 42 : 36,
                fontWeight: line.bold ? 700 : 400,
                color: line.bold ? colors.textPrimary : colors.textSecondary,
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

      {/* Disease pills */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {diseases.map((disease, i) => {
          const scale = spring({
            frame: frame - disease.enter,
            fps,
            config: { damping: 12 },
          });
          const opacity = interpolate(
            frame,
            [disease.enter, disease.enter + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                fontFamily: spaceGrotesk,
                fontSize: 22,
                fontWeight: 600,
                color: disease.color,
                background: `${disease.color}15`,
                border: `2px solid ${disease.color}40`,
                borderRadius: 40,
                padding: "14px 32px",
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              {disease.name}
            </div>
          );
        })}
      </div>

      {/* Bottom quote */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [950, 990], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 24,
            fontWeight: 400,
            color: colors.gold,
            fontStyle: "italic",
          }}
        >
          The diseases that don't get funding can still get intelligence.
        </div>
      </div>
    </div>
  );
};
