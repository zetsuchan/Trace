import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { HookText } from "./scenes/HookText";
import { LogoReveal } from "./scenes/LogoReveal";
import { StorySection } from "./scenes/StorySection";
import { SystemDemo } from "./scenes/SystemDemo";
import { ArchDiagram } from "./scenes/ArchDiagram";
import { VisionSection } from "./scenes/VisionSection";
import { ClosingCard } from "./scenes/ClosingCard";

// Video plan timing (30fps):
// Hook:         0:00-0:15  = 450 frames
// Logo:         0:15-0:18  = 90 frames
// Story:        0:18-0:45  = 810 frames
// System Demo:  0:45-1:35  = 1500 frames
// Architecture: 1:35-2:00  = 750 frames
// Vision:       2:00-2:50  = 1500 frames
// Close:        2:50-3:00  = 300 frames
// Total = 5400 frames, minus transitions

// With 6 transitions at 15 frames each = 90 frames subtracted
// So we add ~15 frames to each scene to compensate
const TRANSITION_FRAMES = 15;

export const TraceDemo: React.FC = () => {
  return (
    <TransitionSeries>
      {/* 1. Hook Text — 3 lines fading in */}
      <TransitionSeries.Sequence durationInFrames={465}>
        <HookText />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 2. Logo Reveal — TRACE with gold glow */}
      <TransitionSeries.Sequence durationInFrames={105}>
        <LogoReveal />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 3. Story — Personal narrative with floating cells */}
      <TransitionSeries.Sequence durationInFrames={825}>
        <StorySection />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 4. System Demo — Input + Three agents pipeline */}
      <TransitionSeries.Sequence durationInFrames={1515}>
        <SystemDemo />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 5. Architecture Diagram — Technical layout */}
      <TransitionSeries.Sequence durationInFrames={765}>
        <ArchDiagram />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 6. Vision — Universal application + stats */}
      <TransitionSeries.Sequence durationInFrames={1515}>
        <VisionSection />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 7. Closing Card — Logo + tagline + GitHub */}
      <TransitionSeries.Sequence durationInFrames={315}>
        <ClosingCard />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
