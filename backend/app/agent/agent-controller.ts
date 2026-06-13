import type { Iscript_agent, Iscript_agent_response } from "../types/agent-types";
import { generateNewTopic, scriptAgentService } from "./agent-services";
import { synthesize } from "./speech-service";
import { getRandomClipPath } from "./clip-service";
import { getWordTimestamps } from "../renderer/caption-service";
import { renderReel } from "../renderer/render";
import { publishReel } from "../poster/instagram";
import { ValidationError } from "../errors/app-error";
import { CompletedIdea } from "../utils/models/completed-idea";
import { aiDataCallPrompt } from "../prompt/prompts";
import { Reel } from "../utils/models/reels-modal";
import path from "path";
import { unlink } from "node:fs/promises";

const OUTPUTS_DIR = path.resolve(import.meta.dir, "../../outputs");

export const userDataCall = async (req: Request): Promise<Response> => {
  const data = (await req.json()) as Iscript_agent;
  if (!data?.topic) {
    throw new ValidationError("Topic is required");
  }
  const final_data = await scriptAgentController(data);
  return Response.json(final_data);
};

export const aiDataCall = async (req: Request): Promise<Response> => {
  console.log("[DB] Fetching completed ideas...");
  const completedTopics = await CompletedIdea.find();
  console.log(`[DB] Fetched ${completedTopics.length} completed ideas`);
  const prompt = aiDataCallPrompt(completedTopics);
  console.log("[Agent] Generated prompt for new topic");
  const result = (await generateNewTopic(prompt)) as string;
  const parsedResult: Iscript_agent = JSON.parse(result);
  console.log("[Agent] Parsed new topic:", parsedResult.topic);
  const final_result = await scriptAgentController(parsedResult);
  console.log("[Agent] Pipeline complete, reel uploaded");

  return Response.json({ message: "All done successfully", final_result });
};

export const scriptAgentController = async (
  data: Iscript_agent
): Promise<Iscript_agent_response> => {
  console.log("[Agent] Started working for topic:", data.topic);
  if (!data?.topic) {
    throw new ValidationError("Topic is required");
  }

  const final_data = await scriptAgentService(data);
  console.log(`[Agent] Script approved (score=${final_data.score})`);

  const completedIdea = await CompletedIdea.create({
    topic: data.topic,
    script: final_data.script,
    caption: final_data.caption,
    score: final_data.score,
    evaluationFeedback: final_data.reason,
    config: {
      length: data.length,
      language: data.language,
      tone: data.tone,
      style: data.style,
      format: data.format,
      purpose: data.purpose,
    },
  });
  console.log(`[DB] Saved completed idea: ${completedIdea._id}`);

  const audioPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp3`);
  console.log("[Speech] Synthesizing audio...");
  await synthesize(final_data.script, audioPath);

  const captions = await getWordTimestamps(audioPath);
  console.log(`[Caption] Got ${captions.length} word timestamps`);

  const clipPath = getRandomClipPath();
  const videoPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp4`);

  console.log("[Render] Rendering reel...");
  await renderReel({ audioPath, captions, clipPath }, videoPath);

  const postId = await publishReel(videoPath, final_data.caption);
  console.log(`[Instagram] Published reel: ${postId}`);

  await Reel.create({
    instagramMediaId: postId,
    topic: data.topic,
    script: final_data.script,
    caption: final_data.caption,
    completedIdeaRef: completedIdea._id,
    publishedAt: new Date(),
  });
  console.log(`[DB] Saved reel record: ${postId}`);

  await Promise.allSettled([unlink(audioPath), unlink(videoPath)]);

  return {
    message: "Reel published successfully",
    postId,
    script: final_data.script,
    caption: final_data.caption,
    score: final_data.score,
    reason: final_data.reason,
  };
};
