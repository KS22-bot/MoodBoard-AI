import { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Wind, Trees, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';

export function AudioToggle() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const sounds = [
    { id: 'forest', name: 'Forest', icon: Trees },
    { id: 'rain', name: 'Rain', icon: CloudRain },
    { id: 'wind', name: 'Wind', icon: Wind },
    { id: 'river', name: 'River', icon: Waves },
  ];

  const toggleSound = (id: string) => {
    if (activeSound === id) {
      setActiveSound(null);
    } else {
      setActiveSound(id);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full glass-card hover:bg-white/10 transition-colors"
          >
            {activeSound ? (
              <Volume2 className="w-5 h-5 text-primary" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-56 glass-card border-white/10 p-2 rounded-2xl mr-6 mt-2"
          align="end"
        >
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5 mb-1">
              Ambient Sounds
            </h4>
            {sounds.map((sound) => {
              const Icon = sound.icon;
              const isActive = activeSound === sound.id;
              
              return (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'hover:bg-white/5 text-foreground/80 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{sound.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
