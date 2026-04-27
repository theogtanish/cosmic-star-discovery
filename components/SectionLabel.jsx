'use client';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useIntersection } from '../hooks/useIntersection';
import { drawLine } from '../lib/animations';

export default function SectionLabel({ icon, text, color }) {
  const [ref, isVisible] = useIntersection({ threshold: 0.3 });

  return (
    <div className="section-label" ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--gold-pure)', textTransform: 'uppercase' }}>
        {text}
      </span>
      <motion.div
        className="section-label-line"
        style={{ height: '1px', background: 'var(--border-dim)', flex: 1, originX: 0 }}
        initial={{ scaleX: 0 }}
        animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
