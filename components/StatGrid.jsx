'use client';
import { useEffect, useState, useRef } from 'react';
import { useIntersection } from '../hooks/useIntersection';

function CountUp({ end, duration = 1.5, decimals = 0 }) {
  const [value, setValue] = useState(0);
  const [ref, isVisible] = useIntersection({ threshold: 0.5 });
  const started = useRef(false);

  useEffect(() => {
    if (!isVisible || started.current) return;
    started.current = true;
    const num = parseFloat(end);
    if (isNaN(num)) {
      setTimeout(() => setValue(end), 0);
      return;
    }

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) { setValue(num); return; }
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValue(num * eased);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  const display = typeof value === 'number'
    ? value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
    : value;

  return <span ref={ref}>{display}</span>;
}

export default function StatGrid({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0' }}>
      {stats.map((s, i) => (
        <div className="stat-item" key={i} style={{ padding: '1.5rem', borderRight: '1px solid var(--border-dim)', borderBottom: '1px solid var(--border-dim)' }}>
          <div className="stat-value" style={{ fontFamily: 'var(--font-label)', fontSize: '1.75rem', color: 'var(--gold-pure)', letterSpacing: '0.05em' }}>
            {s.numeric
              ? <CountUp end={s.value} decimals={s.decimals || 0} />
              : s.value
            }
            {s.unit && <span className="stat-unit" style={{ fontSize: '0.65rem', marginLeft: '0.2rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>{s.unit.toUpperCase()}</span>}
          </div>
          <div className="stat-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
