import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type AuraEnergy = { label: string; value: number };
type AuraData = { title: string; description: string; energies: AuraEnergy[] };

const auraMap: Record<string, AuraData> = {
  calm:      { title: "Quiet Soul",      description: "Your thoughts are still, and your presence fills the room.", energies: [{label: 'Peace', value: 85}, {label: 'Clarity', value: 78}, {label: 'Reflection', value: 90}, {label: 'Warmth', value: 65}, {label: 'Creativity', value: 45}] },
  happy:     { title: "Morning Dreamer", description: "You carry light wherever you wander.", energies: [{label: 'Joy', value: 90}, {label: 'Energy', value: 82}, {label: 'Hope', value: 88}, {label: 'Warmth', value: 75}, {label: 'Peace', value: 70}] },
  sad:       { title: "Gentle Storm",    description: "Beneath the rain, something quiet is still growing.", energies: [{label: 'Reflection', value: 92}, {label: 'Depth', value: 85}, {label: 'Tenderness', value: 78}, {label: 'Hope', value: 55}, {label: 'Peace', value: 60}] },
  nostalgic: { title: "Wandering Light", description: "You hold the past gently, like sunlight through old glass.", energies: [{label: 'Reflection', value: 88}, {label: 'Warmth', value: 80}, {label: 'Depth', value: 75}, {label: 'Peace', value: 70}, {label: 'Creativity', value: 65}] },
  anxious:   { title: "Silver Fog",      description: "The uncertainty you feel is proof you care deeply.", energies: [{label: 'Awareness', value: 82}, {label: 'Depth', value: 78}, {label: 'Energy', value: 70}, {label: 'Clarity', value: 45}, {label: 'Peace', value: 40}] },
  energetic: { title: "Wild Current",    description: "You move like electricity — bright, fast, alive.", energies: [{label: 'Energy', value: 95}, {label: 'Drive', value: 88}, {label: 'Joy', value: 80}, {label: 'Creativity', value: 75}, {label: 'Warmth', value: 70}] },
  hopeful:   { title: "Forest Heart",    description: "You believe in what is still becoming.", energies: [{label: 'Hope', value: 92}, {label: 'Warmth', value: 85}, {label: 'Peace', value: 78}, {label: 'Creativity', value: 72}, {label: 'Joy', value: 80}] },
  lonely:    { title: "Moon Keeper",     description: "Your solitude is a lantern, not a wall.", energies: [{label: 'Reflection', value: 90}, {label: 'Depth', value: 88}, {label: 'Tenderness', value: 75}, {label: 'Peace', value: 65}, {label: 'Clarity', value: 60}] },
  romantic:  { title: "Tender Ember",    description: "You love with the patience of tides.", energies: [{label: 'Warmth', value: 92}, {label: 'Tenderness', value: 88}, {label: 'Depth', value: 80}, {label: 'Joy', value: 75}, {label: 'Peace', value: 70}] },
  creative:  { title: "Ink & Light",     description: "Ideas are your most natural weather.", energies: [{label: 'Creativity', value: 95}, {label: 'Curiosity', value: 88}, {label: 'Energy', value: 80}, {label: 'Joy', value: 75}, {label: 'Depth', value: 72}] },
};

const defaultAura: AuraData = {
  title: "Wandering Spirit",
  description: "A unique blend of unknown energies.",
  energies: [
    { label: 'Mystery', value: 75 },
    { label: 'Depth', value: 80 },
    { label: 'Energy', value: 65 },
    { label: 'Peace', value: 70 },
    { label: 'Warmth', value: 85 },
  ]
};

interface AuraCardProps {
  mood: string;
}

export function AuraCard({ mood }: AuraCardProps) {
  const [aura, setAura] = useState<AuraData | null>(null);

  useEffect(() => {
    // Generate derived aura and add randomness on mount
    const normalizedMood = mood.toLowerCase();
    // Find the first mood word that matches or just fallback
    const matchedKey = Object.keys(auraMap).find(k => normalizedMood.includes(k));
    const baseAura = matchedKey ? auraMap[matchedKey] : defaultAura;

    const randomizedEnergies = baseAura.energies.map(energy => {
      const variation = Math.floor(Math.random() * 17) - 8; // -8 to +8
      const newValue = Math.max(20, Math.min(98, energy.value + variation));
      return { ...energy, value: newValue };
    });

    setAura({ ...baseAura, energies: randomizedEnergies });
  }, [mood]);

  if (!aura) return null;

  return (
    <div className="bg-black/20 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center">
      <h3 className="text-2xl font-serif italic text-glow mb-2">{aura.title}</h3>
      <p className="text-sm text-muted-foreground italic mb-8 max-w-md">
        {aura.description}
      </p>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {aura.energies.map((energy, i) => (
          <AuraRing key={i} label={energy.label} value={energy.value} delay={i * 0.15} />
        ))}
      </div>
    </div>
  );
}

function AuraRing({ label, value, delay }: { label: string; value: number; delay: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  // 270 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (value / 100) * arcLength;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[70px] h-[70px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 70 70">
          {/* Background track */}
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated value track */}
          <motion.circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(119,141,169,0.5))' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm">
          <Counter value={value} delay={delay} />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Counter({ value, delay }: { value: number; delay: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;
    
    // Convert delay to ms
    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOut * value));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return <span>{count}%</span>;
}
