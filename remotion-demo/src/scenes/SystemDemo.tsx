import { useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { spaceGrotesk, inter } from "../fonts";
import { colors } from "../colors";

const AGENT_TOP = 420; // pushed down so input bar doesn't overlap
const ICON_SIZE = 140;
const ICON_TOP = AGENT_TOP - ICON_SIZE - 10; // icons sit above boxes

const AgentBox: React.FC<{
  label: string;
  model: string;
  color: string;
  x: number;
  enterFrame: number;
  features: string[];
  iconFile: string;
}> = ({ label, model, color, x, enterFrame, features, iconFile }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const opacity = interpolate(frame, [enterFrame, enterFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Icon bounces in slightly before the box
  const iconScale = spring({
    frame: frame - (enterFrame - 10),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const iconOpacity = interpolate(frame, [enterFrame - 10, enterFrame + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle pulsing glow once visible
  const glowPulse = frame > enterFrame + 30
    ? interpolate(Math.sin((frame - enterFrame) * 0.06), [-1, 1], [0, 8])
    : 0;

  return (
    <>
      {/* Kawaii agent icon */}
      <div
        style={{
          position: "absolute",
          left: x + (420 - ICON_SIZE) / 2,
          top: ICON_TOP,
          width: ICON_SIZE,
          height: ICON_SIZE,
          opacity: iconOpacity,
          transform: `scale(${iconScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile(iconFile)}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            objectFit: "contain",
          }}
        />
      </div>

      {/* Agent card */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: AGENT_TOP,
          width: 420,
          opacity,
          transform: `scale(${progress}) translateY(${(1 - progress) * 30}px)`,
        }}
      >
        <div
          style={{
            background: colors.bgElevated,
            border: `2px solid ${color}`,
            borderRadius: 20,
            padding: "28px 36px",
            boxShadow: `0 0 ${glowPulse}px ${color}40`,
          }}
        >
          <div
            style={{
              fontFamily: spaceGrotesk,
              fontSize: 26,
              fontWeight: 700,
              color,
              marginBottom: 10,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: 16,
              background: colors.bgSurface,
              padding: "5px 12px",
              borderRadius: 8,
              display: "inline-block",
            }}
          >
            {model}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {features.map((f, i) => {
              const featureOpacity = interpolate(
                frame,
                [enterFrame + 30 + i * 10, enterFrame + 45 + i * 10],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: inter,
                    fontSize: 15,
                    color: colors.textTertiary,
                    opacity: featureOpacity,
                  }}
                >
                  {f}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const Arrow: React.FC<{ x: number; enterFrame: number }> = ({ x, enterFrame }) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [enterFrame, enterFrame + 20], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [enterFrame, enterFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: AGENT_TOP + 100,
        opacity,
      }}
    >
      <svg width={80} height={40} viewBox="0 0 80 40">
        <line
          x1="0"
          y1="20"
          x2={width}
          y2="20"
          stroke={colors.gold}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {width > 60 && (
          <polygon
            points={`${width - 10},12 ${width},20 ${width - 10},28`}
            fill={colors.gold}
          />
        )}
      </svg>
    </div>
  );
};

export const SystemDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // Title fade in
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "You describe how you feel" text
  const inputTextOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Input bar animation
  const inputBarWidth = interpolate(frame, [90, 150], [0, 1000], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Typing effect
  const inputText = "My back has been hurting more this week and I've had some nasal congestion";
  const charsToShow = Math.floor(
    interpolate(frame, [100, 220], [0, inputText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Agents appear after typing
  const agentsEnter = 250;

  // Label at top of agents section
  const agentLabelOpacity = interpolate(frame, [agentsEnter - 20, agentsEnter], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      {/* Title */}
      <div
        style={{
          fontFamily: spaceGrotesk,
          fontSize: 56,
          fontWeight: 700,
          color: colors.textPrimary,
          textAlign: "center",
          opacity: titleOpacity,
          paddingTop: 50,
          marginBottom: 16,
        }}
      >
        Three AI Agents. One Pipeline.
      </div>

      {/* "You describe how you feel" */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 24,
          color: colors.textSecondary,
          textAlign: "center",
          opacity: inputTextOpacity,
          marginBottom: 30,
        }}
      >
        You describe how you feel. TRACE traces the chain.
      </div>

      {/* Input bar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: inputBarWidth,
            maxWidth: 1000,
            background: colors.bgElevated,
            border: `2px solid ${colors.gold}40`,
            borderRadius: 16,
            padding: "16px 28px",
            fontFamily: inter,
            fontSize: 20,
            color: colors.textPrimary,
            overflow: "hidden",
            whiteSpace: "nowrap",
            boxShadow: `0 0 20px ${colors.gold}15`,
          }}
        >
          {inputText.slice(0, charsToShow)}
          {charsToShow < inputText.length && (
            <span
              style={{
                opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0,
                color: colors.gold,
              }}
            >
              |
            </span>
          )}
        </div>
      </div>

      {/* Agent pipeline label */}
      <div
        style={{
          fontFamily: spaceGrotesk,
          fontSize: 14,
          fontWeight: 600,
          color: colors.textTertiary,
          textAlign: "center",
          letterSpacing: 4,
          opacity: agentLabelOpacity,
        }}
      >
        THREE-AGENT PIPELINE
      </div>

      {/* Agent boxes with icons */}
      <AgentBox
        label="Symptom Analyzer"
        model="Claude Sonnet 4.5"
        color={colors.chainSymptom}
        x={120}
        enterFrame={agentsEnter}
        features={["Parse symptoms", "Body systems", "Severity + temporal"]}
        iconFile="SymptomAnalyzerAgent.png"
      />
      <Arrow x={555} enterFrame={agentsEnter + 40} />
      <AgentBox
        label="Causal Chain Builder"
        model="Claude Opus 4.6"
        color={colors.chainMechanism}
        x={650}
        enterFrame={agentsEnter + 50}
        features={["Extended thinking", "MCP research", "Cross-system chains"]}
        iconFile="CausalChainBuilderAgent.png"
      />
      <Arrow x={1085} enterFrame={agentsEnter + 90} />
      <AgentBox
        label="Recommendation Agent"
        model="Claude Sonnet 4.5"
        color={colors.chainRoot}
        x={1180}
        enterFrame={agentsEnter + 100}
        features={["Actionable advice", "Urgency triage", "Doctor visit card"]}
        iconFile="Recommendation Agent.png"
      />

      {/* Extended thinking badge on middle agent */}
      {frame > agentsEnter + 70 && (
        <div
          style={{
            position: "absolute",
            left: 720,
            top: AGENT_TOP - 30,
            fontFamily: inter,
            fontSize: 13,
            fontWeight: 600,
            color: colors.chainMechanism,
            background: `${colors.chainMechanism}15`,
            border: `1px solid ${colors.chainMechanism}40`,
            borderRadius: 20,
            padding: "4px 14px",
            opacity: interpolate(frame, [agentsEnter + 70, agentsEnter + 85], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Extended Thinking Enabled
        </div>
      )}
    </div>
  );
};
