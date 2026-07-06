import { Check, Copy, Download, FileJson, FileText, Music, Play } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MoodResult } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';

interface MoodCardProps {
  data: MoodResult;
}

export function MoodCard({ data }: MoodCardProps) {
  const [copiedSwatch, setCopiedSwatch] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSwatch(id);
    setTimeout(() => setCopiedSwatch(null), 2000);
  };

  const copyAllColors = () => {
    const text = data.palette.map(c => `${c.name}: ${c.hex}`).join('\n');
    copyToClipboard(text, 'all');
  };

  const handleExport = (type: 'json' | 'txt') => {
    let content = '';
    let mime = '';
    let ext = '';

    if (type === 'json') {
      content = JSON.stringify(data, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      content = `Mood: ${data.detectedMood}\n\nPoem:\n${data.poem}\n\nColors:\n${data.palette.map(c => `${c.name}: ${c.hex}`).join('\n')}\n\nVibe:\n${data.playlist.genre} - ${data.playlist.query}`;
      mime = 'text/plain';
      ext = 'txt';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-${data.detectedMood.replace(/\s+/g, '-')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-[2rem] p-8 md:p-10 w-full max-w-3xl mx-auto flex flex-col gap-10"
      id="mood-card-export"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-sm font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: data.palette[0]?.hex || '#95D5B2' }} />
          {data.detectedMood.toUpperCase()}
        </div>
        
        <blockquote className="text-2xl md:text-4xl font-serif italic font-light leading-relaxed text-glow text-foreground/90 max-w-2xl">
          "{data.poem}"
        </blockquote>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Color Palette */}
        <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Color Palette</h3>
            <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-white/10" onClick={copyAllColors}>
              {copiedSwatch === 'all' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copiedSwatch === 'all' ? 'Copied' : 'Copy All'}
            </Button>
          </div>
          <div className="flex gap-2 h-24 mb-4">
            {data.palette.map((color, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-xl cursor-pointer relative group overflow-hidden"
                style={{ backgroundColor: color.hex }}
                whileHover={{ y: -4, scale: 1.05 }}
                onClick={() => copyToClipboard(color.hex, `color-${i}`)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  {copiedSwatch === `color-${i}` ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {data.palette.map((color, i) => (
              <span key={i} className="truncate w-1/5 text-center px-1" title={color.name}>
                {color.hex}
              </span>
            ))}
          </div>
        </div>

        {/* Playlist Vibe */}
        <div className="bg-black/20 rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Soundscape</h3>
            </div>
            <div className="mb-2">
              <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-foreground/80">
                {data.playlist.genre}
              </span>
            </div>
            <p className="text-lg font-medium mt-3 mb-6">{data.playlist.query}</p>
          </div>
          <a
            href={data.playlist.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full bg-white/10 hover:bg-white/20 text-foreground border border-white/10 group">
              <Play className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
              Open on YouTube
            </Button>
          </a>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex justify-center gap-4">
        <Button variant="ghost" size="sm" className="hover:bg-white/10" onClick={() => handleExport('json')}>
          <FileJson className="w-4 h-4 mr-2" /> Export JSON
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-white/10" onClick={() => handleExport('txt')}>
          <FileText className="w-4 h-4 mr-2" /> Export TXT
        </Button>
      </div>
    </motion.div>
  );
}
