import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import type { ReelProps } from "./ReelComposition";

export interface RenderReelInput {
  audioPath: string;
  captions: { word: string; start: number; end: number; confidence: number }[];
  clipPath: string;
}

let bundleCache: string | null = null;
let fileServerUrl: string | null = null;

function getFileServerUrl(): string {
  if (fileServerUrl) return fileServerUrl;

  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const filePath = new URL(req.url).searchParams.get("f");
      if (!filePath) return new Response(null, { status: 404 });
      return new Response(Bun.file(filePath));
    },
  });

  fileServerUrl = `http://localhost:${server.port}`;
  return fileServerUrl;
}

function toFileUrl(serverUrl: string, absolutePath: string): string {
  return `${serverUrl}?f=${encodeURIComponent(absolutePath)}`;
}

async function getBundle(): Promise<string> {
  if (bundleCache) return bundleCache;

  process.stdout.write("Bundling Remotion composition...\n");
  bundleCache = await bundle({
    entryPoint: path.resolve(import.meta.dir, "./Root.tsx"),
    onProgress: (progress) => {
      process.stdout.write(`\rBundling: ${progress}%   `);
    },
  });
  process.stdout.write("\nBundle ready.\n");
  return bundleCache;
}

async function getClipDurationFrames(clipPath: string, fps: number): Promise<number> {
  const proc = Bun.spawn(
    [
      "ffprobe",
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      clipPath,
    ],
    { stdout: "pipe", stderr: "pipe" }
  );
  const text = await new Response(proc.stdout).text();
  const seconds = parseFloat(text.trim());
  return isNaN(seconds) ? 0 : Math.floor(seconds * fps);
}

export async function renderReel(input: RenderReelInput, outputPath: string): Promise<string> {
  const { audioPath, captions, clipPath } = input;

  const lastCaption = captions.at(-1);
  const durationMs = lastCaption?.end ?? 3000;
  const fps = 30;
  const durationInFrames = Math.ceil((durationMs / 1000) * fps);

  const clipTotalFrames = await getClipDurationFrames(clipPath, fps);
  const maxStart = Math.max(0, clipTotalFrames - durationInFrames);
  const clipStartFrame = Math.floor(Math.random() * maxStart);

  const serverUrl = getFileServerUrl();

  const props: ReelProps = {
    audioSrc: toFileUrl(serverUrl, path.resolve(audioPath)),
    captions,
    clipSrc: toFileUrl(serverUrl, path.resolve(clipPath)),
    clipStartFrame,
    durationInFrames,
  };

  const serveUrl = await getBundle();
  const inputProps = props as unknown as Record<string, unknown>;

  const composition = await selectComposition({
    serveUrl,
    id: "Reel",
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
  });

  return outputPath;
}
