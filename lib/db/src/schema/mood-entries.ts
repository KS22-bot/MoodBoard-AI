import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moodEntriesTable = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  moodText: text("mood_text").notNull(),
  detectedMood: text("detected_mood").notNull(),
  poem: text("poem").notNull(),
  // Playlist fields
  playlistQuery: text("playlist_query").notNull(),
  playlistGenre: text("playlist_genre").notNull(),
  playlistYoutubeUrl: text("playlist_youtube_url").notNull(),
  // Palette stored as JSON string
  palette: text("palette").notNull(), // JSON array of { hex, name }
  // Animation settings
  particleCount: integer("particle_count").notNull(),
  speed: real("speed").notNull(),
  glowIntensity: real("glow_intensity").notNull(),
  fogOpacity: real("fog_opacity").notNull(),
  windStrength: real("wind_strength").notNull(),
  colorTint: text("color_tint").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMoodEntrySchema = createInsertSchema(moodEntriesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntriesTable.$inferSelect;
