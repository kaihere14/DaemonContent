import path from "path";
import { unlink } from "node:fs/promises";

const BASE = "https://graph.instagram.com/v25.0";
const POLL_INTERVAL_MS = 60_000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

async function transcodeForInstagram(inputPath: string): Promise<string> {
  const outputPath = inputPath.replace(/\.mp4$/, "_ig.mp4");
  console.log(`[Instagram] Transcoding ${path.basename(inputPath)}...`);
  await Bun.$`ffmpeg -y -i ${inputPath} -pix_fmt yuv420p -c:v libx264 -profile:v high -level 4.0 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -b:v 3500k -c:a aac -ar 44100 -b:a 128k -movflags +faststart ${outputPath}`.quiet();
  return outputPath;
}

export async function publishReel(videoPath: string, caption: string): Promise<string> {
  const token = process.env.META_ACCESS_TOKEN!;
  const accountId = process.env.META_INSTAGRAM_ACCOUNT_ID!;
  const publicUrl = process.env.PUBLIC_URL!;

  const transcodedPath = await transcodeForInstagram(videoPath);
  const videoUrl = `${publicUrl}/outputs/${path.basename(transcodedPath)}`;

  // Step 1: Create container
  const createRes = await fetch(`${BASE}/${accountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "REELS",
      video_url: videoUrl,
      caption,
      access_token: token,
    }),
  });
  const createData = (await createRes.json()) as { id?: string; error?: { message: string } };
  if (!createData.id) throw new Error(`Container creation failed: ${createData.error?.message}`);
  const containerId = createData.id;
  console.log(`[Instagram] Container created: ${containerId}`);

  // Step 2: Poll until FINISHED
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let attempt = 0;
  while (Date.now() < deadline) {
    await Bun.sleep(POLL_INTERVAL_MS);
    attempt++;
    const statusRes = await fetch(
      `${BASE}/${containerId}?fields=status_code,status&access_token=${token}`
    );
    const raw = await statusRes.text();
    const statusData = JSON.parse(raw) as {
      status_code?: string;
      error?: { is_transient?: boolean };
    };

    if (statusData.error?.is_transient) continue;

    const code = statusData.status_code;
    console.log(`[Instagram] Poll #${attempt}: ${code}`);

    if (code === "FINISHED") break;
    if (code === "ERROR") throw new Error(`Instagram container error: ${raw}`);
    if (Date.now() >= deadline)
      throw new Error(`Polling timed out after ${POLL_TIMEOUT_MS / 1000}s`);
  }

  // Step 3: Publish
  const publishRes = await fetch(`${BASE}/${accountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: containerId, access_token: token }),
  });
  const publishData = (await publishRes.json()) as { id?: string; error?: { message: string } };
  if (!publishData.id) throw new Error(`Publish failed: ${publishData.error?.message}`);

  await unlink(transcodedPath).catch(() => {});
  return publishData.id;
}
