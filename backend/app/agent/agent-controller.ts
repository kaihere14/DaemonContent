import type { Iscript_agent, Iscript_agent_response } from "../types/agent-types";
import { generateNewTopic, scriptAgentService } from "./agent-services";
import { synthesize } from "./speech-service";
import { getRandomClipPath } from "./clip-service";
import { getWordTimestamps } from "../renderer/caption-service";
import { renderReel } from "../renderer/render";
import { publishReel } from "../poster/instagram";
import { ValidationError } from "../errors/app-error";
import { CompletedIdea, type ICompletedIdea } from "../utils/models/completed-idea";
import { Reel } from "../utils/models/reels-modal";
import path from "path";
import { unlink } from "node:fs/promises";

const OUTPUTS_DIR = path.resolve(import.meta.dir, "../../outputs");

export const userDataCall = async (req: Request): Promise<Response> => {
  const data = (await req.json()) as Iscript_agent;
  if (!data?.topic) {
    throw new ValidationError("Topic is required");
  }
  const final_data = await scriptAgentController(data);
  return Response.json(final_data);
};

const aiDataCallPrompt = (completedIdeas: ICompletedIdea[]) => {
  const hasExistingIdeas = completedIdeas.length > 0;

  return `
# Role and Goal

You are a world-class **Instagram Content Strategist and Idea Generator**.
Your mission is to ${hasExistingIdeas ? "analyze a list of previously created Instagram reels and generate **exactly 1 brand-new, non-duplicate content idea**" : "generate **exactly 1 strong content idea**"} that fits naturally within the niche but brings a **fresh angle, style, and format**.

You do NOT replicate or remix existing content. You generate something genuinely new.

${
  hasExistingIdeas
    ? `
# Input Analysis (Context)

You will receive a list of \`completedIdeas\`, each including:
- \`topic\`: What the reel was about
- \`script\`: The spoken content
- \`caption\`: The Instagram caption
- \`score\`: A quality score (0–10)
- \`evaluationFeedback\`: Previous analysis notes
- \`config\`: Original creation parameters (length, language, tone, style, format, purpose)
`
    : ""
}

# Your Task

${
  hasExistingIdeas
    ? `
1. **Analyze the niche** — Identify the core subject area, audience, and content themes from the completed ideas.
2. **Identify gaps** — Find angles, perspectives, formats, or sub-topics that have NOT been covered yet.
3. **Generate 1 new idea** — Create a fresh topic that:
   - Fits within the inferred niche
   - Has NOT been covered in any existing topic (no duplicates, no remixes)
   - Uses a **fresh style, tone, and format** (do not copy existing config values)
   - Has strong viral and engagement potential
`
    : `
1. **Use the base niche** — The content niche is **tech education for Instagram**. This includes:
   - Teaching or explaining new frameworks, libraries, or tools
   - Breaking down recent tech news or releases
   - Simplifying complex engineering or CS concepts
   - Developer productivity tips and workflows
   - Comparing technologies (e.g. X vs Y)
   - Career advice for developers
2. **Generate 1 strong idea** — Create a fresh topic that:
   - Is relevant, timely, and specific (not generic like "Learn JavaScript")
   - Has strong viral and engagement potential for a tech-savvy audience
   - Uses an engaging style suited to short-form video
`
}

# Output Structure (Required JSON Format)

Your response MUST be a valid JSON object with this exact structure:

{
  "topic": "<concise, compelling topic title>",
  "length": "<short | medium | long>",
  "language": "<language code or name, e.g. English>",
  "tone": "<e.g. motivational | educational | conversational | controversial | humorous | storytelling>",
  "style": "<e.g. talking head | voiceover | text-on-screen | interview | tutorial | listicle>",
  "format": "<e.g. reel | carousel | story>",
  "purpose": "<e.g. awareness | engagement | lead generation | entertainment | education>"
}

${
  hasExistingIdeas
    ? `
# Niche Inference Rules

- Infer the **niche and audience** from the topics and scripts of completed ideas
- Keep the new topic **relevant to the same niche**
- Do NOT copy \`tone\`, \`style\`, or \`format\` from any single existing config — introduce variety

# Uniqueness Rules

- The new topic must be **semantically distinct** from all existing topics
- No synonym swaps or slight reframes of existing topics
- Avoid formats and styles already used more than once in the input
`
    : ""
}

# Output Constraints

- Return ONLY the JSON object — no commentary, no markdown, no explanation
- All fields are required
- \`topic\` must be specific and compelling, not generic

${
  hasExistingIdeas
    ? `
# Completed Ideas (Input)

${JSON.stringify(completedIdeas, null, 2)}
`
    : ""
}
  `;
};

export const aiDataCall = async (req: Request): Promise<Response> => {
  console.log("Fetching completed tasks...");
  const completedTopics = await CompletedIdea.find();
  console.log("completed topics fetched successfully");
  const prompt = aiDataCallPrompt(completedTopics);
  console.log("prompt generated for new topic...");
  const result = (await generateNewTopic(prompt)) as string;
  const parsedResult: Iscript_agent = JSON.parse(result);
  console.log("prompt parsed...");
  const final_result = await scriptAgentController(parsedResult);
  console.log("final result generated and reel got uploaded");

  return Response.json({ message: "All done successfully", final_result });
};

export const scriptAgentController = async (
  data: Iscript_agent
): Promise<Iscript_agent_response> => {
  console.log("[Agent] Started working for the topic : ", data.topic);
  if (!data?.topic) {
    throw new ValidationError("Topic is required");
  }

  const final_data = await scriptAgentService(data);
  console.log("[Agent] Script ready, synthesizing audio...");

  const completedIdea = await CompletedIdea.create({
    topic: data.topic,
    script: final_data.script,
    caption: final_data.caption,
    score: final_data.score,
    evaluationFeedback: final_data.reason,
    config: {
      length: data.length,
      language: data.language,
      tone: data.tone,
      style: data.style,
      format: data.format,
      purpose: data.purpose,
    },
  });
  console.log(`[DB] Saved completed idea: ${completedIdea._id}`);

  const audioPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp3`);
  await synthesize(final_data.script, audioPath);

  const captions = await getWordTimestamps(audioPath);
  console.log(`[Agent] Got ${captions.length} word timestamps`);

  const clipPath = getRandomClipPath();
  const videoPath = path.join(OUTPUTS_DIR, `${Date.now()}.mp4`);

  console.log("[Agent] Rendering reel...");
  await renderReel({ audioPath, captions, clipPath }, videoPath);

  const postId = await publishReel(videoPath, final_data.caption);
  console.log(`[Agent] Published to Instagram: ${postId}`);

  await Reel.create({
    instagramMediaId: postId,
    topic: data.topic,
    script: final_data.script,
    caption: final_data.caption,
    completedIdeaRef: completedIdea._id,
    publishedAt: new Date(),
  });
  console.log(`[DB] Saved reel record: ${postId}`);

  await Promise.allSettled([unlink(audioPath), unlink(videoPath)]);

  return {
    message: "Reel published successfully",
    postId,
    script: final_data.script,
    caption: final_data.caption,
    score: final_data.score,
    reason: final_data.reason,
  };
};
