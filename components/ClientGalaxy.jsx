'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Galaxy = dynamic(() => import('./Galaxy/Galaxy'), { ssr: false });

export default function ClientGalaxy() {
  const [isWarpSpeed, setIsWarpSpeed] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [density, setDensity] = useState(0.2); // Low density initially

  useEffect(() => {
    const initGalaxy = () => {
      setShouldRender(true);
      // Ramp up density after initial render
      setTimeout(() => setDensity(0.8), 2500);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(initGalaxy, { timeout: 2000 });
    } else {
      setTimeout(initGalaxy, 500);
    }
  }, []);

  useEffect(() => {
    const handleWarpStart = () => setIsWarpSpeed(true);
    const handleWarpEnd = () => setIsWarpSpeed(false);

    window.addEventListener('warp-speed-start', handleWarpStart);
    window.addEventListener('warp-speed-end', handleWarpEnd);

    return () => {
      window.removeEventListener('warp-speed-start', handleWarpStart);
      window.removeEventListener('warp-speed-end', handleWarpEnd);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#020408' }}>
      {shouldRender && (
        <Galaxy
          mouseRepulsion={!isWarpSpeed}
          mouseInteraction={!isWarpSpeed}
          density={density}
          glowIntensity={0.3}
          saturation={0.2}
          hueShift={170}
          twinkleIntensity={0.2}
          rotationSpeed={isWarpSpeed ? 0.3 : 0.05}
          repulsionStrength={isWarpSpeed ? 4 : 1.5}
          autoCenterRepulsion={isWarpSpeed ? 1 : 0}
          starSpeed={isWarpSpeed ? 2.5 : 0.4}
          speed={isWarpSpeed ? 3.0 : 1}
        />
      )}
    </div>
  );
}
