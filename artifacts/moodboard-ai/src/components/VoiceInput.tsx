import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isGenerating: boolean;
}

export function VoiceInput({ onTranscript, isGenerating }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (isGenerating) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        // Handle case where it might already be started
        setIsRecording(false);
      }
    }
  };

  if (!recognitionRef.current && typeof window !== 'undefined') {
    // If not supported, don't show the button
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`rounded-full transition-all duration-300 ${
        isRecording 
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 animate-pulse' 
          : 'text-muted-foreground hover:text-primary hover:bg-white/5'
      }`}
      onClick={toggleRecording}
      disabled={isGenerating}
      title={isRecording ? 'Stop recording' : 'Voice input'}
    >
      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </Button>
  );
}
