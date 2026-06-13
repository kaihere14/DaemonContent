import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IReelAnalytics {
  views: number;
  reach: number;
  saved: number;
  shares: number;
  comments: number;
  likes: number;
  avg_watch_time_ms: number;
  fetched_at: Date;
}

export interface IReel extends Document {
  instagramMediaId: string;
  topic: string;
  script: string;
  caption: string;
  completedIdeaRef?: Types.ObjectId;
  publishedAt: Date;
  analytics: IReelAnalytics | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReelAnalyticsSchema = new Schema<IReelAnalytics>(
  {
    views: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    saved: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    avg_watch_time_ms: { type: Number, default: 0 },
    fetched_at: { type: Date },
  },
  { _id: false }
);

const ReelSchema = new Schema<IReel>(
  {
    instagramMediaId: { type: String, required: true, unique: true, index: true },
    topic: { type: String, required: true, trim: true },
    script: { type: String, required: true },
    caption: { type: String, required: true },
    completedIdeaRef: { type: Schema.Types.ObjectId, ref: "CompletedIdea" },
    publishedAt: { type: Date, required: true, default: Date.now },
    analytics: { type: ReelAnalyticsSchema, default: null },
  },
  { timestamps: true }
);

export const Reel = mongoose.model<IReel>("Reel", ReelSchema);
