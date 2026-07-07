/**
 * Vercel serverless entry point.
 * Wraps the Express app and handles all /api/* requests.
 *
 * Required environment variables (set in Vercel project settings):
 *   DATABASE_URL  – PostgreSQL connection string (e.g. from Neon or Supabase)
 *   SESSION_SECRET – Random string used for session signing
 */
import app from '../artifacts/api-server/src/app.js';

export default app;
