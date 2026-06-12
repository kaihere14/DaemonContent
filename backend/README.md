# backend

Bun HTTP server. Exposes one endpoint that takes a topic and returns a rendered `.mp4` reel.

## Run

```bash
bun install
bun run server.ts
```

Starts on port `3001` by default. Set `PORT` in `.env` to change it.

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
