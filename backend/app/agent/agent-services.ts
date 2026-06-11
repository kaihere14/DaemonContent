import type { Iscript_agent, Iscript_agent_response } from "../types/agent-types";
import { OpenRouter } from "@openrouter/sdk";
import { evaluateScript } from "../evaluator/evaluator-service";
import type { IevaluationResult } from "../evaluator/evaluator-types";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const openRouterClient = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
  appTitle: "daemoncontent.online",
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
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

export const synthesize = async (text: string, outputPath: string): Promise<void> => {
  const audio = await elevenlabs.textToSpeech.convert("pNInz6obpgDQGcFmaJgB", {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });

  const chunks: Uint8Array[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  await Bun.write(outputPath, buffer);
};

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

    console.log(`Attempt ${attempt} scores:`, lastEval.scores, `| passed: ${lastEval.passed}`);

    if (lastEval.passed) {
      return { script: lastScript, score: lastEval.average, reason: lastEval.feedback };
    }
  }

  return {
    script: lastScript,
    score: lastEval?.average ?? 0,
    reason: `Max retries reached. Last issue: ${lastEval?.feedback ?? "unknown"}`,
  };
};
