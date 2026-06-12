import type { Iscript_agent } from "../types/agent-types";
import { scriptAgentService } from "./agent-services";
import { synthesize } from "./speech-service";
import { getRandomClipPath } from "./clip-service";
import { getWordTimestamps } from "../renderer/caption-service";
import { renderReel } from "../renderer/render";
import { ValidationError } from "../errors/app-error";
import path from "path";
import { unlink } from "node:fs/promises";

const OUTPUTS_DIR = path.resolve(import.meta.dir, "../../outputs");

export const scriptAgentController = async (req: Request): Promise<Response> => {
  const data = (await req.json()) as Iscript_agent;
  console.log("Received a request");

  if (!data?.topic) {
    throw new ValidationError("Topic is required");
  }

  const final_data = await scriptAgentService(data);
  console.log("Script generated successfully, converting to speech...");

  const outputPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp3`);
  await synthesize(final_data.script, outputPath);
  console.log("Audio saved, fetching word timestamps...");

  const captions = await getWordTimestamps(outputPath);
  console.log(`Got ${captions.length} word timestamps`);

  const clipPath = getRandomClipPath();

  const videoPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp4`);
  console.log("Rendering reel...");
  await renderReel({ audioPath: outputPath, captions, clipPath }, videoPath);
  console.log(`Reel saved to ${videoPath}`);

  await unlink(outputPath);
  console.log("Synthesized audio deleted");

  return Response.json({
    message: "Reel generated successfully",
    final_data,
    videoPath,
    captions,
  });
};
