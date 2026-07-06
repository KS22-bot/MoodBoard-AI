/**
 * Mood Engine — detects mood from text and generates matching content.
 * Designed to be easily swapped for an AI API in the future.
 */

export type MoodCategory =
  | "calm"
  | "happy"
  | "sad"
  | "nostalgic"
  | "anxious"
  | "energetic"
  | "hopeful"
  | "lonely"
  | "romantic"
  | "creative";

interface ColorSwatch {
  hex: string;
  name: string;
}

interface PlaylistVibe {
  query: string;
  genre: string;
  youtubeUrl: string;
}

interface AnimationSettings {
  particleCount: number;
  speed: number;
  glowIntensity: number;
  fogOpacity: number;
  windStrength: number;
  colorTint: string;
}

export interface MoodProfile {
  detectedMood: MoodCategory;
  poem: string;
  playlist: PlaylistVibe;
  palette: ColorSwatch[];
  animation: AnimationSettings;
}

// Keyword maps for mood detection
const moodKeywords: Record<MoodCategory, string[]> = {
  calm: ["calm", "peace", "peaceful", "quiet", "still", "serene", "relax", "tranquil", "gentle", "soft", "rest", "sooth"],
  happy: ["happy", "joy", "joyful", "excited", "great", "wonderful", "amazing", "glad", "cheerful", "bright", "fun", "laugh", "smile"],
  sad: ["sad", "cry", "tears", "grief", "loss", "hurt", "pain", "sorrow", "blue", "down", "depressed", "unhappy", "miss"],
  nostalgic: ["nostalgic", "memory", "memories", "remember", "past", "childhood", "old", "summer", "nostalgia", "vintage", "then", "used to", "long ago"],
  anxious: ["anxious", "anxiety", "worried", "worry", "stress", "nervous", "exam", "fear", "scared", "dread", "overwhelm", "panic"],
  energetic: ["energetic", "energy", "alive", "active", "pump", "run", "fire", "electric", "vibrant", "wild", "rush", "hype", "power"],
  hopeful: ["hopeful", "hope", "optimistic", "future", "looking forward", "better", "bright", "believe", "dream", "possible", "tomorrow"],
  lonely: ["lonely", "alone", "isolation", "solitude", "empty", "missing", "hollow", "apart", "nobody", "without"],
  romantic: ["romantic", "love", "heart", "tender", "intimate", "longing", "desire", "warm", "together", "close", "cherish"],
  creative: ["creative", "inspire", "art", "create", "imagine", "wonder", "curious", "explore", "build", "idea", "invent", "write"],
};

// Multiple poems per mood to avoid repetition
const moodPoems: Record<MoodCategory, string[]> = {
  calm: [
    "The forest remembers every quiet step.",
    "Still water holds the whole sky inside.",
    "Even the wind pauses to listen sometimes.",
    "Silence grows its own kind of garden.",
    "Between each breath, a world rests.",
  ],
  happy: [
    "The morning forgot to be anything but golden.",
    "Light arrives even when no one is watching.",
    "Every door left open lets something beautiful in.",
    "The sun rehearses joy without trying.",
    "Somewhere a song knows exactly how you feel.",
  ],
  sad: [
    "Even tired skies eventually bloom.",
    "Rain knows things the sun never learns.",
    "Grief is love with nowhere left to go.",
    "The sea keeps all the things we could not say.",
    "Some tears are just old laughter finding its way home.",
  ],
  nostalgic: [
    "Summer lives in amber longer than we think.",
    "Memory is a house with all the lights still on.",
    "The past keeps sending letters we never finish reading.",
    "Somewhere a screen door still swings open into August.",
    "Old music knows the shape of who we were.",
  ],
  anxious: [
    "The wind carries tomorrow before we notice.",
    "Not every storm forgets to pass.",
    "Even the shaking leaf holds on until morning.",
    "Worry is a bridge you build before the river.",
    "Beneath the noise, your breath is still steady.",
  ],
  energetic: [
    "The sky burns because it has something to say.",
    "Motion is just excitement that found a direction.",
    "Every spark remembers what it came from.",
    "You are the kind of thunder that arrives early.",
    "The pulse of things is always louder than we expect.",
  ],
  hopeful: [
    "Every seed carries an entire forest inside.",
    "Light has a habit of arriving uninvited.",
    "Tomorrow is always being quietly assembled.",
    "Something small is always becoming something whole.",
    "The horizon keeps moving just to stay ahead of you.",
  ],
  lonely: [
    "Solitude teaches the sky its deepest blue.",
    "Even alone, you cast a shadow toward someone.",
    "Distance is just the space between two knowings.",
    "The moon never wonders why it shines alone.",
    "Your silence holds more than most rooms do.",
  ],
  romantic: [
    "Warmth finds a way through every window.",
    "Some distances collapse at the mention of a name.",
    "The heart builds rooms it never planned for.",
    "You arrived and the whole season rearranged itself.",
    "Tenderness is just attention given its full weight.",
  ],
  creative: [
    "Every blank page is a world holding its breath.",
    "The mind invents doors where walls used to be.",
    "Wonder is just curiosity that stayed for dinner.",
    "Creation begins with a single unreasonable yes.",
    "Art is what happens when imagination overflows.",
  ],
};

const moodPlaylists: Record<MoodCategory, { query: string; genre: string }> = {
  calm: { query: "lofi forest rain ambient", genre: "Lo-fi Ambient" },
  happy: { query: "feel good indie pop uplifting", genre: "Indie Pop" },
  sad: { query: "melancholic piano emotional", genre: "Neoclassical" },
  nostalgic: { query: "nostalgic 80s dreamy synth", genre: "Synthwave" },
  anxious: { query: "calming anxiety relief music", genre: "Meditation" },
  energetic: { query: "energetic electronic pump up", genre: "Electronic" },
  hopeful: { query: "hopeful indie acoustic morning", genre: "Hopeful Acoustic" },
  lonely: { query: "solitude ambient dark contemplative", genre: "Dark Ambient" },
  romantic: { query: "romantic jazz candlelight", genre: "Jazz" },
  creative: { query: "creative focus instrumental flow", genre: "Flow State" },
};

const moodPalettes: Record<MoodCategory, ColorSwatch[]> = {
  calm: [
    { hex: "#D4E8D0", name: "Pale Sage" },
    { hex: "#E8D5C4", name: "Warm Sand" },
    { hex: "#F2E6DA", name: "Bare Linen" },
    { hex: "#EDE0D4", name: "Nude" },
    { hex: "#FAF7F4", name: "Ivory Breath" },
  ],
  happy: [
    { hex: "#FFE5CC", name: "Peach Cream" },
    { hex: "#FFD6BA", name: "Soft Apricot" },
    { hex: "#FFF0D6", name: "Pale Honey" },
    { hex: "#FFE8D6", name: "Blush Peach" },
    { hex: "#FFF8EE", name: "Morning Glow" },
  ],
  sad: [
    { hex: "#C8D8E8", name: "Powder Blue" },
    { hex: "#D8E4EE", name: "Misty Slate" },
    { hex: "#D6D0E0", name: "Pale Periwinkle" },
    { hex: "#E8EEF4", name: "Soft Cloud" },
    { hex: "#F4F2F8", name: "Barely Lilac" },
  ],
  nostalgic: [
    { hex: "#E8C8B8", name: "Dusty Peach" },
    { hex: "#DEB8A0", name: "Rosy Sand" },
    { hex: "#F0D8C8", name: "Nude Blush" },
    { hex: "#F5E8DC", name: "Warm Parchment" },
    { hex: "#FAF2EC", name: "Ivory Rose" },
  ],
  anxious: [
    { hex: "#D8D0E8", name: "Pale Lilac" },
    { hex: "#C8C0D8", name: "Mist Mauve" },
    { hex: "#E0DCF0", name: "Powder Violet" },
    { hex: "#EAE8F4", name: "Soft Iris" },
    { hex: "#F4F3FA", name: "Barely Lavender" },
  ],
  energetic: [
    { hex: "#FFB8A8", name: "Coral Blush" },
    { hex: "#FFCAB8", name: "Soft Coral" },
    { hex: "#FFD8C8", name: "Peach Glow" },
    { hex: "#FFE8D8", name: "Blush Petal" },
    { hex: "#FFF0E8", name: "Ivory Coral" },
  ],
  hopeful: [
    { hex: "#B8E8D8", name: "Mint Whisper" },
    { hex: "#C8F0E0", name: "Pale Aqua" },
    { hex: "#D8F4EA", name: "Breath of Green" },
    { hex: "#FFE5C8", name: "Warm Peach" },
    { hex: "#FFF8F0", name: "Soft Dawn" },
  ],
  lonely: [
    { hex: "#C8C0D0", name: "Dusty Mauve" },
    { hex: "#D0C8D8", name: "Pale Wisteria" },
    { hex: "#E0D8E8", name: "Powder Iris" },
    { hex: "#EAE4F0", name: "Soft Lilac" },
    { hex: "#F4F2F8", name: "Ghostly" },
  ],
  romantic: [
    { hex: "#F0C8D8", name: "Petal Pink" },
    { hex: "#F0B8C8", name: "Blush Rose" },
    { hex: "#F8D0E0", name: "Soft Bloom" },
    { hex: "#FAE0EC", name: "Rose Mist" },
    { hex: "#FEF0F6", name: "Barely Pink" },
  ],
  creative: [
    { hex: "#E0C8F0", name: "Lavender Mist" },
    { hex: "#D8C0E8", name: "Soft Orchid" },
    { hex: "#ECD8F8", name: "Pale Violet" },
    { hex: "#C8E8D8", name: "Mint Dream" },
    { hex: "#F0E8FA", name: "Dream Powder" },
  ],
};

const moodAnimations: Record<MoodCategory, AnimationSettings> = {
  calm: { particleCount: 40, speed: 0.3, glowIntensity: 0.4, fogOpacity: 0.3, windStrength: 0.1, colorTint: "#D4E8D0" },
  happy: { particleCount: 80, speed: 0.7, glowIntensity: 0.7, fogOpacity: 0.1, windStrength: 0.3, colorTint: "#FFD6BA" },
  sad: { particleCount: 30, speed: 0.2, glowIntensity: 0.2, fogOpacity: 0.5, windStrength: 0.05, colorTint: "#C8D8E8" },
  nostalgic: { particleCount: 60, speed: 0.25, glowIntensity: 0.35, fogOpacity: 0.45, windStrength: 0.15, colorTint: "#E8C8B8" },
  anxious: { particleCount: 100, speed: 1.2, glowIntensity: 0.3, fogOpacity: 0.2, windStrength: 0.8, colorTint: "#D8D0E8" },
  energetic: { particleCount: 150, speed: 1.8, glowIntensity: 0.9, fogOpacity: 0.05, windStrength: 0.6, colorTint: "#FFB8A8" },
  hopeful: { particleCount: 70, speed: 0.5, glowIntensity: 0.65, fogOpacity: 0.15, windStrength: 0.2, colorTint: "#B8E8D8" },
  lonely: { particleCount: 20, speed: 0.15, glowIntensity: 0.15, fogOpacity: 0.6, windStrength: 0.02, colorTint: "#D0C8D8" },
  romantic: { particleCount: 55, speed: 0.35, glowIntensity: 0.6, fogOpacity: 0.25, windStrength: 0.1, colorTint: "#F0C8D8" },
  creative: { particleCount: 90, speed: 0.8, glowIntensity: 0.75, fogOpacity: 0.1, windStrength: 0.4, colorTint: "#E0C8F0" },
};

function detectMood(text: string): MoodCategory {
  const lower = text.toLowerCase();
  const scores: Record<MoodCategory, number> = {
    calm: 0, happy: 0, sad: 0, nostalgic: 0, anxious: 0,
    energetic: 0, hopeful: 0, lonely: 0, romantic: 0, creative: 0,
  };

  for (const [mood, keywords] of Object.entries(moodKeywords) as [MoodCategory, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[mood] += 1;
      }
    }
  }

  // Return the mood with the highest score; default to "calm"
  let best: MoodCategory = "calm";
  let bestScore = 0;
  for (const [mood, score] of Object.entries(scores) as [MoodCategory, number][]) {
    if (score > bestScore) {
      best = mood;
      bestScore = score;
    }
  }
  return best;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMoodProfile(moodText: string): MoodProfile {
  const detectedMood = detectMood(moodText);
  const poem = pickRandom(moodPoems[detectedMood]);
  const { query, genre } = moodPlaylists[detectedMood];
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return {
    detectedMood,
    poem,
    playlist: { query, genre, youtubeUrl },
    palette: moodPalettes[detectedMood],
    animation: moodAnimations[detectedMood],
  };
}
