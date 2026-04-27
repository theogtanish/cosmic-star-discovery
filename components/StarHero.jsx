'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import SectionLabel from './SectionLabel';
import StatGrid from './StatGrid';
import { fadeUp, revealChar } from '../lib/animations';
import { useIntersection } from '../hooks/useIntersection';
import VariableProximity from './VariableProximity/VariableProximity';

export default function StarHero({ star }) {
  const [ref, isVisible] = useIntersection({ threshold: 0.2 });
  const containerRef = useRef(null);

  if (!star) return null;

  const name = star.hostStar || 'Unknown Star';
  const chars = name.split('');

  const stats = [
    { label: 'Distance', value: star.distance?.lightyears || '—', unit: 'ly', numeric: !!star.distance?.lightyears, decimals: 1 },
    { label: 'Spectral', value: star.spectralType || '—' },
    { label: 'Temperature', value: star.temperature || '—', unit: 'K', numeric: !!star.temperature, decimals: 0 },
    { label: 'Radius', value: star.radius || '—', unit: 'R☉', numeric: !!star.radius, decimals: 2 },
    { label: 'Mass', value: star.mass || '—', unit: 'M☉', numeric: !!star.mass, decimals: 2 },
    { label: 'Age', value: star.age || '—', unit: 'Gyr', numeric: !!star.age, decimals: 1 },
  ];

  const discoveredText = formatDiscovery(star.discoveredDate);
  const telescope = star.telescope || 'Unknown';
  const constellation = star.constellation || 'Unknown';

  return (
    <div className="star-hero" ref={ref} style={{ padding: '4rem 3rem' }}>
      <div className="star-hero-glow" />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="section-label" style={{ marginBottom: '2rem' }}>
          PRIMARY CELESTIAL DISCOVERY <span className="section-label-line" />
        </div>

        <div ref={containerRef} className="star-name-container" style={{ minHeight: '120px', display: 'flex', alignItems: 'center' }}>
          <span className="text-highlight" style={{ padding: '0 0.1em' }}>
            <VariableProximity
              label={name}
              containerRef={containerRef}
              fromFontVariationSettings="'wght' 300, 'ital' 1"
              toFontVariationSettings="'wght' 800, 'ital' 1"
              radius={200}
              falloff="linear"
              className="star-name-variable"
            />
          </span>
        </div>

        <motion.div
          className="star-subtitle"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 0.7 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.85rem', 
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '3rem'
          }}
        >
          Host of {star.name} &bull; {constellation.toUpperCase()} CONSTELLATION
        </motion.div>

        <StatGrid stats={stats} />

        <motion.div 
          style={{ 
            display: 'flex', 
            gap: '3rem', 
            marginTop: '3.5rem', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.7rem', 
            color: 'var(--text-tertiary)',
            letterSpacing: '0.1em'
          }}
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1 }}
        >
          <span><strong style={{ color: 'var(--text-secondary)' }}>MISSION:</strong> {telescope.toUpperCase()}</span>
          <span><strong style={{ color: 'var(--text-secondary)' }}>DISCOVERY:</strong> {discoveredText.toUpperCase()}</span>
        </motion.div>
      </div>
    </div>
  );
}

function formatDiscovery(d) {
  if (!d) return 'Unknown';
  if (/^\d{4}-\d{2}$/.test(d)) {
    const date = new Date(d + '-01T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
  if (/^\d{4}\/\d{2}$/.test(d)) {
    const [y, m] = d.split('/');
    return new Date(`${y}-${m}-01T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
  return d;
}
