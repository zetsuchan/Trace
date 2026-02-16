import { useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { spaceGrotesk, inter } from "../fonts";
import { colors } from "../colors";

const MCP_ICON_SIZE = 70;

const Box: React.FC<{
  label: string;
  sublabel?: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  enterFrame: number;
  iconFile?: string;
}> = ({ label, sublabel, color, x, y, w, h, enterFrame, iconFile }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const opacity = interpolate(frame, [enterFrame, enterFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const iconScale = spring({
    frame: frame - (enterFrame - 8),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const iconOpacity = interpolate(frame, [enterFrame - 8, enterFrame + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {iconFile && (
        <div
          style={{
            position: "absolute",
            left: x + (w - MCP_ICON_SIZE) / 2,
            top: y - MCP_ICON_SIZE - 6,
            width: MCP_ICON_SIZE,
            height: MCP_ICON_SIZE,
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
              width: MCP_ICON_SIZE,
              height: MCP_ICON_SIZE,
              objectFit: "contain",
            }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          background: colors.bgElevated,
          border: `2px solid ${color}`,
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: spaceGrotesk,
            fontSize: 20,
            fontWeight: 700,
            color,
            textAlign: "center",
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            style={{
              fontFamily: inter,
              fontSize: 14,
              fontWeight: 400,
              color: colors.textTertiary,
              textAlign: "center",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </>
  );
};

const AnimatedArrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  enterFrame: number;
  vertical?: boolean;
}> = ({ x1, y1, x2, y2, enterFrame, vertical }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [enterFrame, enterFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const currentX2 = x1 + (x2 - x1) * progress;
  const currentY2 = y1 + (y2 - y1) * progress;

  if (progress <= 0) return null;

  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={currentX2}
        y2={currentY2}
        stroke={colors.gold}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {progress > 0.8 && (
        <circle cx={currentX2} cy={currentY2} r="5" fill={colors.gold} />
      )}
    </svg>
  );
};

export const ArchDiagram: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Row 1: Three agents
  const agentY = 280;
  const agentH = 100;
  const agentW = 320;

  // Row 2: MCP tools (pushed down for icons above)
  const mcpY = 550;
  const mcpH = 80;
  const mcpW = 200;

  // Row 3: Database (pushed down for icon above)
  const dbY = 760;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        position: "relative",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontFamily: spaceGrotesk,
            fontSize: 48,
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: 10,
          }}
        >
          Architecture
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 22,
            color: colors.textSecondary,
          }}
        >
          SSE streaming · MCP integrations · Extended thinking
        </div>
      </div>

      {/* SSE badge */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [30, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 600,
            color: colors.accentSafe,
            background: `${colors.accentSafe}15`,
            border: `1px solid ${colors.accentSafe}30`,
            borderRadius: 20,
            padding: "6px 20px",
            letterSpacing: 2,
          }}
        >
          SSE STREAM VIA READABLESTREAM
        </span>
      </div>

      {/* Agent boxes */}
      <Box label="Symptom Analyzer" sublabel="Sonnet 4.5" color={colors.chainSymptom} x={160} y={agentY} w={agentW} h={agentH} enterFrame={60} />
      <Box label="Causal Chain Builder" sublabel="Opus 4.6 + Thinking" color={colors.chainMechanism} x={580} y={agentY} w={agentW} h={agentH} enterFrame={90} />
      <Box label="Recommendation Agent" sublabel="Sonnet 4.5" color={colors.chainRoot} x={1000} y={agentY} w={agentW} h={agentH} enterFrame={120} />

      {/* Arrows between agents */}
      <AnimatedArrow x1={480} y1={agentY + agentH / 2} x2={580} y2={agentY + agentH / 2} enterFrame={80} />
      <AnimatedArrow x1={900} y1={agentY + agentH / 2} x2={1000} y2={agentY + agentH / 2} enterFrame={110} />

      {/* MCP tools */}
      <Box label="Exa Search" color={colors.gold} x={380} y={mcpY} w={mcpW} h={mcpH} enterFrame={150} iconFile="Exa.png" />
      <Box label="FireCrawl" color={colors.gold} x={620} y={mcpY} w={mcpW} h={mcpH} enterFrame={170} iconFile="Firecrawl.png" />
      <Box label="Obsidian" color={colors.gold} x={860} y={mcpY} w={mcpW} h={mcpH} enterFrame={190} iconFile="Obsidian.png" />

      {/* Vertical arrows from Causal Chain Builder to MCP tools */}
      <AnimatedArrow x1={740} y1={agentY + agentH} x2={480} y2={mcpY} enterFrame={140} vertical />
      <AnimatedArrow x1={740} y1={agentY + agentH} x2={720} y2={mcpY} enterFrame={160} vertical />
      <AnimatedArrow x1={740} y1={agentY + agentH} x2={960} y2={mcpY} enterFrame={180} vertical />

      {/* MCP label */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: mcpY + 25,
          opacity: interpolate(frame, [150, 170], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 600,
            color: colors.gold,
            letterSpacing: 2,
          }}
        >
          MCP TOOLS
        </span>
      </div>

      {/* Database */}
      <Box label="PostgreSQL · 10 Tables" sublabel="Drizzle ORM · Apple Health Data Export" color={colors.accentSafe} x={520} y={dbY} w={440} h={mcpH} enterFrame={220} iconFile="Postgres.png" />
      <AnimatedArrow x1={740} y1={mcpY + mcpH} x2={740} y2={dbY} enterFrame={210} vertical />

      {/* Tech stack labels */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          opacity: interpolate(frame, [250, 280], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {["Next.js 16", "React 19", "React Flow", "Tailwind v4", "TypeScript"].map((tech, i) => (
          <span
            key={i}
            style={{
              fontFamily: inter,
              fontSize: 16,
              color: colors.textTertiary,
              background: colors.bgElevated,
              padding: "8px 18px",
              borderRadius: 8,
              border: `1px solid ${colors.chainConnection}`,
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
};
