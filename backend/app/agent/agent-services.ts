import type { Iscript_agent, Iscript_agent_response } from "../types/agent-types";
import { OpenRouter } from "@openrouter/sdk";
import { evaluateScript } from "../evaluator/evaluator-service";
import type { IevaluationResult } from "../evaluator/evaluator-types";

const openRouterClient = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
  appTitle: "daemoncontent.online",
});

const MAX_RETRIES = 3;

const script_agent_prompt = (config: Iscript_agent, feedback?: string) => `
You are a script writer for a tech education Instagram Reels account.

## Account Identity
- Niche: Tech education — surviving and growing in the AI era
- Audience: Developers, CS students, indie hackers, tech builders
- Voice: Direct, slightly opinionated, no fluff, one concept per reel
- Format: Gaming background + AI voiceover + animated word-by-word captions

## Task
Write a voiceover script for a reel about: "${config.topic}"
${feedback ? `\n## Fix from previous attempt\n${feedback}\n` : ""}
## Rules
- Hook in the first 3 seconds — make someone stop scrolling
- One concept only — do not pack multiple ideas
- Contrarian or non-obvious angle preferred
- Punchy ending — strong opinion or soft CTA
- Length: ${config.length ?? "60–90 seconds when read aloud"} (~150–180 words)
- Language: ${config.language ?? "English"}
- Tone: ${config.tone ?? "direct, slightly opinionated, no fluff"}
- Style: ${config.style ?? "conversational, like talking to a fellow dev"}
- Format: ${config.format ?? "plain text only — no markdown, no bullets, no headers"}
- Purpose: ${config.purpose ?? "educate and build audience"}

## Hard constraints
- No filler phrases: "In today's video", "Don't forget to like", "Stay tuned"
- No buzzword soup: "leverage", "synergy", "game-changer"
- No lists read out loud — it sounds robotic
- Plain text only — Piper TTS will read everything literally

## Output
Return only the script. No title, no label, no explanation.
`;

const caption_prompt = (script: string) => `
Write a short Instagram caption for this reel.

## Voiceover script
"${script}"

## Rules
- 1–2 sentences describing what the video is about (not a quote from it)
- Then exactly 5 relevant hashtags on a new line
- No emojis, no CTAs, no markdown

## Output
Return only the caption. No label, no explanation.
`;

async function generateCaption(script: string): Promise<string> {
  const result = await openRouterClient.chat.send({
    chatRequest: {
      model: "nex-agi/nex-n2-pro:free",
      messages: [{ role: "user", content: caption_prompt(script) }],
    },
  });
  return result.choices[0]?.message.content?.trim() ?? "";
}

export const scriptAgentService = async (data: Iscript_agent): Promise<Iscript_agent_response> => {
  let lastScript = "";
  let lastEval: IevaluationResult | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const prompt = script_agent_prompt(data, lastEval?.feedback);

    const result = await openRouterClient.chat.send({
      chatRequest: {
        model: "nex-agi/nex-n2-pro:free",
        messages: [{ role: "user", content: prompt }],
      },
    });

    lastScript = result.choices[0]?.message.content ?? "";
    lastEval = await evaluateScript(lastScript);

    console.log(`[Agent] Attempt ${attempt} avg=${lastEval.average} passed=${lastEval.passed}`);

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
