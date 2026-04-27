'use client';
import { motion } from 'framer-motion';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import SectionLabel from './SectionLabel';
import { fadeUp } from '../lib/animations';
import { useIntersection } from '../hooks/useIntersection';

export default function SupernovaCard({ supernova }) {
  const [ref, isVisible] = useIntersection();

  if (!supernova) return (
    <div className="card">
      <div className="section-label">SUPERNOVA EVENTS</div>
      <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '1.5rem', letterSpacing: '0.1em' }}>NO STELLAR COLLAPSE DETECTED IN THIS REGION</p>
    </div>
  );

  const stats = [
    { label: 'Event ID', value: supernova.name },
    { label: 'Classification', value: supernova.type ? `TYPE ${supernova.type}` : 'UNKNOWN' },
    { label: 'Host System', value: supernova.hostGalaxy || 'UNSPECIFIED' },
    { label: 'Intensity', value: supernova.magnitude != null ? String(supernova.magnitude) : '—' },
  ];

  return (
    <motion.div
      ref={ref}
      className="card"
      variants={fadeUp}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
    >
      <div className="section-label" style={{ marginBottom: '2rem' }}>SUPERNOVA EVENTS</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border-dim)' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', background: 'transparent', borderBottom: '1px solid var(--border-dim)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{stat.label}</span>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '1rem', color: 'var(--gold-pure)', letterSpacing: '0.05em' }}>{stat.value?.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {supernova.note && (
        <div style={{ 
          marginTop: '2rem', 
          fontFamily: 'var(--font-display)', 
          fontStyle: 'italic', 
          fontSize: '0.9rem', 
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
          opacity: 0.8
        }}>
          &quot;{supernova.note}&quot;
        </div>
      )}
    </motion.div>
  );
}
