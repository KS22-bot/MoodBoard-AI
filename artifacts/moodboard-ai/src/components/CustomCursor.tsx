import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  // Use refs to track current target vs actual position for lerp
  const mousePos = useRef({ x: -100, y: -100 });
  const outerPos = useRef({ x: -100, y: -100 });

  // Hover states
  const [hoverState, setHoverState] = useState<'normal' | 'button' | 'card' | 'swatch' | 'link'>('normal');
  const [swatchColor, setSwatchColor] = useState<string | null>(null);

  useEffect(() => {
    // Check if it's fine pointer and no touch
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFine || isTouch || prefersReducedMotion) return;

    setIsVisible(true);

    // Inject styles
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    const updateOuter = () => {
      // Lerp outer circle
      outerPos.current.x += (mousePos.current.x - outerPos.current.x) * 0.12;
      outerPos.current.y += (mousePos.current.y - outerPos.current.y) * 0.12;

      if (outerRef.current) {
        // Adjust for size based on state
        let offset = 18; // default 36px/2
        if (outerRef.current.classList.contains('cursor-button')) offset = 26; // 52px/2
        outerRef.current.style.transform = `translate(${outerPos.current.x - offset}px, ${outerPos.current.y - offset}px)`;
      }

      requestRef.current = requestAnimationFrame(updateOuter);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('button') || target.closest('[data-cursor="button"]')) {
        setHoverState('button');
        setSwatchColor(null);
      } else if (target.closest('.glass-card')) {
        setHoverState('card');
        setSwatchColor(null);
      } else if (target.closest('[style*="backgroundColor"]') || target.closest('[style*="background-color"]')) {
        const swatch = target.closest('[style*="backgroundColor"]') || target.closest('[style*="background-color"]');
        if (swatch) {
          setHoverState('swatch');
          setSwatchColor((swatch as HTMLElement).style.backgroundColor);
        }
      } else if (target.closest('a')) {
        setHoverState('link');
        setSwatchColor(null);
      } else {
        setHoverState('normal');
        setSwatchColor(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      // Ripple effect
      const ripple = document.createElement('div');
      ripple.style.position = 'fixed';
      ripple.style.left = `${e.clientX - 10}px`;
      ripple.style.top = `${e.clientY - 10}px`;
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.borderRadius = '50%';
      ripple.style.border = '2px solid rgba(119,141,169,0.8)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '9998';
      ripple.style.transition = 'all 0.5s ease-out';
      ripple.style.transform = 'scale(0)';
      document.body.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(3)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => {
        ripple.remove();
      }, 500);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('click', onClick);
    requestRef.current = requestAnimationFrame(updateOuter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('click', onClick);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      document.head.removeChild(style);
    };
  }, []);

  if (!isVisible) return null;

  let outerClasses = "fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-[width,height,box-shadow,background-color] duration-300";
  let outerStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    border: '1.5px solid rgba(119,141,169,0.6)',
  };

  if (hoverState === 'button') {
    outerClasses += " cursor-button";
    outerStyle.width = '52px';
    outerStyle.height = '52px';
    outerStyle.boxShadow = 'rgba(119,141,169,0.4) 0 0 15px';
  } else if (hoverState === 'card') {
    outerClasses += " animate-[pulse-cursor_1.5s_infinite]";
  } else if (hoverState === 'swatch' && swatchColor) {
    outerStyle.backgroundColor = swatchColor;
    outerStyle.opacity = 0.3;
    outerStyle.border = 'none';
  }

  return (
    <>
      <style>{`
        @keyframes pulse-cursor {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div 
        ref={outerRef} 
        className={outerClasses} 
        style={outerStyle} 
      />
      <div 
        ref={innerRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#D8E2F1] rounded-full pointer-events-none z-[9999] transition-transform duration-75"
      />
    </>
  );
}
