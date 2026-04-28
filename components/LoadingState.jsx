'use client';
import { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
  'Querying NASA Exoplanet Archive...',
  'Scanning supernova catalog...',
  'Checking JPL asteroid database...',
  'Enriching via SIMBAD...',
  'Cross-referencing discoveries...',
  'Building your story...',
];

export default function LoadingState({ date }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const year = date ? new Date(date).getFullYear() : '';

  useEffect(() => {
    // Trigger warp speed galaxy effect
    window.dispatchEvent(new Event('warp-speed-start'));

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % STATUS_MESSAGES.length);
        setVisible(true);
      }, 200);
    }, 1800);

    return () => {
      clearInterval(interval);
      // End warp speed
      window.dispatchEvent(new Event('warp-speed-end'));
    };
  }, []);

  return (
    <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '3rem' }}>


      <div style={{ textAlign: 'center' }}>
        <h2 className="loading-headline" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Initializing {year || '...'} <span className="text-highlight">Observatories</span>
        </h2>
        
        <div className="loading-status-wrap" style={{ height: '1.5rem', overflow: 'hidden' }}>
          <p className="loading-status" style={{ 
            opacity: visible ? 0.7 : 0, 
            transition: 'opacity 0.2s ease',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--gold-pure)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}>
            {STATUS_MESSAGES[msgIdx]}
          </p>
        </div>
      </div>


    </div>
  );
}
