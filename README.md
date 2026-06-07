
# 🤖 DaemonContent

🛠️ **DaemonContent** is an autonomous AI content engine that transforms trending topics into publishable videos across social platforms. It operates as a modular pipeline with configurable identities and conversion-focused strategies.

---
## 🌟 Key Features

- **End-to-end automation**: Trend detection → script generation → video rendering → platform publishing
- **Multi-platform support**: Platform-specific adapters with uniform content objects
- **Configurable identities**: Define niche, tone, and audience for each channel
- **Conversion optimization**: 5% of content promotes products from the project registry
- **Modular architecture**: Replaceable components (LLM, TTS, renderers)

---
## 🏗️ Architecture Overview

mermaid
graph TD
    A[Trend Detection] --> B[Script Generation]
    B --> C[Script Evaluation]
    C --> D[Voiceover Generation]
    D --> E[Video Rendering]
    E --> F["Human Approval (optional)"]
    F --> G[Platform Publishing]
    G --> H[Analytics Feedback Loop]


**Core Components**:
- **LLM Pipeline**: Qwen for script generation
- **Render Engine**: Remotion + Piper TTS
- **Adapter System**: Platform-specific publishing
- **Identity Engine**: Configurable content profiles

---
## 📱 Platform Support

| Platform        | Status         | Notes                       |
|-----------------|----------------|-----------------------------|
| Instagram Reels | v1 - Active    | Basic publishing support    |
| YouTube Shorts  | In Development | API integration pending     |
| TikTok          | Planned        | Requires API access         |
| LinkedIn        | Research       | Format compatibility check  |

All adapters use a standardized `Content` interface:
ts
interface Content {
  title: string;
  script: string;
  audioUrl: string;
  videoUrl: string;
  metadata: Record<string, any>;
}


---
## 👤 Identity Configuration

Define channel characteristics using the `AccountIdentity` interface:

ts
interface AccountIdentity {
  niche: string;
  personality: string;
  targetAudience: string;
  contentPromise: string;
  topicWhitelist: string[];
  topicBlacklist: string[];
}


**Example**: Tech education channel
ts
const techEduIdentity: AccountIdentity = {
  niche: "software development",
  personality: "enthusiastic instructor",
  targetAudience: "junior developers",
  contentPromise: "actionable coding tutorials",
  topicWhitelist: ["JavaScript", "AI", "DevOps"],
  topicBlacklist: ["politics", "cryptocurrency"]
};


---
## 💸 Conversion Engine

When trending topics match products in the registry, DaemonContent generates promotional content:

ts
interface Project {
  id: string;
  name: string;
  description: string;
  landingPage: string;
  keywords: string[];
}


**Current Projects**:
| Project   | Description               | URL              |
|-----------|---------------------------|------------------|
| DaemonDoc | README automation         | daemondoc.online |
| NovaDrive | AI-enhanced cloud storage | (coming soon)    |
| HireAI    | AI recruitment platform   | (in development) |

---
## 🛠️ Technical Stack

| Component    | Technology                 |
|--------------|----------------------------|
| **LLM**      | Qwen via OpenRouter (free) |
| **TTS**      | Piper (local)              |
| **Video**    | Remotion                   |
| **Queue**    | BullMQ + Redis             |
| **Database** | MongoDB Atlas              |
| **Backend**  | Bun + Express              |
| **Dashboard**| Next.js                    |
| **Hosting**  | Render                     |

**Monthly Cost**: $7 (free tier compatible)

---
## 📂 Project Structure


DaemonContent/
├── backend/
│   ├── app/              ← Core modules
│   │   ├── agent/        ← Orchestration
│   │   ├── evaluator/    ← Script scoring
│   │   ├── renderer/     ← Video generation
│   │   ├── poster/       ← Platform adapters
│   │   └── config/       ← Identity + registry
│   ├── clips/            ← Background footage
│   └── outputs/          ← Rendered videos
├── client/               ← Dashboard
│   └── app/              ← Next.js components


---
## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- Redis (local)
- MongoDB Atlas (free tier)
- OpenRouter API key
- Piper TTS binary

### Setup

bash
# Backend
cd backend
cp .env.example .env
bun install
bun run server.ts

# Dashboard
cd client
cp .env.example .env
bun install
bun run dev
```

---

## Configuration

### Backend Environment

```env
PORT=8000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379

OPENROUTER_API_KEY=...
OPENROUTER_MODEL=qwen/qwen3-235b-a22b:free

PIPER_BINARY_PATH=./bin/piper
PIPER_MODEL_PATH=./models/en_US-lessac-medium.onnx

POSTS_PER_DAY=4
APPROVAL_REQUIRED=true
```

---

## Development Roadmap

✅ **Completed**
- Local rendering pipeline
- Basic Instagram adapter
- Core identity system

🚀 **In Progress**
- YouTube Shorts adapter
- Advanced analytics dashboard
- Trend detection from multiple sources

---

## Related Projects

- [DaemonDoc](https://daemondoc.online) – AI README automation
- [PRD](./PRD.md) – Full product requirements document

---

Built by [Arman](https://armandev.space)  
Part of the [Daemon Family](https://daemondoc.online) of AI automation tools
