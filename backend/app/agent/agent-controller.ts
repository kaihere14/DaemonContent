import type { Iscript_agent } from "../types/agent-types";
import { scriptAgentService } from "./agent-services";
import { synthesize } from "./speech-service";
import { getRandomClipPath } from "./clip-service";
import { getWordTimestamps } from "../renderer/caption-service";
import { renderReel } from "../renderer/render";
import { publishReel } from "../poster/instagram";
import { ValidationError } from "../errors/app-error";
import path from "path";
import { unlink } from "node:fs/promises";

const OUTPUTS_DIR = path.resolve(import.meta.dir, "../../outputs");

export const scriptAgentController = async (req: Request): Promise<Response> => {
  const data = (await req.json()) as Iscript_agent;
  console.log("[Agent] Started working for the topic : ", data.topic);
  if (!data?.topic) {
    throw new ValidationError("Topic is required");
  }

  const final_data = await scriptAgentService(data);
  console.log("[Agent] Script ready, synthesizing audio...");

  const audioPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp3`);
  await synthesize(final_data.script, audioPath);

  const captions = await getWordTimestamps(audioPath);
  console.log(`[Agent] Got ${captions.length} word timestamps`);

  const clipPath = getRandomClipPath();
  const videoPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp4`);

  console.log("[Agent] Rendering reel...");
  await renderReel({ audioPath, captions, clipPath }, videoPath);

  const postId = await publishReel(videoPath, final_data.caption);
  console.log(`[Agent] Published to Instagram: ${postId}`);

  await Promise.allSettled([unlink(audioPath), unlink(videoPath)]);

  return Response.json({
    message: "Reel published successfully",
    postId,
    script: final_data.script,
    caption: final_data.caption,
    score: final_data.score,
  });
};
