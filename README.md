
# DaemonContent

Autonomous content engine. Detects trends, generates scripts, renders videos, and publishes across platforms — all on autopilot.

Not tied to a niche. Not tied to a platform. Define your account identity and platform adapters, and the engine handles the rest.

Part of the Daemon family — [DaemonDoc](https://daemondoc.online) automates README writing. DaemonContent automates content creation.

---

## How it works

```
Trend detected (filtered by account niche)
↓
Qwen generates script (voice + angle injected)
↓
Evaluator scores script — rejects weak content before render
↓
Piper TTS generates voiceover
↓
Renderer builds video (background + voiceover + animated captions)
↓
Human approval queue (togglable)
↓
Platform adapter publishes
↓
Analytics stored → feeds back into generation prompt
```

---

## Content modes

**Audience mode (95%)** — niche-relevant content that builds followers at volume.

**Conversion mode (5%)** — when a trend maps to a project in the registry, generates content that drives viewers to it directly.

```
95 audience posts → reach + followers
5 conversion posts → landing page visits → signups
```

---

## Platform adapters

| Adapter         | Status        |
| --------------- | ------------- |
| Instagram Reels | v1 — building |
| YouTube Shorts  | planned       |
| TikTok          | planned       |
| X / Twitter     | planned       |
| LinkedIn        | planned       |

Each adapter consumes the same `Content` object. Adding a new platform means writing a new adapter — the engine doesn't change.

---

## Account identity

The engine is niche-agnostic. Each account defines its own identity config:

```ts
interface AccountIdentity {
  niche: string;
  personality: string;
  targetAudience: string;
  contentPromise: string;
  topicWhitelist: string[];
  topicBlacklist: string[];
}
```

The first account runs tech education content. Future accounts can run any niche — same engine, different config.

---

## Project registry

Defines products available for conversion mode. Engine matches trends to projects automatically.

```ts
interface Project {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  landingPage: string;
  keywords: string[];
}
```

| Project   | Description                  | URL              |
| --------- | ---------------------------- | ---------------- |
| DaemonDoc | AI-powered README automation | daemondoc.online |
| NovaDrive | Cloud storage with AI        | —                |
| HireAI    | AI hiring pipeline           | —                |

---

## 🛠️ Stack

| Layer     | Tool                       |
| --------- | -------------------------- |
| LLM       | Qwen via OpenRouter (free) |
| TTS       | Piper (local, no quota)    |
| Video     | Remotion                   |
| Queue     | BullMQ + Redis             |
| Database  | MongoDB Atlas              |
| Backend   | Bun + Express              |
| Dashboard | Next.js                    |
| Hosting   | Render                     |

**Cost: $7/mo**

---
## Project structure

```
DaemonContent/
├── backend/
│   ├── app/
│   │   ├── agent/        ← orchestration loop
│   │   ├── api/          ← REST endpoints for dashboard
│   │   ├── config/       ← account identity + project registry
│   │   ├── evaluator/    ← script scoring before render
│   │   ├── poster/       ← platform adapters
│   │   ├── renderer/     ← Remotion + Piper + caption timing
│   │   ├── types/        ← Content, Project, AccountIdentity
│   │   ├── workers/      ← BullMQ job processors
│   │   └── app.ts
│   ├── clips/            ← background footage pool
│   ├── outputs/          ← rendered videos before publish
│   └── server.ts
│
└── client/
    ├── app/              ← Next.js dashboard
    └── types/
```

---

## 🚀 Getting started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- Redis running locally
- MongoDB Atlas account (free tier)
- OpenRouter account (free)
- Piper TTS binary ([releases](https://github.com/rhasspy/piper/releases))
- Platform developer account (Meta, TikTok, etc.)

### Backend

bash
cd backend
cp .env.example .env
bun install
bun dev

# fill in .env
bun install
bun run server.ts
```

### Client

```bash
cd client
cp .env.example .env
bun install
bun run dev
```

---

## Environment variables

### backend/.env

```env
PORT=8000

MONGODB_URI=
REDIS_URL=

OPENROUTER_API_KEY=
OPENROUTER_MODEL=qwen/qwen3-235b-a22b:free

# Platform credentials (add per adapter)
META_ACCESS_TOKEN=
META_INSTAGRAM_ACCOUNT_ID=

PIPER_BINARY_PATH=./bin/piper
PIPER_MODEL_PATH=./models/en_US-lessac-medium.onnx

CLIPS_DIR=./clips
OUTPUTS_DIR=./outputs

POSTS_PER_DAY=4
POST_TIMING_VARIANCE_MINUTES=30
APPROVAL_REQUIRED=true
```

### client/.env

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📅 Build phases

- [x] **Phase 0** — Niche validation (manual posts before any code)
- [ ] **Phase 1** — Local render: topic → script → voiceover → video file (🟡 In Progress)
- [ ] **Phase 2** — Publishing: first platform adapter + MongoDB storage
- [ ] **Phase 3** — Scheduling: BullMQ, approval queue
- [ ] **Phase 4** — Prompt optimization: tune on first 50 posts
- [ ] **Phase 5** — Topic detection: Google Trends, Reddit, HN, X
- [ ] **Phase 6** — Analytics + feedback loop + dashboard
- [ ] **Phase 7** — Additional platform adapters + multi-account support

---
## Related

- [DaemonDoc](https://daemondoc.online) — AI README automation
- [PRD](./PRD.md) — full product requirements document

---

Built by [Arman](https://armandev.space)
