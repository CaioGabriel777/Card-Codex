'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';

interface CardTiltProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

/**
 * Holographic 3D tilt effect for the card image.
 * Uses direct DOM manipulation via refs for high performance 60fps rendering,
 * avoiding React state re-renders on mousemove.
 */
export default function CardTilt({ imageUrl, alt, className = '' }: CardTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    let bounds = card.getBoundingClientRect();
    
    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'none';
      glare.style.transition = 'none';
      glare.style.opacity = '1';
    };

    const onMouseLeave = () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      
      glare.style.transition = 'opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      glare.style.opacity = '0';
    };

    const onMouseMove = (e: MouseEvent) => {
      // Respect prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      
      const xPct = mouseX / bounds.width - 0.5;
      const yPct = mouseY / bounds.height - 0.5;
      
      const xTilt = yPct * -20; // max 10 deg
      const yTilt = xPct * 20;  // max 10 deg

      card.style.transform = `perspective(1000px) rotateX(${xTilt}deg) rotateY(${yTilt}deg) scale3d(1.02, 1.02, 1.02)`;

      // Calculate holographic glare position
      const bgX = 50 + xPct * 50;
      const bgY = 50 + yPct * 50;
      glare.style.background = `radial-gradient(circle at ${bgX}% ${bgY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`;
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mouseleave', onMouseLeave);
    card.addEventListener('mousemove', onMouseMove);

    // Update bounds on resize/scroll
    const onScrollResize = () => { bounds = card.getBoundingClientRect(); };
    window.addEventListener('resize', onScrollResize);
    window.addEventListener('scroll', onScrollResize, { passive: true });

    return () => {
      card.removeEventListener('mouseenter', onMouseEnter);
      card.removeEventListener('mouseleave', onMouseLeave);
      card.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onScrollResize);
      window.removeEventListener('scroll', onScrollResize);
    };
  }, []);

  return (
    <div className={`relative perspective-1000 ${className}`}>
      <div 
        ref={cardRef} 
        className="relative w-full aspect-[0.686] rounded-[4%] shadow-2xl preserve-3d will-change-transform bg-brand-surface-2"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover rounded-[4%] backface-hidden"
        />
        {/* Holographic Glare Layer */}
        <div 
          ref={glareRef}
          className="absolute inset-0 rounded-[4%] opacity-0 pointer-events-none mix-blend-overlay z-10"
        />
      </div>
    </div>
  );
}
