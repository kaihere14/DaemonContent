import path from "path";
import fs from "node:fs";
import { NotFoundError } from "../errors/app-error";

const CLIPS_DIR = path.resolve(import.meta.dir, "../../clips");

export function getRandomClipPath(): string {
  const files = fs.readdirSync(CLIPS_DIR).filter((f) => f.endsWith(".mp4"));

  if (files.length === 0) {
    throw new NotFoundError("No .mp4 clips found in backend/clips/");
  }

  const chosen = files[Math.floor(Math.random() * files.length)] as string;
  return path.join(CLIPS_DIR, chosen);
}
