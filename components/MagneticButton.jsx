'use client';
import { useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export default function MagneticButton({ children, onClick, disabled, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (disabled || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance < 80) {
      x.set(deltaX * 0.35);
      y.set(deltaY * 0.35);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={`btn-magnetic ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{ 
        x, y,
        background: 'var(--gold-pure)',
        color: 'var(--bg-void)',
        border: 'none',
        borderRadius: '0',
        padding: '0.75rem 2.5rem',
        fontFamily: 'var(--font-label)',
        fontSize: '1.25rem',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        boxShadow: '0 0 40px rgba(201,168,76,0.2)'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      data-hover
    >
      {children}
    </motion.button>
  );
}
