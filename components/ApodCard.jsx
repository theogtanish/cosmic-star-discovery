'use client';
import { motion } from 'framer-motion';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import SectionLabel from './SectionLabel';
import { fadeUp } from '../lib/animations';
import { useIntersection } from '../hooks/useIntersection';

export default function ApodCard({ apod }) {
  const [ref, isVisible] = useIntersection();

  if (!apod) return null;

  const imgUrl = apod.hdUrl || apod.url;
  const isVideo = apod.mediaType === 'video';

  return (
    <motion.div
      ref={ref}
      className="card"
      variants={fadeUp}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div className="apod-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        {!isVideo && imgUrl && (
          <div className="apod-image-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
            <img 
              src={imgUrl} 
              alt={apod.title} 
              fetchPriority="high"
              loading="eager"
              decoding="async"
              style={{ width: '100%', height: 'auto', display: 'block', border: '1px solid var(--border-dim)' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="section-label" style={{ marginBottom: '1rem' }}>NASA APOD DATA</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: '1.2' }}>{apod.title}</h3>
          
          {apod.explanation && (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', fontStyle: 'italic', opacity: 0.8 }}>
              {apod.explanation.length > 350 ? apod.explanation.slice(0, 350) + '...' : apod.explanation}
            </p>
          )}
          
          {imgUrl && (
            <a
              href={imgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ alignSelf: 'flex-start', border: '1px solid var(--border-dim)', padding: '0.6rem 1.5rem', fontSize: '0.75rem', letterSpacing: '0.1em' }}
              data-hover
            >
              ACCESS FULL SPECTRUM DATA
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
