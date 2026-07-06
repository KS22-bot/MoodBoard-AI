import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, moodEntriesTable } from "@workspace/db";
import {
  GenerateMoodBody,
  GetMoodEntryParams,
  DeleteMoodEntryParams,
} from "@workspace/api-zod";
import { generateMoodProfile } from "../lib/mood-engine";

const router: IRouter = Router();

// Helper to map a DB row to the API MoodEntry shape
function rowToMoodEntry(row: typeof moodEntriesTable.$inferSelect) {
  const palette = JSON.parse(row.palette) as { hex: string; name: string }[];
  return {
    id: row.id,
    moodText: row.moodText,
    detectedMood: row.detectedMood,
    poem: row.poem,
    playlist: {
      query: row.playlistQuery,
      genre: row.playlistGenre,
      youtubeUrl: row.playlistYoutubeUrl,
    },
    palette,
    animation: {
      particleCount: row.particleCount,
      speed: row.speed,
      glowIntensity: row.glowIntensity,
      fogOpacity: row.fogOpacity,
      windStrength: row.windStrength,
      colorTint: row.colorTint,
    },
    createdAt: row.createdAt.toISOString(),
  };
}

// POST /generate
router.post("/generate", async (req, res): Promise<void> => {
  const parsed = GenerateMoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { mood } = parsed.data;
  const profile = generateMoodProfile(mood);

  // Persist to DB
  const [entry] = await db
    .insert(moodEntriesTable)
    .values({
      moodText: mood,
      detectedMood: profile.detectedMood,
      poem: profile.poem,
      playlistQuery: profile.playlist.query,
      playlistGenre: profile.playlist.genre,
      playlistYoutubeUrl: profile.playlist.youtubeUrl,
      palette: JSON.stringify(profile.palette),
      particleCount: profile.animation.particleCount,
      speed: profile.animation.speed,
      glowIntensity: profile.animation.glowIntensity,
      fogOpacity: profile.animation.fogOpacity,
      windStrength: profile.animation.windStrength,
      colorTint: profile.animation.colorTint,
    })
    .returning();

  res.json({
    id: entry.id,
    detectedMood: profile.detectedMood,
    poem: profile.poem,
    playlist: profile.playlist,
    palette: profile.palette,
    animation: profile.animation,
    createdAt: entry.createdAt.toISOString(),
  });
});

// GET /history
router.get("/history", async (req, res): Promise<void> => {
  const entries = await db
    .select()
    .from(moodEntriesTable)
    .orderBy(desc(moodEntriesTable.createdAt))
    .limit(20);

  res.json(entries.map(rowToMoodEntry));
});

// GET /history/:id
router.get("/history/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetMoodEntryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [entry] = await db
    .select()
    .from(moodEntriesTable)
    .where(eq(moodEntriesTable.id, params.data.id));

  if (!entry) {
    res.status(404).json({ error: "Mood entry not found" });
    return;
  }

  res.json(rowToMoodEntry(entry));
});

// DELETE /history/:id
router.delete("/history/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteMoodEntryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(moodEntriesTable)
    .where(eq(moodEntriesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Mood entry not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
