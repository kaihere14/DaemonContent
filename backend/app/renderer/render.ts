import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import type { ReelProps } from "./ReelComposition";

export interface RenderReelInput {
  audioPath: string;
  captions: { word: string; start: number; end: number; confidence: number }[];
  clipPath: string;
}

const RENDER_STATE_PATH = path.resolve(import.meta.dir, "../../render-state.txt");

let bundleCache: string | null = null;
let fileServerUrl: string | null = null;

async function readLastStartSecs(): Promise<number | null> {
  const file = Bun.file(RENDER_STATE_PATH);
  if (!(await file.exists())) return null;
  const text = (await file.text()).trim();
  const val = parseFloat(text);
  return isNaN(val) ? null : val;
}

async function writeLastStartSecs(secs: number): Promise<void> {
  await Bun.write(RENDER_STATE_PATH, secs.toString());
}

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

async function getClipDurationSeconds(clipPath: string): Promise<number> {
  try {
    const result =
      await Bun.$`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${clipPath}`.text();
    const seconds = parseFloat(result.trim());
    if (isNaN(seconds) || seconds <= 0) {
      console.warn(`[render] ffprobe returned invalid duration for ${clipPath}`);
      return 0;
    }
    return seconds;
  } catch (e) {
    console.error(`[render] ffprobe failed for ${clipPath}:`, e);
    return 0;
  }
}

export async function renderReel(input: RenderReelInput, outputPath: string): Promise<string> {
  const { audioPath, captions, clipPath } = input;

  const lastCaption = captions.at(-1);
  const durationMs = lastCaption?.end ?? 3000;
  const fps = 30;
  const durationInFrames = Math.ceil((durationMs / 1000) * fps);
  const audioDurationSecs = durationMs / 1000;

  const clipDurationSecs = await getClipDurationSeconds(clipPath);
  const maxStartSecs = Math.max(0, clipDurationSecs - audioDurationSecs);

  const prevStartSecs = await readLastStartSecs();
  let clipStartSecs = 0;
  if (maxStartSecs > 0) {
    const MIN_DIFF = 5;
    let attempts = 0;
    do {
      clipStartSecs = Math.random() * maxStartSecs;
      attempts++;
    } while (
      prevStartSecs !== null &&
      Math.abs(clipStartSecs - prevStartSecs) < MIN_DIFF &&
      attempts < 20
    );
  }

  await writeLastStartSecs(clipStartSecs);
  const clipStartFrame = Math.floor(clipStartSecs * fps);

  console.log(
    `[render] Clip: ${clipPath.split("/").pop()} | duration=${clipDurationSecs.toFixed(1)}s | audio=${audioDurationSecs.toFixed(1)}s | maxStart=${maxStartSecs.toFixed(1)}s | startAt=${clipStartSecs.toFixed(1)}s (frame ${clipStartFrame}) | prev=${prevStartSecs !== null ? prevStartSecs.toFixed(1) + "s" : "none"}`
  );

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
