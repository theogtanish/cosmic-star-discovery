'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircleCheck, faCircleHalfStroke, faClock, faDatabase } from '@fortawesome/free-solid-svg-icons';

import CustomCursor from '../../components/CustomCursor';
import LoadingState from '../../components/LoadingState';
import StarHero from '../../components/StarHero';
import SupernovaCard from '../../components/SupernovaCard';
import AsteroidCard from '../../components/AsteroidCard';
import ApodCard from '../../components/ApodCard';
import NarrativeText from '../../components/NarrativeText';
import BorderGlow from '../../components/BorderGlow/BorderGlow';
import ShareDialog from '../../components/ShareDialog';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateStr = searchParams.get('date');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!dateStr) { router.push('/'); return; }

    // Check session cache
    const cached = sessionStorage.getItem(`star-${dateStr}`);
    if (cached) {
      setTimeout(() => {
        setData(JSON.parse(cached));
        setLoading(false);
      }, 0);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/discover?date=${dateStr}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }
        const result = await res.json();
        sessionStorage.setItem(`star-${dateStr}`, JSON.stringify(result));
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateStr, router]);

  if (loading) {
    return <LoadingState year={dateStr?.split('-')[0]} />;
  }

  if (error) {
    return (
      <div className="loading-container">
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-supernova)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 400 }}>
          {error}
        </div>
        <button className="btn-ghost" onClick={() => router.push('/')} style={{ marginTop: '2rem' }} data-hover>
          <FontAwesomeIcon icon={faArrowLeft} /> TRY AGAIN
        </button>
      </div>
    );
  }

  if (!data) return null;

  const dateLong = formatDateLong(dateStr);

  return (
    <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      {/* Nav */}
      <motion.div
        className="result-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button className="btn-ghost" onClick={() => router.push('/')} data-hover>
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '0.5rem' }} /> NEW SEARCH
        </button>

        <div className="result-nav-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-ghost" onClick={() => setIsShareOpen(true)} data-hover>
            <FontAwesomeIcon icon={faShareNodes} style={{ marginRight: '0.5rem' }} /> SHARE
          </button>
          <div className="badge">
            <span className="badge-dot" />
            {data.dataQuality === 'full' ? 'FULL DATA RETRIEVAL' : 'PARTIAL DATA'}
          </div>
        </div>
      </motion.div>

      <ShareDialog 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        data={data} 
        dateStr={dateStr} 
      />

      {/* Date Header */}
      <motion.div
        className="result-date-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <div className="result-date-text">{dateLong}</div>
        <div className="result-meta">
          <span className="result-meta-item">
            <FontAwesomeIcon icon={faDatabase} /> {data.sourcesResponded || 0}/{data.totalSources || 5} DATABASES
          </span>
          <span className="result-meta-item">
            <FontAwesomeIcon icon={faClock} /> {data.queryTimeMs ? `${(data.queryTimeMs / 1000).toFixed(1)}S` : '—'}
          </span>
          <span className="result-meta-item">
            <FontAwesomeIcon icon={data.dataQuality === 'full' ? faCircleCheck : faCircleHalfStroke} /> {data.dataQuality?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
      </motion.div>

      {/* Star Hero */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <BorderGlow glowColor="45 55 55" borderRadius={0} colors={['#C9A84C', '#E8C96A', '#8A6F2E']}>
          <StarHero star={data.primaryStar} />
        </BorderGlow>
      </motion.div>

      {/* Narrative - The Cosmic Story */}
      <motion.div
        className="section-block--lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="section-label">
          THE COSMIC STORY <span className="section-label-line" />
        </div>
        <NarrativeText narrative={data.narrative} />
      </motion.div>

      {/* Grid: Supernova + Asteroid */}
      <motion.div
        className="two-col"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="col-item">
          <div className="section-label">SUPERNOVA EVENTS</div>
          <BorderGlow glowColor="12 70 54" borderRadius={0} colors={['#E05A3A', '#FF7A5C', '#8C2F1A']}>
            <SupernovaCard supernova={data.supernova} />
          </BorderGlow>
        </div>
        <div className="col-item">
          <div className="section-label">NEO TRACKING</div>
          <BorderGlow glowColor="150 40 48" borderRadius={0} colors={['#4A9E6E', '#6FCB9F', '#2D6143']}>
            <AsteroidCard asteroid={data.asteroid} />
          </BorderGlow>
        </div>
      </motion.div>

      {/* APOD */}
      <motion.div
        className="section-block--lg"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-label">CELESTIAL CAPTURE</div>
        <BorderGlow glowColor="210 34 54" borderRadius={0} colors={['#4A7AB5', '#7BA8D9', '#2E4C70']}>
          <ApodCard apod={data.apodImage} />
        </BorderGlow>
      </motion.div>
    </div>
  );
}

export default function ResultView() {
  return <ResultContent />;
}

function formatDateLong(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}
