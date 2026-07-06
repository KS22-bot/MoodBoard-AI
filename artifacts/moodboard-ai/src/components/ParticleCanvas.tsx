import { useEffect, useRef } from 'react';
import type { AnimationSettings } from '@workspace/api-client-react';

interface ParticleCanvasProps {
  settings?: AnimationSettings;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  type: 'orb' | 'leaf';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export function ParticleCanvas({ settings }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Defaults if no settings
    const currentSettings = settings || {
      particleCount: 80,
      speed: 1,
      glowIntensity: 0.5,
      fogOpacity: 0.3,
      windStrength: 0.5,
      colorTint: '#F0C8D8' // Petal pink
    };

    // Initialize particles
    for (let i = 0; i < currentSettings.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * currentSettings.speed,
        speedY: (Math.random() * -1 - 0.5) * currentSettings.speed,
        type: Math.random() > 0.8 ? 'leaf' : 'orb',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05 * currentSettings.speed,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      // Clear with slight trail effect
      ctx.fillStyle = `rgba(252, 245, 240, ${1 - currentSettings.fogOpacity * 0.5})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      particles.forEach((p) => {
        // Update position
        p.x += p.speedX + currentSettings.windStrength + mouseRef.current.x * 0.01;
        p.y += p.speedY + mouseRef.current.y * 0.01;
        p.rotation += p.rotationSpeed;

        // Wrap around
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'orb') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = currentSettings.colorTint;
          ctx.globalAlpha = p.opacity;
          
          if (currentSettings.glowIntensity > 0) {
            ctx.shadowBlur = 15 * currentSettings.glowIntensity;
            ctx.shadowColor = currentSettings.colorTint;
          }
          
          ctx.fill();
        } else {
          // Leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
          ctx.fillStyle = currentSettings.colorTint;
          ctx.globalAlpha = p.opacity * 0.7;
          ctx.fill();
        }

        ctx.restore();
      });

      // Fog layer overlay
      if (currentSettings.fogOpacity > 0) {
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, `rgba(240, 225, 215, ${currentSettings.fogOpacity * 0.6})`);
        gradient.addColorStop(1, 'rgba(240, 225, 215, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
