# DaemonContent — Build Tracker

## Phase 0 — Niche Validation

> Before any code. Confirm the niche has an audience.

- [x] Post 10 reels manually (gaming bg + voiceover + tech topic)
- [x] Measure saves, follows, reach, comments
- [x] At least 2–3 reels showing meaningful save rate or follower growth

---

## Phase 1 — Local Render

> Goal: topic → script → voiceover → captions → `.mp4` on disk. No infrastructure.

- [x] Script generation (Qwen via OpenRouter)
- [x] Evaluator (5-criteria scoring, auto-retry)
- [x] ElevenLabs TTS (`.mp3` output)
- [x] Caption timing (word-level timestamps via AssemblyAI)
- [x] Gaming clips downloaded in `backend/clips/`
- [x] Remotion renderer (`ReelComposition.tsx`, `Root.tsx`, `render.ts`)
- [x] Wire `renderReel()` into the controller
- [x] Test full pipeline end-to-end: topic → `.mp4` on disk

**Success metric:** One reel on your laptop you'd actually post.

---

## Phase 2 — Publishing 🟡 In Progress

> Goal: topic string in → reel live on Instagram → post ID in MongoDB.

- [ ] Meta Business account setup
- [ ] Meta Graph API integration
- [ ] MongoDB connection + post storage schema
- [ ] Instagram publish endpoint
- [ ] End-to-end test: topic → Instagram post → post ID saved

---

## Phase 3 — Scheduling

> Goal: scheduler live, reels generated daily, human reviews before publish.

- [ ] BullMQ + Redis job queue setup
- [ ] Scheduler: 3–5 reels/day, randomized timing (±30min variance)
- [ ] Human approval queue (mandatory — first 50–100 reels)
- [ ] Auto hashtag + caption generation
- [ ] Next.js dashboard — approval queue UI

---

## Phase 4 — Prompt Optimization

> Goal: clear pattern in what performs for this account.

- [ ] Review first 50 published reels
- [ ] Identify which hooks retained viewers
- [ ] Identify which topics got saves and follows
- [ ] Tune Qwen prompt + evaluator thresholds from real data

> ⚠️ Do not move to Phase 5 until you can answer: what type of content does this audience respond to?

---

## Phase 5 — Topic Detection

> Goal: fully autonomous content pipeline.

- [ ] Google Trends scraper (filtered by tech keywords)
- [ ] Reddit monitor (r/programming, r/MachineLearning, r/devops)
- [ ] HackerNews front page scraper
- [ ] X/Twitter tech trending
- [ ] TikTok Creative Center (bonus — assume it breaks)
- [ ] 3 hook variations per topic — evaluator picks best
- [ ] Project Registry matching for Conversion Mode

---

## Phase 6 — Analytics + Feedback Loop

> Goal: performance data feeds back into generation.

- [ ] Instagram Insights pull after 48hrs
- [ ] Post scoring system
- [ ] Performance feeds back into Qwen prompt
- [ ] Full Next.js dashboard (analytics + approval queue)
- [ ] Track: save rate, project page clicks, signups

---

## Phase 7 — Multi-platform + Scale

> Post-MVP. Same engine, more platforms.

- [ ] YouTube Shorts adapter
- [ ] TikTok adapter
- [ ] Second account with different niche
- [ ] Multi-account dashboard
- [ ] SaaS layer (let others run the engine)
