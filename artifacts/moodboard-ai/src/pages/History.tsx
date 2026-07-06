import { useLocation } from 'wouter';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import { 
  useGetMoodHistory, 
  useDeleteMoodEntry,
  getGetMoodHistoryQueryKey
} from '@workspace/api-client-react';

import { Button } from '@/components/ui/button';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import { HistoryCard } from '@/components/HistoryCard';

export default function HistoryPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: history, isLoading } = useGetMoodHistory();
  const deleteEntry = useDeleteMoodEntry();

  const handleDelete = (id: number) => {
    deleteEntry.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMoodHistoryQueryKey() });
        }
      }
    );
  };

  return (
    <main className="min-h-[100dvh] relative overflow-x-hidden mesh-bg text-foreground selection:bg-primary/30">
      <ParticleCanvas settings={{
        particleCount: 40,
        speed: 0.5,
        glowIntensity: 0.2,
        fogOpacity: 0.5,
        windStrength: 0.2,
        colorTint: '#2D6A4F' // Moss green for history page
      }} />
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 min-h-screen flex flex-col">
        <div className="flex items-center gap-4 mb-12">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation('/')}
            className="rounded-full glass-card hover:bg-white/10 h-12 w-12"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-glow">
              Your Sanctuary
            </h1>
            <p className="text-muted-foreground mt-1">A history of past feelings and worlds.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center pt-24">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
            <div className="mb-6 opacity-50"><svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></div>
            <h2 className="text-xl font-serif mb-2">No memories yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Return to the clearing and plant your first seed to begin building your sanctuary.
            </p>
            <Button 
              variant="outline" 
              className="bg-black/20 border-white/10 hover:bg-white/10"
              onClick={() => setLocation('/')}
            >
              Return Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max pb-16">
            <AnimatePresence>
              {history.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ 
                    duration: 0.4, 
                    delay: i < 10 ? i * 0.05 : 0,
                    ease: "easeOut"
                  }}
                >
                  <HistoryCard 
                    entry={entry}
                    showFull={true}
                    onClick={() => {
                      // Optionally we could navigate back to home with this ID
                      // For now just expanding colors is enough context
                    }}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
