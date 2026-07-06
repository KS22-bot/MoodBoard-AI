import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import type { MoodEntry } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';

interface HistoryCardProps {
  entry: MoodEntry;
  onClick: () => void;
  onDelete?: (id: number) => void;
  showFull?: boolean;
}

export function HistoryCard({ entry, onClick, onDelete, showFull = false }: HistoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5 cursor-pointer flex flex-col gap-4 relative group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: entry.palette[0]?.hex || '#95D5B2' }} />
          {entry.detectedMood}
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(entry.createdAt), 'MMM d, yyyy')}
        </span>
      </div>

      <p className="font-serif italic text-sm text-foreground/80 line-clamp-2">
        "{entry.poem}"
      </p>

      <div className="flex items-center gap-2 mt-auto">
        {showFull ? (
          <div className="flex gap-1 flex-1">
            {entry.palette.map((color, i) => (
              <div
                key={i}
                className="h-4 flex-1 rounded-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-1.5">
            {entry.palette.slice(0, 3).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-black/20"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive text-muted-foreground w-8 h-8 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}
