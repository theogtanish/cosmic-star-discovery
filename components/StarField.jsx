'use client';
import { useEffect, useRef } from 'react';
import { useMousePosition } from '../hooks/useMousePosition';

export default function StarField() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width, height;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createStars() {
      const stars = [];
      // Layer 1: far — 300 tiny dim stars
      for (let i = 0; i < 300; i++) {
        stars.push({
          x: Math.random() * width, y: Math.random() * height,
          size: 0.5, opacity: Math.random() * 0.3 + 0.1,
          speed: 0.02, parallax: 0.01,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
      // Layer 2: mid — 150 medium stars
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * width, y: Math.random() * height,
          size: 1, opacity: Math.random() * 0.3 + 0.3,
          speed: 0.05, parallax: 0.025,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
      // Layer 3: near — 50 bright stars
      for (let i = 0; i < 50; i++) {
        stars.push({
          x: Math.random() * width, y: Math.random() * height,
          size: Math.random() * 0.5 + 1.5, opacity: Math.random() * 0.2 + 0.7,
          speed: 0.1, parallax: 0.05,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    }

    function animate() {
      const now = performance.now() * 0.001;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = width / 2;
      const cy = height / 2;

      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, width, height);

      for (const s of starsRef.current) {
        const twinkle = Math.sin(now * 1.5 + s.twinkle) * 0.15;
        const opacity = Math.max(0, Math.min(1, s.opacity + twinkle));

        // Mouse parallax offset
        const px = (mx - cx) * s.parallax * 0.05;
        const py = (my - cy) * s.parallax * 0.05;

        // Gentle upward drift
        s.y -= s.speed;
        if (s.y < -5) { s.y = height + 5; s.x = Math.random() * width; }

        const drawX = s.x + px;
        const drawY = s.y + py;

        ctx.beginPath();
        ctx.arc(drawX, drawY, s.size, 0, Math.PI * 2);
        
        // Add subtle gold tint to larger stars
        if (s.size > 1.2) {
          ctx.fillStyle = `rgba(201, 168, 76, ${opacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(201, 168, 76, 0.4)';
        } else {
          ctx.fillStyle = `rgba(220, 230, 245, ${opacity})`;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for next iteration
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    createStars();
    animate();

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); createStars(); }, 200);
    };
    window.addEventListener('resize', onResize);

    const onVisChange = () => {
      if (document.hidden) { cancelAnimationFrame(rafRef.current); }
      else { rafRef.current = requestAnimationFrame(animate); }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  return <canvas ref={canvasRef} id="starfield-canvas" />;
}
