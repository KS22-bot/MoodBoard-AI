# MoodBoard AI

An interactive emotional sanctuary. Type or speak a feeling — MoodBoard AI generates a living canvas world, an original poem, a color palette, and a playlist vibe that adapts to your mood and the current time of day.

![MoodBoard AI](https://img.shields.io/badge/built%20with-React%20%2B%20Vite-61dafb?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square) ![Vercel](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square)

---

## Features

### Core
- **Mood detection** — keyword-scoring engine maps free-text input to 10 mood categories (calm, happy, sad, nostalgic, anxious, energetic, hopeful, lonely, romantic, creative)
- **Generated poem** — a unique short poem drawn from a curated set per mood
- **5-color palette** — nude and pastel swatches matched to the detected mood, copy-to-clipboard per swatch
- **Playlist vibe** — genre tag + YouTube search link matching the emotional tone
- **Voice input** — Web Speech API mic button with pulsing recording indicator
- **Mood history** — last entries persisted server-side in PostgreSQL, viewable in full on `/history`

### Visual & Atmosphere
- **Melancholy theme** — Navy `#1B263B` / Dusty Blue `#415A77` / Lavender Gray `#778DA9` / Morning Mist `#D8E2F1` / Silver `#E0E1DD`
- **Living particle canvas** — floating orbs and leaves driven by per-mood animation settings (speed, glow, wind, particle count, color tint)
- **Time-of-day adaptation** — canvas and overlay shift automatically across Morning / Afternoon Clear / Evening Blue Hour / Moonlit Night; stars and shooting stars appear at night
- **Ambient layers** — film grain, radial vignette, directional light rays at dusk and night
- **Animated mesh gradient** — slowly drifts across the background using only the Melancholy palette

### Interaction
- **Aura Generator** — 5 animated SVG arc gauges (Peace, Clarity, Hope, etc.) with a title ("Quiet Soul", "Gentle Storm", …) and a one-line description, all derived from the detected mood
- **Shareable mood card** — browser-rendered 1080 × 1350 canvas card (poem, palette, aura title, date, branding); Download PNG / Copy Image / Share
- **Custom cursor** — lerp-smoothed outer ring + inner dot; expands on buttons, pulses on cards, color-shifts on palette swatches, ripples on click; desktop-only, respects `prefers-reduced-motion`
- **Microinteractions** — spring card entrances, tilt hover on history cards, glowing input border while typing
- **Ambient sound toggle** — Forest / Rain / Wind / River selector (UI layer, no audio files required)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend | Express 5, TypeScript, pino logging |
| Database | PostgreSQL via Drizzle ORM (`node-postgres`) |
| Monorepo | pnpm workspaces |
| Deployment | Vercel (frontend static + API serverless functions) |

---

## Project Structure

```
/
├── artifacts/
│   ├── moodboard-ai/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/    # ParticleCanvas, AuraCard, MoodCard, ShareableCard, CustomCursor …
│   │   │   ├── hooks/         # useTimeOfDay
│   │   │   └── pages/         # Home, History
│   │   ├── vite.config.ts           # Dev (Replit)
│   │   └── vite.config.vercel.ts    # Build (Vercel)
│   └── api-server/            # Express API
│       └── src/
│           ├── lib/
│           │   └── mood-engine.ts   # Mood detection + poem/palette/animation generation
│           └── routes/
│               └── mood.ts          # POST /api/generate, GET/DELETE /api/history
├── lib/
│   ├── api-client-react/      # TanStack Query hooks (auto-generated)
│   ├── api-zod/               # Shared Zod schemas
│   ├── api-spec/              # OpenAPI spec
│   └── db/                    # Drizzle schema + pool
├── api/
│   └── [...path].ts           # Vercel catch-all serverless handler
├── vercel.json
└── .env.example
```

---

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (local or cloud)

### Setup

```bash
# 1. Clone
git clone https://github.com/KS22-bot/MoodBoard-AI.git
cd MoodBoard-AI

# 2. Install dependencies
pnpm install

# 3. Set environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL to your Postgres connection string

# 4. Push the database schema
pnpm --filter @workspace/db run push

# 5. Start both servers
# Terminal A — API server
PORT=8080 pnpm --filter @workspace/api-server run dev

# Terminal B — Frontend
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/moodboard-ai run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to port 8080.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Production + dev | PostgreSQL connection string |
| `PORT` | Dev only | Port for each server process |
| `BASE_PATH` | Dev only | URL base path for the Vite dev server |

---

## Deploying to Vercel

1. **Import** — go to [vercel.com/new](https://vercel.com/new), import the `MoodBoard-AI` repository. Vercel reads `vercel.json` automatically; no framework preset to change.

2. **Environment variable** — in the Vercel project → **Settings → Environment Variables**, add:
   ```
   DATABASE_URL = your-postgres-connection-string
   ```
   Recommended providers: [Neon](https://neon.tech) (free tier), Supabase, or Railway.

3. **Deploy** — click Deploy. Vercel:
   - Runs `pnpm install`
   - Builds the frontend via `vite.config.vercel.ts` → outputs to `artifacts/moodboard-ai/dist`
   - Bundles `api/[...path].ts` as a serverless function that wraps the Express app

4. **Database schema** — run the Drizzle push once against your production database:
   ```bash
   DATABASE_URL=<prod-url> pnpm --filter @workspace/db run push
   ```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/generate` | Detect mood from text, return poem + palette + playlist + aura |
| `GET` | `/api/history` | Return saved mood entries (latest first) |
| `GET` | `/api/history/:id` | Return a single mood entry |
| `DELETE` | `/api/history/:id` | Delete a mood entry |

---

## Mood Categories

`calm` · `happy` · `sad` · `nostalgic` · `anxious` · `energetic` · `hopeful` · `lonely` · `romantic` · `creative`

Detection is keyword-scoring (easy to swap for an LLM call in `lib/mood-engine.ts`).

---

## License

MIT
