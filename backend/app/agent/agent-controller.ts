import type { Iscript_agent } from "../types/agent-types";
import { scriptAgentService, synthesize } from "./agent-services";
import { getWordTimestamps } from "../renderer/caption-service";
import { renderReel } from "../renderer/render";
import path from "path";
import fs from "node:fs";

const OUTPUTS_DIR = path.resolve(import.meta.dir, "../../outputs");
const CLIPS_DIR = path.resolve(import.meta.dir, "../../clips");

export const scriptAgentController = async (req: Request): Promise<Response> => {
  try {
    const data = (await req.json()) as Iscript_agent;
    console.log("Received a request");

    if (!data?.topic) {
      return Response.json({ message: "Topic is required" }, { status: 400 });
    }

    const final_data = await scriptAgentService(data);
    console.log("Script generated successfully, converting to speech...");

    const outputPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp3`);
    await synthesize(final_data.script, outputPath);
    console.log("Audio saved, fetching word timestamps...");

    const captions = await getWordTimestamps(outputPath);
    console.log(`Got ${captions.length} word timestamps`);

    const clips = fs.readdirSync(CLIPS_DIR).filter((f) => f.endsWith(".mp4"));
    if (clips.length === 0) throw new Error("No .mp4 clips found in backend/clips/");
    const clipPath = path.join(
      CLIPS_DIR,
      clips[Math.floor(Math.random() * clips.length)] as string
    );

    const videoPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp4`);
    console.log("Rendering reel...");
    await renderReel({ audioPath: outputPath, captions, clipPath }, videoPath);
    console.log(`Reel saved to ${videoPath}`);

    return Response.json({
      message: "Reel generated successfully",
      final_data,
      videoPath,
      captions,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
};
