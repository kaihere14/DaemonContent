import mongoose, { Schema, type Document } from "mongoose";

export interface ICompletedIdea extends Document {
  topic: string;
  script: string;
  caption: string;
  score: number;
  evaluationFeedback: string;
  config: {
    length?: string;
    language?: string;
    tone?: string;
    style?: string;
    format?: string;
    purpose?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompletedIdeaSchema = new Schema<ICompletedIdea>(
  {
    topic: { type: String, required: true, trim: true },
    script: { type: String, required: true },
    caption: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    evaluationFeedback: { type: String, default: "" },
    config: {
      length: String,
      language: String,
      tone: String,
      style: String,
      format: String,
      purpose: String,
    },
  },
  { timestamps: true }
);

export const CompletedIdea = mongoose.model<ICompletedIdea>("CompletedIdea", CompletedIdeaSchema);
