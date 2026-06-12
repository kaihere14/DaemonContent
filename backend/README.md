# backend

Bun HTTP server. Takes a topic (manual or AI-generated), runs the full content pipeline, publishes to Instagram, and stores results in MongoDB.

## Run

```bash
bun install
cp .env.example .env   # fill in your keys
bun run server.ts
```

Starts on port `3001` by default. Set `PORT` in `.env` to change it.

Requires MongoDB, Meta Graph API credentials, and a publicly reachable `PUBLIC_URL` for Instagram video upload.

## Usage

Health check:

```bash
curl "http://localhost:3001/"
```

### Manual mode — you provide the topic

```bash
curl -X POST "http://localhost:3001/agent/user-generation" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Why developers should learn system design"}'
```

All request fields:

```json
{
  "topic": "Why developers should learn system design",
  "length": "60 seconds",
  "language": "English",
  "tone": "direct and opinionated",
  "style": "conversational",
  "format": "plain text",
  "purpose": "educate developers"
}
```

Only `topic` is required. The pipeline generates a script, evaluates it, synthesizes audio, renders the video, publishes to Instagram, and saves records to MongoDB.

### Autonomous mode — agent picks the topic

```bash
curl -X POST "http://localhost:3001/agent/agent-generation"
```

No body needed. Reads completed ideas from MongoDB, generates a fresh non-duplicate topic, then runs the full pipeline.

Both endpoints return the published Instagram `postId`, script, caption, and evaluation score.

Do not send an empty POST to `/agent/user-generation`. The endpoint parses the request body as JSON, so a request without `-d` fails with `Unexpected end of JSON input`.

## Environment variables

```env
MONGODB_URI=              # MongoDB connection string
OPEN_ROUTER_KEY=          # OpenRouter API key
ELEVENLABS_API_KEY=       # ElevenLabs API key
ASSEMBLY_API_KEY=         # AssemblyAI API key
META_ACCESS_TOKEN=        # Meta Graph API access token
META_INSTAGRAM_ACCOUNT_ID=# Instagram business account ID
PUBLIC_URL=               # Public URL Instagram uses to fetch the video
PORT=3001
```

`PUBLIC_URL` must be reachable from the internet. Instagram downloads the transcoded reel from `{PUBLIC_URL}/outputs/{filename}`.

## Clips

Drop `.mp4` background video files into `backend/clips/`. The renderer picks one at random per reel. If the folder is empty, the endpoint returns a 404.

## Outputs

Rendered videos are written to `backend/outputs/` and served at `/outputs/:filename` for Instagram upload. Audio and video temp files are deleted after a successful publish.
