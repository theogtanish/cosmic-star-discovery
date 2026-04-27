'use client';
import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const animate = () => {
      // Direct DOM update for dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // Smooth ring follow
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch]);

  // Track hoverable elements
  useEffect(() => {
    const onOver = (e) => {
      if (e.target.closest('button, a, input, [data-hover]')) setHovering(true);
    };
    const onOut = () => setHovering(false);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => { document.removeEventListener('mouseover', onOver); document.removeEventListener('mouseout', onOut); };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999, willChange: 'transform' }} />
      <div ref={ringRef} className={`cursor-ring${hovering ? ' hovering' : ''}`} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9998, willChange: 'transform' }} />
    </>
  );
}
