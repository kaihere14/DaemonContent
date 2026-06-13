import type { Iscript_agent } from "../types/agent-types";
import type { ICompletedIdea } from "../utils/models/completed-idea";
import { getScriptGenerationBase, getTopicGenerationBase } from "./prompt-service";

export const scriptAgentPrompt = async (
  config: Iscript_agent,
  feedback?: string
): Promise<string> => {
  const base = await getScriptGenerationBase();
  return `${base}

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
`;
};

export const captionPrompt = (script: string) => `
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

export const evaluatorPrompt = (script: string) => `
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

export const aiDataCallPrompt = async (completedIdeas: ICompletedIdea[]): Promise<string> => {
  const base = await getTopicGenerationBase();
  const hasExistingIdeas = completedIdeas.length > 0;

  return `${base}

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
