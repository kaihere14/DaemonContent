# DaemonContent

DaemonContent is an automated content generation pipeline and analytics dashboard designed for creating and publishing short-form tech education Instagram Reels. It uses OpenRouter LLMs to generate video topics and scripts, synthesizes voiceovers, aligns captions using word-level timestamps, renders vertical videos using Remotion and ffmpeg, publishes directly to Instagram, and uses engagement metrics to continuously evolve agent prompt rules.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

## Features

- **Automated Topic & Script Generation**: Uses OpenRouter models to write tech education scripts constrained to a single concept and target word count (~150–180 words).
- **Automated Script Evaluation**: Scores generated scripts across criteria (hook, clarity, niche, voice, length) and automatically retries generation if quality thresholds are not met.
- **Voiceover Synthesis & Caption Alignment**: Converts scripts to audio via Unreal Speech and fetches precise word-level timestamps from AssemblyAI for caption synchronization.
- **Remotion Video Rendering**: Combines synthesized audio, word-by-word dynamic captions, and randomized background video clips (`.mp4` clips from `backend/clips/`) into 1080x1920 30fps Reels.
- **Instagram Direct Publishing**: Transcodes rendered videos using `ffmpeg` to match Instagram specs and publishes them automatically through the Meta Graph API.
- **Prompt Evolution Engine**: Fetches Instagram insights (views, reach, likes, comments, saves, shares, and watch time) for published reels older than 48 hours and automatically updates prompt guidelines in MongoDB.
- **Analytics Dashboard**: Next.js dashboard featuring engagement metrics, reach visualizations, and top-performing post summaries.

## Requirements

- **Runtime**: [Bun](https://bun.sh/)
- **Database**: [MongoDB](https://www.mongodb.com/) instance
- **System Tools**: `ffmpeg` and `ffprobe` installed and available on your system path
- **API Accounts & Keys**:
  - OpenRouter API Key
  - Unreal Speech API Key
  - AssemblyAI API Key
  - Meta Instagram Graph API Access Token and Account ID

## Installation

Install dependencies across the root repository, backend, and client using Bun:

```bash
bun install
cd backend && bun install
cd ../client && bun install
```

## Configuration

Set up environment variables in `backend/.env`. A template is provided in `backend/.env.example`.

```env
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>"
OPEN_ROUTER_KEY="your-openrouter-key"
UNREAL_API_KEY="your-unreal-speech-key"
ELEVENLABS_API_KEY="your-elevenlabs-key"
ASSEMBLY_API_KEY="your-assemblyai-key"
META_ACCESS_TOKEN="your-meta-access-token"
META_INSTAGRAM_ACCOUNT_ID="your-instagram-account-id"
PUBLIC_URL="https://your-public-server-url"
PORT=3001
```

For the Next.js frontend client, configure `API_URL` if the backend runs on a host other than `http://localhost:3001`:

```env
API_URL="http://localhost:3001"
```

Place background MP4 video clips into `backend/clips/` prior to running video rendering tasks.

## Usage

### Development Servers

Start the backend API server (runs on port `3001` by default and seeds prompt configurations into MongoDB on startup):

```bash
cd backend
bun run dev
```

Start the Next.js client dashboard (runs on `http://localhost:3000` by default):

```bash
cd client
bun run dev
```

### Production Build & Run

Build and run the backend server:

```bash
cd backend
bun run build
bun run start
```

Build and run the frontend client:

```bash
cd client
bun run build
bun run start
```

### Running Docker

Build and run the backend inside a Docker container:

```bash
cd backend
docker compose up --build
```

### Triggering the Full Pipeline

Trigger the wake-up script to run analytics syncing, prompt evolution, new topic generation, video rendering, and Instagram publishing:

```bash
./backend/scripts/run-pipeline.sh
```

### Code Formatting and Linting

Format code across projects:

```bash
bun run format
```

Lint backend or client projects:

```bash
cd backend && bun run lint
cd client && bun run lint
```

## API Reference

The backend HTTP server runs routes defined on `Bun.serve`.

### Agent & Pipeline Routes

- **`POST /pipeline/run`**
  Executes the automated pipeline: syncs analytics, evolves agent prompt rules, generates a new topic, writes and evaluates the script, synthesizes speech, generates captions, renders the video, and publishes to Instagram.

- **`POST /agent/user-generation`**
  Generates and posts a reel based on a provided topic configuration.
  - **Request Body**:
    ```json
    {
      "topic": "String (required)",
      "length": "String (optional)",
      "language": "String (optional)",
      "tone": "String (optional)",
      "style": "String (optional)",
      "format": "String (optional)",
      "purpose": "String (optional)"
    }
    ```

- **`POST /agent/agent-generation`**
  Queries MongoDB for completed ideas, constructs an AI prompt for a brand-new topic, generates the topic, and executes the script-to-publish workflow.

### Analytics Routes

- **`GET /analytics`**
  Fetches all published reel records, analytics summaries, total view counts, reach, average engagement rate, and the best-performing reel.

- **`POST /analytics/sync`**
  Calls Meta Graph API (`/v25.0/{media-id}/insights`) to update view, reach, save, share, comment, like, and watch time metrics for published reels. Returns `{ "updated": <number> }`.

- **`POST /analytics/evolve`**
  Triggers prompt evolution using performance data from reels older than 48 hours, updating topic and script rule sets in MongoDB. Returns prompt version numbers.

### System & Static File Routes

- **`GET /`**
  Health check endpoint. Returns `{ "message": "Server is running" }`.

- **`GET /outputs/:filename`**
  Serves rendered output media files directly from `backend/outputs/`.

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── agent/         # Topic generation, script writer, speech synthesis, clip selection
│   │   ├── analytics/     # Analytics sync, Meta Graph API integration, prompt evolution
│   │   ├── errors/        # App error handling wrappers
│   │   ├── evaluator/     # LLM script scoring and quality gate logic
│   │   ├── pipeline/      # End-to-end cron pipeline controller
│   │   ├── poster/        # Video transcoding and Instagram Reel publisher
│   │   ├── prompt/        # Base system prompts and prompt assembly logic
│   │   ├── renderer/      # Remotion composition, AssemblyAI transcription, media rendering
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Mongoose models and database initialization scripts
│   ├── clips/             # Source MP4 background clips for Remotion render process
│   ├── outputs/           # Output directory for rendered MP3 audio and MP4 reels
│   ├── scripts/           # Pipeline invocation shell scripts
│   ├── Dockerfile         # Oven/bun Docker configuration with chromium/ffmpeg runtime libs
│   ├── server.ts          # Backend entrypoint (connects DB, seeds prompts, serves routes)
│   └── package.json
├── client/
│   ├── app/               # Next.js App Router layout and main analytics dashboard page
│   ├── components/        # Recharts analytics components and UI primitives
│   ├── lib/               # Dashboard API fetcher and tailwind utility functions
│   └── package.json
└── package.json           # Root workspace configuration and lint-staged/husky hooks
```