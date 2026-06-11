import React from "react";
import { Composition, registerRoot } from "remotion";
import { ReelComposition } from "./ReelComposition";
import type { ReelProps } from "./ReelComposition";

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={ReelComposition as React.ComponentType<any>}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={90}
      defaultProps={
        {
          audioSrc: "",
          captions: [],
          clipSrc: "",
          clipStartFrame: 0,
          durationInFrames: 90,
        } as unknown as Record<string, unknown>
      }
      calculateMetadata={({ props }: { props: Record<string, unknown> }) => ({
        durationInFrames: (props as unknown as ReelProps).durationInFrames,
      })}
    />
  );
};

registerRoot(RemotionRoot);
