import mongoose, { Schema } from "mongoose";

export type PromptConfigId = "script_generation_prompt" | "topic_generation_prompt";

export interface IPromptConfig {
  _id: PromptConfigId;
  base_prompt: string;
  performance_rules: string[];
  avoid_patterns: string[];
  top_patterns: string[];
  last_updated: Date;
  version: number;
}

const PromptConfigSchema = new Schema<IPromptConfig>({
  _id: { type: String },
  base_prompt: { type: String, required: true },
  performance_rules: [{ type: String }],
  avoid_patterns: [{ type: String }],
  top_patterns: [{ type: String }],
  last_updated: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
});

export const PromptConfig = mongoose.model<IPromptConfig>("PromptConfig", PromptConfigSchema);
