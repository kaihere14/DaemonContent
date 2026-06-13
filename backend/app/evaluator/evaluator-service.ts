import { OpenRouter } from "@openrouter/sdk";
import type { IevaluationResult, IevaluationScores } from "./evaluator-types";
import { evaluatorPrompt } from "../prompt/prompts";

const openRouterClient = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
  appTitle: "daemoncontent.online",
});

const THRESHOLD = 7;

export const evaluateScript = async (script: string): Promise<IevaluationResult> => {
  const result = await openRouterClient.chat.send({
    chatRequest: {
      model: "nex-agi/nex-n2-pro:free",
      messages: [{ role: "user", content: evaluatorPrompt(script) }],
    },
  });

  const raw = result.choices[0]?.message.content ?? "{}";
  const parsed = JSON.parse(raw) as { scores: IevaluationScores; feedback: string };

  const scores = parsed.scores;
  const values = Object.values(scores);
  const passed = values.every((s) => s >= THRESHOLD);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return { scores, passed, average, feedback: parsed.feedback };
};
