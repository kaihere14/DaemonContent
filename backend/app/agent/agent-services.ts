import type { Iscript_agent, Iscript_agent_response } from "../types/agent-types";
import { OpenRouter } from "@openrouter/sdk";
import { evaluateScript } from "../evaluator/evaluator-service";
import type { IevaluationResult } from "../evaluator/evaluator-types";
import { captionPrompt, scriptAgentPrompt } from "../prompt/prompts";

const openRouterClient = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
  appTitle: "daemoncontent.online",
});

const MAX_RETRIES = 3;

async function generateCaption(script: string): Promise<string> {
  const result = await openRouterClient.chat.send({
    chatRequest: {
      model: "nex-agi/nex-n2-pro:free",
      messages: [{ role: "user", content: captionPrompt(script) }],
    },
  });
  return result.choices[0]?.message.content?.trim() ?? "";
}

export const scriptAgentService = async (data: Iscript_agent): Promise<Iscript_agent_response> => {
  let lastScript = "";
  let lastEval: IevaluationResult | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const prompt = await scriptAgentPrompt(data, lastEval?.feedback);

    const result = await openRouterClient.chat.send({
      chatRequest: {
        model: "nex-agi/nex-n2-pro:free",
        messages: [{ role: "user", content: prompt }],
      },
    });

    lastScript = result.choices[0]?.message.content ?? "";
    lastEval = await evaluateScript(lastScript);

    console.log(
      `[Evaluator] avg=${lastEval.average} passed=${lastEval.passed} (attempt ${attempt})`
    );

    if (lastEval.passed) break;
  }

  const caption = await generateCaption(lastScript);

  return {
    script: lastScript,
    caption,
    score: lastEval?.average ?? 0,
    reason: lastEval?.feedback ?? "unknown",
  };
};

export const generateNewTopic = async (prompt: string): Promise<string> => {
  const result = await openRouterClient.chat.send({
    chatRequest: {
      model: "nex-agi/nex-n2-pro:free",
      messages: [{ role: "user", content: prompt }],
    },
  });
  return result.choices[0]?.message.content ?? "";
};
