import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { spaceGrotesk } from "../fonts";
import { colors } from "../colors";

const lines = [
  "Sickle cell disease crosses every system in your body.",
  "The connections between them are invisible.",
  "They take years to find \u2014 if you find them at all.",
];

export const HookText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each line gets ~4.5 seconds (135 frames) of screen time
  // Stagger: line 1 starts at 0, line 2 at 120, line 3 at 240
  const lineTimings = [
    { enter: 0, exit: 360 },
    { enter: 120, exit: 380 },
    { enter: 240, exit: 400 },
  ];

  // Overall fade out in the last 50 frames (450 total)
  const overallFadeOut = interpolate(frame, [400, 450], [1, 0], {
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
        padding: 120,
        gap: 40,
        opacity: overallFadeOut,
      }}
    >
      {lines.map((line, i) => {
        const { enter } = lineTimings[i];

        const opacity = interpolate(frame, [enter, enter + 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const translateY = interpolate(frame, [enter, enter + 30], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              fontFamily: spaceGrotesk,
              fontSize: i === 2 ? 44 : 48,
              fontWeight: i === 2 ? 500 : 400,
              color: i === 2 ? colors.goldBright : colors.textPrimary,
              textAlign: "center",
              lineHeight: 1.3,
              opacity,
              transform: `translateY(${translateY}px)`,
              maxWidth: 1400,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
