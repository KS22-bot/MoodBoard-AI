/**
 * Vercel catch-all serverless handler for all /api/* routes.
 * Wraps the Express app — Vercel passes the original request URL so
 * Express route matching (/api/generate, /api/history, etc.) works correctly.
 *
 * Required environment variables (set in Vercel → Settings → Environment Variables):
 *   DATABASE_URL  – PostgreSQL connection string (Neon, Supabase, Railway, etc.)
 */
import app from '../artifacts/api-server/src/app';

export default app;
