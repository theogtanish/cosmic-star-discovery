'use client';
import { motion } from 'framer-motion';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';
import SectionLabel from './SectionLabel';
import { fadeUp } from '../lib/animations';
import { useIntersection } from '../hooks/useIntersection';

export default function AsteroidCard({ asteroid }) {
  const [ref, isVisible] = useIntersection();

  if (!asteroid) return (
    <div className="card">
      <div className="section-label">NEO TRACKING</div>
      <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '1.5rem', letterSpacing: '0.1em' }}>NO PROXIMITY DATA CAPTURED FOR THIS PERIOD</p>
    </div>
  );

  const stats = [
    { label: 'Object ID', value: asteroid.designation },
    { label: 'Orbit Class', value: asteroid.orbitType || 'UNKNOWN' },
    { label: 'Discovery', value: asteroid.discoveryDate || 'N/A' },
    { label: 'Status', value: 'CATALOGUED' },
  ];

  return (
    <motion.div
      ref={ref}
      className="card"
      variants={fadeUp}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
    >
      <div className="section-label" style={{ marginBottom: '2rem' }}>NEO TRACKING</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border-dim)' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', background: 'transparent', borderBottom: '1px solid var(--border-dim)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{stat.label}</span>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '1rem', color: 'var(--gold-pure)', letterSpacing: '0.05em' }}>{stat.value?.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 10px #4CAF50' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>ORBITAL PATH STABLE</span>
      </div>
    </motion.div>
  );
}
