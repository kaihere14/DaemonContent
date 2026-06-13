import { OpenRouter } from "@openrouter/sdk";
import { Reel } from "../utils/models/reels-modal";
import { PromptConfig } from "../utils/models/prompt-config";
import { syncAllReelAnalytics } from "./sync";

const openRouterClient = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
  appTitle: "daemoncontent.online",
});

const EVOLVE_SYSTEM_PROMPT = `You are an AI prompt optimizer for a tech education Instagram Reels engine.

You will receive:
- Performance data from published reels (only reels with 48+ hours of data)
- Existing rules already saved for the topic agent and script agent

Your job is to produce a final, consolidated set of rules for each agent.
Merge the existing rules with insights from the new data. Keep only what is backed by evidence.

Rules for writing rules:
- Be specific and data-driven ("topics with avg_watch_time > 30s — prioritize this angle")
- No jargon, no filler, no vague advice ("be engaging", "create value", etc.)
- Remove any existing rule that contradicts the new data
- Remove duplicates and near-duplicates — keep the clearest version
- Each list should have at most 6 items total

Return a JSON object with this exact structure:
{
  "topic_agent": {
    "performance_rules": string[],
    "avoid_patterns": string[],
    "top_patterns": string[]
  },
  "script_agent": {
    "performance_rules": string[],
    "avoid_patterns": string[],
    "top_patterns": string[]
  }
}

Return only valid JSON. No markdown, no explanation.`;

interface EvolveResult {
  topic_version: number;
  script_version: number;
}

interface LLMEvolveResponse {
  topic_agent: {
    performance_rules: string[];
    avoid_patterns: string[];
    top_patterns: string[];
  };
  script_agent: {
    performance_rules: string[];
    avoid_patterns: string[];
    top_patterns: string[];
  };
}

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export async function evolvePrompts(): Promise<EvolveResult> {
  await syncAllReelAnalytics();

  const cutoff = new Date(Date.now() - FORTY_EIGHT_HOURS_MS);
  const reels = await Reel.find({
    analytics: { $ne: null },
    publishedAt: { $lt: cutoff },
  });

  if (reels.length === 0) {
    console.log("[Evolve] No reels older than 48 hours with analytics — skipping");
    const [topicCfg, scriptCfg] = await Promise.all([
      PromptConfig.findById("topic_generation_prompt"),
      PromptConfig.findById("script_generation_prompt"),
    ]);
    return { topic_version: topicCfg?.version ?? 0, script_version: scriptCfg?.version ?? 0 };
  }

  const performanceSummary = reels
    .map((r, i) => {
      const a = r.analytics!;
      const watchSec = (a.avg_watch_time_ms / 1000).toFixed(1);
      return `Reel ${i + 1}: topic="${r.topic}", views=${a.views}, reach=${a.reach}, saves=${a.saved}, shares=${a.shares}, likes=${a.likes}, avg_watch_time=${watchSec}s`;
    })
    .join("\n");

  const [topicConfig, scriptConfig] = await Promise.all([
    PromptConfig.findById("topic_generation_prompt"),
    PromptConfig.findById("script_generation_prompt"),
  ]);

  if (!topicConfig || !scriptConfig) {
    throw new Error("PromptConfig documents not found — run seed first");
  }

  const userMessage = `Performance data (reels with 48+ hours of data):
${performanceSummary}

Existing topic agent rules to consolidate:
performance_rules: ${JSON.stringify(topicConfig.performance_rules)}
avoid_patterns: ${JSON.stringify(topicConfig.avoid_patterns)}
top_patterns: ${JSON.stringify(topicConfig.top_patterns)}

Existing script agent rules to consolidate:
performance_rules: ${JSON.stringify(scriptConfig.performance_rules)}
avoid_patterns: ${JSON.stringify(scriptConfig.avoid_patterns)}
top_patterns: ${JSON.stringify(scriptConfig.top_patterns)}`;

  const result = await openRouterClient.chat.send({
    chatRequest: {
      model: "nex-agi/nex-n2-pro:free",
      messages: [{ role: "user", content: `${EVOLVE_SYSTEM_PROMPT}\n\n${userMessage}` }],
    },
  });

  const raw = result.choices[0]?.message.content?.trim() ?? "";
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  let parsed: LLMEvolveResponse;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`evolvePrompts: LLM returned invalid JSON:\n${raw}`);
  }

  const now = new Date();

  await Promise.all([
    PromptConfig.findByIdAndUpdate("topic_generation_prompt", {
      $set: {
        performance_rules: parsed.topic_agent.performance_rules,
        avoid_patterns: parsed.topic_agent.avoid_patterns,
        top_patterns: parsed.topic_agent.top_patterns,
        last_updated: now,
      },
      $inc: { version: 1 },
    }),
    PromptConfig.findByIdAndUpdate("script_generation_prompt", {
      $set: {
        performance_rules: parsed.script_agent.performance_rules,
        avoid_patterns: parsed.script_agent.avoid_patterns,
        top_patterns: parsed.script_agent.top_patterns,
        last_updated: now,
      },
      $inc: { version: 1 },
    }),
  ]);

  const [updatedTopic, updatedScript] = await Promise.all([
    PromptConfig.findById("topic_generation_prompt"),
    PromptConfig.findById("script_generation_prompt"),
  ]);

  console.log(
    `[Evolve] topic_version=${updatedTopic?.version} script_version=${updatedScript?.version}`
  );

  return {
    topic_version: updatedTopic?.version ?? 0,
    script_version: updatedScript?.version ?? 0,
  };
}
