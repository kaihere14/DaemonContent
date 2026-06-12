# backend

Bun HTTP server. Exposes one endpoint that takes a topic and returns a rendered `.mp4` reel.

## Run

```bash
bun install
bun run server.ts
```

Starts on port `3001` by default. Set `PORT` in `.env` to change it.

## Usage

Check that the server is running:

```bash
curl "http://localhost:3001/"
```

Generate a reel by sending a JSON body with a non-empty `topic`:

```bash
curl -X POST "http://localhost:3001/agent/script-generation" \
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

Only `topic` is required. The response includes the generated script, its
evaluation, word-level captions, and the path to the rendered video.

Do not send an empty POST request. The endpoint parses the request body as JSON,
so a request without `-d` fails with `Unexpected end of JSON input`.

## Environment variables

```env
OPEN_ROUTER_KEY=       # OpenRouter API key
ELEVENLABS_API_KEY=    # ElevenLabs API key
ASSEMBLY_API_KEY=      # AssemblyAI API key
PORT=3001
```

## Clips

Drop `.mp4` background video files into `backend/clips/`. The renderer picks one at random per reel. If the folder is empty, the endpoint returns a 404.

## Outputs

Rendered videos are saved to `backend/outputs/`. The intermediate audio file is deleted automatically after render.
