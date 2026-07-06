import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Sparkles, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import { 
  useGenerateMood, 
  useGetMoodHistory, 
  getGetMoodHistoryQueryKey,
  type MoodResult 
} from '@workspace/api-client-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import { VoiceInput } from '@/components/VoiceInput';
import { AudioToggle } from '@/components/AudioToggle';
import { MoodCard } from '@/components/MoodCard';
import { HistoryCard } from '@/components/HistoryCard';

export default function Home() {
  const [mood, setMood] = useState('');
  const [activeResult, setActiveResult] = useState<MoodResult | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const generateMood = useGenerateMood();
  const { data: history } = useGetMoodHistory();

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mood.trim() || generateMood.isPending) return;

    generateMood.mutate(
      { data: { mood } },
      {
        onSuccess: (result) => {
          setActiveResult(result);
          setMood('');
          queryClient.invalidateQueries({ queryKey: getGetMoodHistoryQueryKey() });
          
          // Scroll to result smoothly after a brief delay for render
          setTimeout(() => {
            document.getElementById('mood-card-export')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
          }, 100);
        }
      }
    );
  };

  const handleTranscript = (text: string) => {
    setMood(text);
  };

  return (
    <main className="min-h-[100dvh] relative overflow-x-hidden mesh-bg text-foreground selection:bg-primary/30">
      <ParticleCanvas settings={activeResult?.animation} />
      <AudioToggle />
      
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-start min-h-screen">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center w-full max-w-2xl mx-auto space-y-8 mb-16"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-glow">
              MoodBoard AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-lg mx-auto">
              Breathe your feelings into existence. We'll grow a world around them.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="relative max-w-xl mx-auto flex items-center group">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-xl transition-all duration-500 group-hover:bg-white/10 group-hover:blur-2xl" />
            <div className="relative flex w-full items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:bg-black/60">
              <Input
                type="text"
                placeholder="How are you feeling right now?"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                disabled={generateMood.isPending}
                className="flex-1 border-0 bg-transparent text-base md:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-muted-foreground/50 h-12"
              />
              <div className="flex items-center gap-2 pr-1">
                <VoiceInput onTranscript={handleTranscript} isGenerating={generateMood.isPending} />
                <Button 
                  type="submit" 
                  disabled={!mood.trim() || generateMood.isPending}
                  className="rounded-full px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {generateMood.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-pulse">Growing</span>
                      <span className="flex space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Generate <Sparkles className="w-4 h-4 ml-1" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Loading State Overlay */}
        <AnimatePresence>
          {generateMood.isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            >
              <div className="flex flex-col items-center space-y-8">
                <div className="relative w-24 h-24 flex items-center justify-center text-primary">
                  <div className="absolute animate-grow-seed"><div className="w-4 h-4 rounded-full bg-primary" /></div>
                  <div className="absolute animate-grow-sprout"><svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-1.5 7-6.5 9-11 0 0-4.5 1-9 11Z"/><path d="M10 20c-5.5-1.5-7-6.5-9-11 0 0 4.5 1 9 11Z"/></svg></div>
                  <div className="absolute animate-grow-tree"><svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-8"/><path d="m5 14 7-6 7 6"/><path d="m7 10 5-6 5 6"/></svg></div>
                </div>
                <p className="text-xl font-serif italic text-primary/80 animate-pulse text-glow">
                  Growing your world...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Result */}
        <AnimatePresence mode="wait">
          {activeResult && !generateMood.isPending && (
            <div className="w-full pb-16">
              <MoodCard data={activeResult} />
            </div>
          )}
        </AnimatePresence>

        {/* Recent History */}
        {history && history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full max-w-5xl mt-auto pt-16 border-t border-white/5"
          >
            <div className="flex justify-between items-center mb-8 px-4">
              <h2 className="text-xl font-serif text-foreground/80 flex items-center gap-2">
                <History className="w-5 h-5 opacity-50" />
                Recent Moods
              </h2>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setLocation('/history')}
              >
                View all
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
              {history.slice(0, 4).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                >
                  <HistoryCard 
                    entry={entry} 
                    onClick={() => {
                      setActiveResult(entry);
                      setTimeout(() => {
                        document.getElementById('mood-card-export')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'center'
                        });
                      }, 100);
                    }} 
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
