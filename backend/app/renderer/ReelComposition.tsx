import { AbsoluteFill, Audio, OffthreadVideo, useCurrentFrame, useVideoConfig } from "remotion";

export interface Caption {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface ReelProps {
  audioSrc: string;
  captions: Caption[];
  clipSrc: string;
  clipStartFrame: number;
  durationInFrames: number;
}

export function ReelComposition({ audioSrc, captions, clipSrc, clipStartFrame }: ReelProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentMs = (frame / fps) * 1000;
  const activeWord = captions.find((c) => currentMs >= c.start && currentMs < c.end);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={clipSrc}
        startFrom={clipStartFrame}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Audio src={audioSrc} />
      {activeWord && (
        <div
          style={{
            position: "absolute",
            bottom: "33%",
            left: 0,
            right: 0,
            textAlign: "center",
            padding: "0 48px",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 90,
              fontWeight: 900,
              fontFamily: "Arial Black, Arial, sans-serif",
              textShadow: "4px 4px 0 black, -2px -2px 0 black, 2px -2px 0 black, -2px 2px 0 black",
              letterSpacing: 2,
            }}
          >
            {activeWord.word}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
}
