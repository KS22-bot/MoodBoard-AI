# MoodBoard AI

A premium immersive mood-to-world generator: type a feeling, watch it become a living animated world — a personalized poem, music vibe, color palette, and particle canvas.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/moodboard-ai run dev` — run the frontend (managed via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Canvas API
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (`lib/db/src/schema/mood-entries.ts`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/mood-entries.ts` — Drizzle mood_entries table
- `artifacts/api-server/src/routes/mood.ts` — /generate, /history routes
- `artifacts/api-server/src/lib/mood-engine.ts` — mood detection + content generation
- `artifacts/moodboard-ai/src/` — React frontend (pages: Home, History)

## Architecture decisions

- Mood detection is keyword-scoring, easily swapped for an AI API (mood-engine.ts exports `generateMoodProfile`)
- Palette stored as JSON string in PostgreSQL (single column, no join table needed at this scale)
- Canvas particle system built as a standalone React component (ParticleCanvas.tsx) accepting AnimationSettings from the API
- History saved in DB (server-side) — no localStorage dependency for persistence

## Product

- Type or speak a feeling → instant poem, YouTube playlist link, 5-color palette, animated particle world
- Result card exports: PNG screenshot, palette JSON, palette TXT
- Mood History: last 20 entries browsable and deletable on /history page

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen after changing openapi.yaml: `pnpm --filter @workspace/api-spec run codegen`
- The api-server builds before starting (esbuild) — TypeScript errors will prevent startup
- SVG props in React must use camelCase (`strokeLinejoin`, NOT `strokeLinelinejoin`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
