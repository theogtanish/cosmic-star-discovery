'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import CustomCursor from '../components/CustomCursor';
import DateInput from '../components/DateInput';
import MagneticButton from '../components/MagneticButton';

export default function HomePage() {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDiscover = () => {
    if (!date) { setError('Please select a date'); return; }
    setError('');
    router.push(`/result?date=${date}`);
  };

  return (
    <>
      <CustomCursor />

      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <motion.div
          style={{ textAlign: 'center', maxWidth: 640, width: '100%' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="badge-dot" />
            5 ASTRONOMICAL DATABASES
          </motion.div>

          {/* Title */}
          <motion.div
            style={{ marginTop: '3rem', marginBottom: '2rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <h1 style={{ lineHeight: '0.85', marginBottom: '0.5rem' }}>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-hero)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}>
                Star
              </span>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-hero)',
                fontWeight: 800,
                color: 'var(--gold-pure)',
                textShadow: '0 0 80px rgba(201,168,76,0.3)',
                marginTop: '-0.1em'
              }}>
                Discovery
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              marginBottom: '4rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.8
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.8 }}
          >
            What did the universe discover on your day?
          </motion.p>

          {/* Form */}
          <motion.div
            style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <DateInput value={date} onChange={setDate} />
            <MagneticButton onClick={handleDiscover}>
              DISCOVER <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '0.5rem' }} />
            </MagneticButton>
          </motion.div>

          {error && (
            <motion.div 
              className="form-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Hint */}
          <motion.p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1rem',
              color: 'var(--text-tertiary)',
              marginTop: '4rem',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            Try your birthday, an anniversary, or any date from 1900–today
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
