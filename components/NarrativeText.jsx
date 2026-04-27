'use client';
import { motion } from 'framer-motion';
import { faFeather } from '@fortawesome/free-solid-svg-icons';
import SectionLabel from './SectionLabel';
import { staggerContainer, staggerItem } from '../lib/animations';
import { useIntersection } from '../hooks/useIntersection';

export default function NarrativeText({ narrative }) {
  const [ref, isVisible] = useIntersection({ threshold: 0.1 });

  if (!narrative) return null;

  const paragraphs = narrative.split('\n\n').filter(Boolean);

  return (
    <div className="section-block--lg narrative-section" ref={ref}>
      <SectionLabel icon={faFeather} text="YOUR COSMIC STORY" color="var(--text-secondary)" />

      <motion.div
        className="narrative-text"
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {paragraphs.map((p, i) => (
          <motion.p key={i} variants={staggerItem}>
            {p}
          </motion.p>
        ))}
      </motion.div>
    </div>
  );
}
