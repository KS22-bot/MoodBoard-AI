import { useEffect, useRef } from 'react';
import type { AnimationSettings } from '@workspace/api-client-react';
import type { TimeConfig } from '../hooks/useTimeOfDay';

interface ParticleCanvasProps {
  settings?: AnimationSettings;
  timeConfig?: TimeConfig;
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

export function ParticleCanvas({ settings, timeConfig }: ParticleCanvasProps) {
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
    let angleAccumulator = 0;

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
      colorTint: '#778DA9' // Lavender gray
    };

    // Low-end device detection
    const isLowEnd = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
    const adjustedCount = isLowEnd 
      ? Math.floor(currentSettings.particleCount * 0.6) 
      : currentSettings.particleCount;

    // Time-of-day multipliers
    const speedMult = timeConfig?.particleSpeedMult ?? 1;
    const fogMult = timeConfig?.fogBoost ?? 1;

    // Initialize particles
    for (let i = 0; i < adjustedCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * currentSettings.speed * speedMult,
        speedY: (Math.random() * -1 - 0.5) * currentSettings.speed * speedMult,
        type: Math.random() > 0.8 ? 'leaf' : 'orb',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05 * currentSettings.speed * speedMult,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    // Add stars at night
    if (timeConfig?.period === 'night') {
      const starCount = isLowEnd ? 30 : 60;
      for (let i = 0; i < starCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.05,
          speedY: (Math.random() - 0.5) * 0.05,
          type: 'orb',
          rotation: 0,
          rotationSpeed: 0,
          opacity: Math.random() * 0.6 + 0.2
        });
      }
    }

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      angleAccumulator += 0.002;

      // Clear with slight trail effect (Dark Navy)
      ctx.fillStyle = `rgba(22, 32, 48, ${1 - currentSettings.fogOpacity * 0.5 * fogMult})`;
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
          if (timeConfig?.particleColorBoost && p.size > 2) {
             ctx.fillStyle = timeConfig.particleColorBoost;
          }
          ctx.globalAlpha = p.opacity;
          
          if (currentSettings.glowIntensity > 0) {
            ctx.shadowBlur = 15 * currentSettings.glowIntensity;
            ctx.shadowColor = ctx.fillStyle;
          }
          
          ctx.fill();
        } else {
          // Leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
          ctx.fillStyle = timeConfig?.particleColorBoost || currentSettings.colorTint;
          ctx.globalAlpha = p.opacity * 0.7;
          ctx.fill();
        }

        ctx.restore();
      });

      // Fog layer overlay (Dusty Blue base)
      if (currentSettings.fogOpacity > 0) {
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, `rgba(65, 90, 119, ${currentSettings.fogOpacity * 0.6 * fogMult})`);
        gradient.addColorStop(1, 'rgba(65, 90, 119, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(22, 32, 48, 0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Light Rays (Evening / Night)
      if (timeConfig?.period === 'evening' || timeConfig?.period === 'night') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.sin(angleAccumulator) * 0.1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        const rayGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        rayGrad.addColorStop(0, 'rgba(119,141,169,0.05)');
        rayGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.2, -100);
        ctx.lineTo(canvas.width * 0.8, -100);
        ctx.lineTo(canvas.width * 1.2, canvas.height + 100);
        ctx.lineTo(-canvas.width * 0.2, canvas.height + 100);
        ctx.fill();
        ctx.restore();
      }

      // Film Grain
      if (frameCount % 3 === 0 && !isLowEnd) {
        ctx.fillStyle = 'white';
        for (let i = 0; i < 300; i++) {
          ctx.globalAlpha = Math.random() * 0.03;
          ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
        }
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Pause on hidden tab
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings, timeConfig]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
