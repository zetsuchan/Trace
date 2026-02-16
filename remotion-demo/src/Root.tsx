import { Composition } from "remotion";
import { TraceDemo } from "./TraceDemo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="TraceDemo"
      component={TraceDemo}
      durationInFrames={5415}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
