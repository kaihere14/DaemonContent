# DaemonContent

An autonomous agent that runs a social media account end-to-end generates content, publishes it, tracks performance, and uses that feedback to improve over time.

You define the account: niche, voice, audience, and platforms. The agent handles the rest.

---

## What it does

```
Topic or detected trend
  → Script written for the account's voice
  → Evaluated and rewritten until it meets quality standards
  → Voiceover synthesized
  → Video rendered with captions
  → Published to connected platforms
  → Performance tracked
  → Feedback fed back into the next generation cycle
```

The goal is a system that grows a real audience without manual work per post.

---

## Current state (Phase 1 complete)

The generation pipeline is working end-to-end:

1. Send a topic
2. LLM writes a script tuned to the account's voice
3. Evaluator scores it — hook strength, clarity, niche fit, voice, length. Anything below threshold gets rejected and rewritten with specific feedback (up to 3 attempts)
4. Approved script goes to TTS
5. Word-level timestamps fetched for animated captions
6. Video rendered: background clip + voiceover + captions
7. `.mp4` saved to `outputs/`, temp audio deleted

Publishing, scheduling, trend detection, and the feedback loop are next.

---

## Account identity

The agent is niche-agnostic. Each account defines its own config:

```ts
interface AccountIdentity {
  niche: string;
  voice: string;
  audience: string;
  contentPromise: string;
  topicWhitelist: string[];
  topicBlacklist: string[];
}
```

Same engine, different config. One account, many niches. One codebase, many accounts.

---

## Platform adapters

Each platform is an adapter that consumes the same `Content` object. Adding a new platform means writing one adapter — the generation pipeline doesn't change.

| Platform                                   | Status        |
| ------------------------------------------ | ------------- |
| Short-form video (Reels / Shorts / TikTok) | v1 — building |
| Long-form video                            | planned       |
| Text-based (X, LinkedIn, Threads)          | planned       |

---

## Stack

| What         | Tool                         |
| ------------ | ---------------------------- |
| Runtime      | Bun                          |
| LLM          | OpenRouter                   |
| TTS          | ElevenLabs                   |
| Captions     | AssemblyAI (word timestamps) |
| Video render | Remotion                     |
| Dashboard    | Next.js (planned)            |

---

## Project structure

```
DaemonContent/
├── backend/
│   ├── app/
│   │   ├── agent/        ← content generation pipeline
│   │   ├── errors/       ← typed errors + global error handler
│   │   ├── evaluator/    ← script quality gate
│   │   ├── renderer/     ← video render + caption timing
│   │   ├── poster/       ← platform adapters (planned)
│   │   ├── workers/      ← job queue (planned)
│   │   └── types/
│   ├── clips/            ← background footage pool
│   ├── outputs/          ← rendered videos
│   └── server.ts
│
└── client/               ← dashboard (planned)
```

---

## Running locally

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- At least one `.mp4` clip in `backend/clips/`

### Setup

```bash
cd backend
cp .env.example .env   # fill in your keys
bun install
bun run server.ts
```

Server starts on `http://localhost:3001`.

### Environment variables

```env
OPEN_ROUTER_KEY=
ELEVENLABS_API_KEY=
ASSEMBLY_API_KEY=
PORT=3001
```

---

## API

### `POST /agent/script-generation`

**Body**

```json
{
  "topic": "string (required)",
  "length": "optional",
  "language": "optional — defaults to English",
  "tone": "optional",
  "style": "optional",
  "format": "optional",
  "purpose": "optional"
}
```

**Response**

```json
{
  "message": "Reel generated successfully",
  "final_data": {
    "script": "...",
    "score": 8,
    "reason": "..."
  },
  "videoPath": "/absolute/path/to/output.mp4",
  "captions": [{ "word": "...", "start": 0, "end": 200 }]
}
```

**Errors**

| Status | Reason                       |
| ------ | ---------------------------- |
| 400    | `topic` missing              |
| 404    | No clips in `backend/clips/` |
| 500    | LLM, TTS, or render failure  |

---

## Roadmap

- [x] **Phase 1** — Generation pipeline: topic → script → voiceover → video
- [ ] **Phase 2** — Publishing: first platform adapter + post storage
- [ ] **Phase 3** — Scheduling: job queue, post timing, approval toggle
- [ ] **Phase 4** — Prompt tuning: improve generation quality from real post data
- [ ] **Phase 5** — Trend detection: pull topics automatically from the web
- [ ] **Phase 6** — Analytics + feedback loop + dashboard
- [ ] **Phase 7** — Multi-platform adapters + multi-account support

---

Built by [Arman](https://armandev.space)
