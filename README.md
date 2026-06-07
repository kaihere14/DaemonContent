
# DaemonContent

🛠️ **DaemonContent** is an autonomous, AI‑driven content engine that continuously scans the internet for emerging trends, crafts scripts, generates voice‑overs, renders short videos, and publishes them across multiple platforms without human intervention.

- **Trend‑to‑video pipeline** – from detection to analytics.
- **Platform‑agnostic** – works with any social channel via adapters.
- **Configurable identity** – each account supplies its own niche, tone, and goals.
- **Conversion‑focused** – can drive traffic to products listed in the project registry.

Part of the Daemon family – the companion project **[DaemonDoc](https://daemondoc.online)** writes READMEs for you, while DaemonContent creates the content.

---
## How it works 🚀

The engine follows a deterministic, eight‑step pipeline that can be visualised as a flowchart:


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


Each stage is implemented as an isolated module, making it easy to replace or extend any component (e.g., swapping Qwen for another LLM). The optional **human approval queue** can be enabled for higher‑risk channels, otherwise the pipeline runs fully autonomously.

---
## Content modes 🎯

DaemonContent operates in two complementary modes that together balance audience growth and direct conversions.

**Audience mode (≈95 %)** – Generates high‑volume, niche‑relevant posts designed to attract followers and increase reach.

**Conversion mode (≈5 %)** – When a detected trend matches a product in the **Project registry**, the engine creates a targeted post that drives viewers to the landing page, boosting sign‑ups or sales.


95 audience posts → reach + followers
5 conversion posts → landing page visits → sign‑ups


Both modes share the same underlying pipeline; the only difference is the final call‑to‑action and the analytics tag attached to the content.

---
## Platform adapters 📦

| Adapter         | Status        |
| --------------- | ------------- |
| Instagram Reels | v1 — building |
| YouTube Shorts  | planned       |
| TikTok          | planned       |
| X / Twitter     | planned       |
| LinkedIn        | planned       |

All adapters consume a uniform `Content` object (`title`, `script`, `audioUrl`, `videoUrl`, `metadata`). Adding support for a new platform only requires implementing the adapter interface – the core engine remains untouched.

**How to add a new adapter**
1. Create a file that implements `PlatformAdapter`.
2. Map the `Content` fields to the platform’s API payload.
3. Register the adapter in `adapters/index.ts`.
4. Update the `platforms` configuration in your `AccountIdentity` if needed.

---
## Account identity 👤

The engine is niche‑agnostic; each account supplies an identity configuration that guides content generation.

ts
interface AccountIdentity {
  niche: string;               // e.g. "tech education"
  personality: string;         // tone of voice, e.g. "friendly mentor"
  targetAudience: string;      // description of the ideal viewer
  contentPromise: string;      // what the audience can expect from each post
  topicWhitelist: string[];    // topics the account is allowed to cover
  topicBlacklist: string[];    // topics to avoid
}


Example for a tech‑education channel:
ts
const techEduIdentity: AccountIdentity = {
  niche: "software development",
  personality: "enthusiastic instructor",
  targetAudience: "junior developers looking to level up",
  contentPromise: "short, actionable tutorials",
  topicWhitelist: ["JavaScript", "TypeScript", "AI", "DevOps"],
  topicBlacklist: ["politics", "cryptocurrency"]
};


By swapping out this configuration you can launch a completely different channel (e.g., fitness, cooking) without changing any engine code.

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

## Stack

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

## Getting started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- Redis running locally
- MongoDB Atlas account (free tier)
- OpenRouter account (free)
- Piper TTS binary ([releases](https://github.com/rhasspy/piper/releases))
- Platform developer account (Meta, TikTok, etc.)

### Backend

```bash
cd backend
cp .env.example .env
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

## Build phases

- [x] **Phase 0** — Niche validation (manual posts before any code)
- [ ] **Phase 1** — Local render: topic → script → voiceover → video file
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
