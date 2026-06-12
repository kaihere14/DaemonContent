import { OpenRouter } from "@openrouter/sdk";
import type { IevaluationResult, IevaluationScores } from "./evaluator-types";

const openRouterClient = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
  appTitle: "daemoncontent.online",
});

const THRESHOLD = 7;

const evaluator_prompt = (script: string) => `
You are a strict content evaluator for a tech education Instagram Reels account.

## Script to evaluate
"${script}"

## Criteria (score each 1–10)
1. hook — Does the first sentence stop a scroll? Is it specific, bold, or provocative?
2. clarity — Exactly one concept? No topic bleed or tangents?
3. niche — Fits a tech/dev/builder audience?
4. voice — Direct, opinionated, no fluff, no filler phrases ("In today's video", "Don't forget to like", "synergy", "game-changer")?
5. length — Word count between 150–180 words (reads in ≤90 seconds)?

## Output
Respond ONLY with valid JSON. No explanation, no markdown fences.

{
  "scores": {
    "hook": <number>,
    "clarity": <number>,
    "niche": <number>,
    "voice": <number>,
    "length": <number>
  },
  "feedback": "<one sentence on the biggest failure, or 'all criteria passed' if all >= 7>"
}
`;

export const evaluateScript = async (script: string): Promise<IevaluationResult> => {
  const result = await openRouterClient.chat.send({
    chatRequest: {
      model: "nex-agi/nex-n2-pro:free",
      messages: [{ role: "user", content: evaluator_prompt(script) }],
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
