'use client';
import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default function DateInput({ value, onChange, onSubmit }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <div
      className={`date-input-wrapper ${focused ? 'focused' : ''}`}
      onClick={() => {
        if (inputRef.current) {
          try {
            if (typeof inputRef.current.showPicker === 'function') {
              inputRef.current.showPicker();
            } else {
              // Fallback for older browsers / iOS
              inputRef.current.focus();
              inputRef.current.click();
            }
          } catch (e) {
            inputRef.current.focus();
            inputRef.current.click();
          }
        }
      }}
      style={{ 
        cursor: 'pointer',
        padding: '0.75rem 1.5rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.4s var(--ease-out-expo)',
        position: 'relative'
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gold-pure)', letterSpacing: '0.2em', pointerEvents: 'none' }}>
        Date
      </div>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        max={new Date().toISOString().split('T')[0]}
        min="1900-01-01"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '1rem',
          outline: 'none',
          cursor: 'pointer',
          flex: 1,
          width: '100%',
          height: '100%',
          minHeight: '2.5rem',
          WebkitAppearance: 'none' // Sometimes helps on iOS to reset default styles
        }}
      />
    </div>
  );
}
