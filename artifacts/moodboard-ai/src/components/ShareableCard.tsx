import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Share2 } from 'lucide-react';
import type { MoodResult } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';

interface ShareableCardProps {
  data: MoodResult;
  auraTitle?: string;
}

export function ShareableCard({ data, auraTitle = "Wandering Spirit" }: ShareableCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    drawCanvas();
  }, [data, auraTitle]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // 1. Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1B263B'); // Navy
    gradient.addColorStop(1, '#415A77'); // Dusty Blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Particle dots
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 1;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.05})`;
      ctx.fill();
    }

    // 3. Top Branding
    ctx.font = '300 24px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('MoodBoard AI', width - 60, 80);

    // 4. Mood badge
    ctx.textAlign = 'center';
    ctx.font = '500 28px Inter, sans-serif';
    const moodText = data.detectedMood.toUpperCase();
    const textWidth = ctx.measureText(moodText).width;
    const badgeWidth = textWidth + 80;
    const badgeHeight = 60;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = 160;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(moodText, width / 2, badgeY + 40);

    // 5. Poem quote
    ctx.font = 'italic 300 48px "Playfair Display", serif';
    ctx.fillStyle = '#FFFFFF';
    const maxWidth = 800;
    const words = data.poem.split(' ');
    let line = '';
    let y = 400;
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    lines.forEach((l) => {
      ctx.fillText(l.trim(), width / 2, y);
      y += 70;
    });

    // 6. Date
    y += 40;
    ctx.font = '400 24px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    ctx.fillText(dateStr, width / 2, y);

    // 7. Aura Title
    y += 180;
    ctx.font = 'italic 400 40px "Playfair Display", serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(auraTitle, width / 2, y);

    // 8. Color Palette
    y += 80;
    const swatchWidth = 120;
    const swatchHeight = 120;
    const spacing = 40;
    const numSwatches = data.palette.length;
    const totalSwatchesWidth = numSwatches * swatchWidth + (numSwatches - 1) * spacing;
    const startX = (width - totalSwatchesWidth) / 2;

    data.palette.forEach((color, i) => {
      const cx = startX + i * (swatchWidth + spacing);
      
      // Swatch
      ctx.fillStyle = color.hex;
      ctx.beginPath();
      ctx.roundRect(cx, y, swatchWidth, swatchHeight, 24);
      ctx.fill();

      // Hex label
      ctx.font = '500 20px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(color.hex.toUpperCase(), cx + swatchWidth / 2, y + swatchHeight + 40);
    });

    // 9. Generate blob and preview
    canvas.toBlob((b) => {
      if (b) {
        setBlob(b);
        setPreviewUrl(URL.createObjectURL(b));
      }
    }, 'image/png');
  };

  const downloadImage = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `moodboard-${data.detectedMood.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const copyImage = async () => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
    } catch (err) {
      console.error('Failed to copy image', err);
    }
  };

  const shareImage = async () => {
    if (!blob) return;
    const file = new File([blob], 'moodboard.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My MoodBoard',
          text: 'Generated with MoodBoard AI'
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      copyImage();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-8 pt-8 border-t border-white/10">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {previewUrl && (
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10">
          <img 
            src={previewUrl} 
            alt="Shareable preview" 
            className="w-[200px] h-auto transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="bg-black/20 hover:bg-white/10 border-white/10" onClick={downloadImage}>
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
        <Button variant="outline" className="bg-black/20 hover:bg-white/10 border-white/10" onClick={copyImage}>
          <Copy className="w-4 h-4 mr-2" /> Copy
        </Button>
        <Button variant="outline" className="bg-black/20 hover:bg-white/10 border-white/10" onClick={shareImage}>
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
      </div>
    </div>
  );
}
