import {
  PromptConfig,
  type IPromptConfig,
  type PromptConfigId,
} from "../utils/models/prompt-config";

async function loadPromptConfig(id: PromptConfigId): Promise<IPromptConfig> {
  const config = await PromptConfig.findById(id);
  if (!config) throw new Error(`PromptConfig not found in DB: ${id}`);
  return config;
}

function assemblePrompt(config: IPromptConfig): string {
  const parts = [config.base_prompt];

  if (config.performance_rules.length > 0) {
    parts.push("## Performance Rules\n" + config.performance_rules.map((r) => `- ${r}`).join("\n"));
  }
  if (config.top_patterns.length > 0) {
    parts.push(
      "## Top Patterns (use these approaches)\n" +
        config.top_patterns.map((p) => `- ${p}`).join("\n")
    );
  }
  if (config.avoid_patterns.length > 0) {
    parts.push("## Patterns to Avoid\n" + config.avoid_patterns.map((p) => `- ${p}`).join("\n"));
  }

  return parts.join("\n\n");
}

export async function getScriptGenerationBase(): Promise<string> {
  const config = await loadPromptConfig("script_generation_prompt");
  return assemblePrompt(config);
}

export async function getTopicGenerationBase(): Promise<string> {
  const config = await loadPromptConfig("topic_generation_prompt");
  return assemblePrompt(config);
}
