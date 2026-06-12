# DaemonContent

An autonomous agent that runs a social media account end-to-end — generates content, publishes it, tracks performance, and uses that feedback to improve over time.

You define the account: niche, voice, audience, and platforms. The agent handles the rest.

---

## What it does

```
Topic (manual or AI-generated from past posts)
  → Script written for the account's voice
  → Evaluated and rewritten until it meets quality standards
  → Caption generated
  → Voiceover synthesized
  → Video rendered with animated captions
  → Published to Instagram
  → Post ID + metadata saved to MongoDB
  → Performance tracked (planned)
  → Feedback fed back into the next generation cycle (planned)
```

The goal is a system that grows a real audience without manual work per post.

---

## Current state

### Phase 1 — Generation pipeline (complete)

1. Send a topic (or let the agent pick one)
2. LLM writes a script tuned to the account's voice
3. Evaluator scores it — hook strength, clarity, niche fit, voice, length. Anything below threshold gets rejected and rewritten with specific feedback (up to 3 attempts)
4. LLM generates an Instagram caption with hashtags
5. Approved script goes to TTS
6. Word-level timestamps fetched for animated captions
7. Video rendered: background clip + voiceover + captions

### Phase 2 — Publishing + storage (complete)

8. Video transcoded for Instagram (ffmpeg) and served via `PUBLIC_URL`
9. Reel published via Meta Graph API — container creation, status polling, publish
10. `CompletedIdea` saved to MongoDB (topic, script, caption, score, config)
11. `Reel` saved to MongoDB (Instagram media ID, script, caption, link to completed idea)
12. Temp audio and video files cleaned up after publish

**Two modes:**

- **Manual** — you provide the topic via `POST /agent/user-generation`
- **Autonomous** — the agent reads past completed ideas from MongoDB, generates a fresh non-duplicate topic, and runs the full pipeline via `POST /agent/agent-generation`

Scheduling, trend detection, analytics, and the feedback loop are next.

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

The default account is **tech education for Instagram** — developers, CS students, and indie hackers. Scripts are direct, opinionated, one concept per reel.

---

## Platform adapters

Each platform is an adapter that consumes the same `Content` object. Adding a new platform means writing one adapter — the generation pipeline doesn't change.

| Platform                           | Status  |
| ---------------------------------- | ------- |
| Instagram Reels                    | Live    |
| Short-form video (Shorts / TikTok) | planned |
| Long-form video                    | planned |
| Text-based (X, LinkedIn, Threads)  | planned |

---

## Stack

| What         | Tool                             |
| ------------ | -------------------------------- |
| Runtime      | Bun                              |
| LLM          | OpenRouter (nex-agi/nex-n2-pro)  |
| TTS          | ElevenLabs                       |
| Captions     | AssemblyAI (word timestamps)     |
| Video render | Remotion                         |
| Publishing   | Meta Graph API (Instagram Reels) |
| Database     | MongoDB (Mongoose)               |
| Dashboard    | Next.js (planned)                |

---

## Project structure

```
DaemonContent/
├── backend/
│   ├── app/
│   │   ├── agent/        ← content generation pipeline + controller
│   │   ├── errors/       ← typed errors + global error handler
│   │   ├── evaluator/    ← script quality gate
│   │   ├── renderer/     ← video render + caption timing
│   │   ├── poster/       ← Instagram publishing adapter
│   │   ├── utils/
│   │   │   ├── db/       ← MongoDB connection
│   │   │   └── models/   ← CompletedIdea + Reel schemas
│   │   └── types/
│   ├── clips/            ← background footage pool
│   ├── outputs/          ← rendered videos (served for Instagram upload)
│   └── server.ts
│
├── client/               ← dashboard (planned)
└── docker-compose.yml    ← optional Piper TTS container
```

---

## Running locally

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [ffmpeg](https://ffmpeg.org/) (required for Instagram video transcoding)
- MongoDB instance (local or Atlas)
- Meta Business account with Instagram Graph API access
- A publicly reachable `PUBLIC_URL` (e.g. ngrok tunnel) — Instagram fetches the video from this URL
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
MONGODB_URI=
OPEN_ROUTER_KEY=
ELEVENLABS_API_KEY=
ASSEMBLY_API_KEY=
META_ACCESS_TOKEN=
META_INSTAGRAM_ACCOUNT_ID=
PUBLIC_URL=https://your-public-server-url
PORT=3001
```

`PUBLIC_URL` must point to this server from the public internet. Instagram downloads the transcoded video from `{PUBLIC_URL}/outputs/{filename}`.

---

## API

### `POST /agent/user-generation`

Run the full pipeline with a topic you provide.

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
  "message": "Reel published successfully",
  "postId": "instagram_media_id",
  "script": "...",
  "caption": "...",
  "score": 8,
  "reason": "..."
}
```

### `POST /agent/agent-generation`

Autonomous mode — no body required. Fetches completed ideas from MongoDB, generates a fresh non-duplicate topic, then runs the full pipeline.

**Response**

```json
{
  "message": "All done successfully",
  "final_result": {
    "message": "Reel published successfully",
    "postId": "instagram_media_id",
    "script": "...",
    "caption": "...",
    "score": 8,
    "reason": "..."
  }
}
```

### `GET /outputs/:filename`

Serves rendered video files. Used by Instagram to fetch the reel during publishing.

### `GET /`

Health check. Returns `{ "message": "Server is running" }`.

**Errors**

| Status | Reason                                       |
| ------ | -------------------------------------------- |
| 400    | `topic` missing                              |
| 404    | No clips in `backend/clips/` or file missing |
| 500    | LLM, TTS, render, DB, or Instagram failure   |

---

## Database models

**CompletedIdea** — every script the agent produces, whether published or not.

| Field                | Description                         |
| -------------------- | ----------------------------------- |
| `topic`              | Reel topic                          |
| `script`             | Voiceover script                    |
| `caption`            | Instagram caption                   |
| `score`              | Evaluator score (0–10)              |
| `evaluationFeedback` | Why it passed or what was rewritten |
| `config`             | length, language, tone, style, etc. |

**Reel** — published Instagram posts.

| Field              | Description                         |
| ------------------ | ----------------------------------- |
| `instagramMediaId` | Instagram post ID                   |
| `topic`            | Reel topic                          |
| `script`           | Voiceover script                    |
| `caption`          | Instagram caption                   |
| `completedIdeaRef` | Link to the source CompletedIdea    |
| `publishedAt`      | Publish timestamp                   |
| `analytics`        | Likes, reach, saves, etc. (planned) |

---

## Roadmap

- [x] **Phase 0** — Niche validation: manual reels, measure engagement
- [x] **Phase 1** — Generation pipeline: topic → script → voiceover → video
- [x] **Phase 2** — Publishing: Instagram adapter + MongoDB post storage + autonomous topic generation
- [ ] **Phase 3** — Scheduling: job queue, post timing, approval toggle
- [ ] **Phase 4** — Prompt tuning: improve generation quality from real post data
- [ ] **Phase 5** — Trend detection: pull topics automatically from the web
- [ ] **Phase 6** — Analytics + feedback loop + dashboard
- [ ] **Phase 7** — Multi-platform adapters + multi-account support

---

Built by [Arman](https://armandev.space)
