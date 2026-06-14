import { evolvePrompts } from "../analytics/evolve";
import { generateNewTopic } from "../agent/agent-services";
import { scriptAgentController } from "../agent/agent-controller";
import { aiDataCallPrompt } from "../prompt/prompts";
import { CompletedIdea } from "../utils/models/completed-idea";
import type { Iscript_agent } from "../types/agent-types";

export const runPipeline = async (_req: Request): Promise<Response> => {
  console.log("[Pipeline] ⚡ Wake-up triggered");

  // Step 1: Sync analytics + evolve prompts
  console.log("[Pipeline] Step 1 — Syncing analytics and evolving prompts...");
  const evolveResult = await evolvePrompts();
  console.log(
    `[Pipeline] Prompts evolved — topic_v${evolveResult.topic_version} script_v${evolveResult.script_version}`
  );

  // Step 2: Generate new topic using updated prompts
  console.log("[Pipeline] Step 2 — Generating new topic...");
  const completedTopics = await CompletedIdea.find();
  const prompt = await aiDataCallPrompt(completedTopics);
  const rawTopic = (await generateNewTopic(prompt)) as string;
  const parsedTopic: Iscript_agent = JSON.parse(rawTopic);
  console.log(`[Pipeline] Topic selected: "${parsedTopic.topic}"`);

  // Step 3: Script → Audio → Captions → Render → Publish
  console.log("[Pipeline] Step 3 — Running content pipeline...");
  const result = await scriptAgentController(parsedTopic);
  console.log("[Pipeline] ✅ Pipeline complete");

  return Response.json({
    ok: true,
    evolve: evolveResult,
    topic: parsedTopic.topic,
    ...result,
  });
};
